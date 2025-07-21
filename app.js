"use strict";
const express = require("express");
const cors = require("cors"); // Importa o CORS para permitir requisições do frontend
const { setup } = require('./database.js');

const app = express();
app.use(express.json());
app.use(cors()); // Habilita o CORS para todas as rotas

// Armazena a conexão com o banco de dados para ser usada nas rotas
let db;

// Conecta ao banco de dados assim que o servidor inicia
setup().then((database) => {
    db = database;
}).catch(err => {
    console.error("Erro ao conectar ao banco de dados:", err);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// --- ROTAS DE POSTAGENS ---

// 5.1) FUNCIONALIDADE: Listar todas as postagens
app.get("/postagens", async (request, response) => {
    const postagens = await db.all("SELECT * FROM postagens ORDER BY data_criacao DESC");
    response.status(200).json(postagens);
});

// Buscar uma única postagem por ID
app.get("/postagens/:id", async (request, response) => {
    const id = request.params.id;
    const postagem = await db.get("SELECT * FROM postagens WHERE id = ?", [id]);
    
    if (postagem) {
        response.status(200).json(postagem);
    } else {
        response.status(404).json({ mensagem: "Postagem não encontrada." });
    }
});

// Criar nova postagem
app.post("/postagens", async (request, response) => {
    const { texto } = request.body;
    if (!texto) {
        return response.status(400).json({ mensagem: "O texto da postagem é obrigatório." });
    }

    const result = await db.run("INSERT INTO postagens (texto) VALUES (?)", [texto]);
    const novaPostagem = await db.get("SELECT * FROM postagens WHERE id = ?", [result.lastID]);

    response.status(201).json(novaPostagem);
});

// 3) Excluir uma postagem
app.delete("/postagens/:id", async (request, response) => {
    const id = request.params.id;
    const result = await db.run("DELETE FROM postagens WHERE id = ?", [id]);

    if (result.changes > 0) {
        response.status(200).json({ mensagem: "Postagem excluída com sucesso." });
    } else {
        response.status(404).json({ mensagem: "Postagem não encontrada." });
    }
});

// 5.2) FUNCIONALIDADE: Editar uma postagem
app.put("/postagens/:id", async (request, response) => {
    const id = request.params.id;
    const { texto } = request.body;
    
    const result = await db.run("UPDATE postagens SET texto = ? WHERE id = ?", [texto, id]);

    if (result.changes > 0) {
        const postagemAtualizada = await db.get("SELECT * FROM postagens WHERE id = ?", [id]);
        response.status(200).json(postagemAtualizada);
    } else {
        response.status(404).json({ mensagem: "Postagem não encontrada." });
    }
});

// 5.3) FUNCIONALIDADE: Curtir uma postagem
app.post("/postagens/:id/curtir", async (request, response) => {
    const id = request.params.id;
    await db.run("UPDATE postagens SET curtidas = curtidas + 1 WHERE id = ?", [id]);
    const postagemAtualizada = await db.get("SELECT * FROM postagens WHERE id = ?", [id]);

    if(postagemAtualizada) {
        response.status(200).json(postagemAtualizada);
    } else {
        response.status(404).json({ mensagem: "Postagem não encontrada."});
    }
});


// Item 2 e 4

// Adicionar um comentário a uma postagem
app.post("/postagens/:id/comentarios", async (request, response) => {
    const id_postagem = request.params.id;
    const { texto } = request.body;

    if (!texto) {
        return response.status(400).json({ mensagem: "O texto do comentário é obrigatório." });
    }

    const result = await db.run("INSERT INTO comentarios (id_postagem, texto) VALUES (?, ?)", [id_postagem, texto]);
    const novoComentario = await db.get("SELECT * FROM comentarios WHERE id = ?", [result.lastID]);

    response.status(201).json(novoComentario);
});

// 4) Listar comentários de uma postagem (em ordem decrescente de data)
app.get("/postagens/:id/comentarios", async (request, response) => {
    const id_postagem = request.params.id;
    const comentarios = await db.all(
        "SELECT * FROM comentarios WHERE id_postagem = ? ORDER BY data_criacao DESC", 
        [id_postagem]
    );
    response.status(200).json(comentarios);
});