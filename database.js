const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

async function setup() {
    // Abre a conexão com o arquivo do banco de dados (será criado se não existir)
    const db = await sqlite.open({
        filename: './socialifpi.db',
        driver: sqlite3.Database
    });

    // Executa o script para criar as tabelas, apenas se elas não existirem.
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS postagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            texto TEXT NOT NULL,
            curtidas INTEGER DEFAULT 0,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS comentarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_postagem INTEGER NOT NULL,
            texto TEXT NOT NULL,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_postagem) REFERENCES postagens (id) ON DELETE CASCADE
        );
    `);
    // ON DELETE CASCADE: Garante que se uma postagem for deletada, todos os seus comentários também serão.

    return db;
}

module.exports = { setup };