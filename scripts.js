document.addEventListener('DOMContentLoaded', () => {
    const urlBase = "http://localhost:3000";

    // Elementos da UI
    const feed = document.getElementById('feed');
    const listaDePostagensDiv = document.getElementById('listaDePostagens');
    const visualizacaoPostagemDiv = document.getElementById('visualizacaoPostagem');

    const postTitulo = document.getElementById('postTitulo');
    const postTexto = document.getElementById('postTexto');
    const postCurtidas = document.getElementById('postCurtidas');
    const listaComentarios = document.getElementById('listaComentarios');

    const botaoVoltar = document.getElementById('botaoVoltar');
    const botaoPostar = document.getElementById('botaoPostar');
    const botaoCurtir = document.getElementById('botaoCurtir');
    const botaoEditar = document.getElementById('botaoEditar');
    const botaoExcluir = document.getElementById('botaoExcluir');
    const botaoComentar = document.getElementById('botaoComentar');
    
    const areaEdicao = document.getElementById('areaEdicao');
    const textoEdicao = document.getElementById('textoEdicao');
    const botaoSalvarEdicao = document.getElementById('botaoSalvarEdicao');

    let idPostagemAtual = null;

    // --- FUNÇÕES PRINCIPAIS ---

    // 5.1) Carrega e exibe todas as postagens no feed inicial
    async function carregarPostagens() {
        try {
            const response = await fetch(`${urlBase}/postagens`);
            const postagens = await response.json();
            
            feed.innerHTML = ''; // Limpa o feed antes de adicionar as novas postagens
            postagens.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post-item';
                postElement.innerHTML = `<p>${post.texto.substring(0, 150)}...</p><small>Curtidas: ${post.curtidas}</small>`;
                postElement.addEventListener('click', () => visualizarPostagem(post.id));
                feed.appendChild(postElement);
            });
        } catch (error) {
            console.error("Erro ao carregar postagens:", error);
            feed.innerHTML = "Não foi possível carregar as postagens.";
        }
    }

    // Exibe uma postagem específica e seus comentários
    async function visualizarPostagem(id) {
        try {
            idPostagemAtual = id;
            const response = await fetch(`${urlBase}/postagens/${id}`);
            if (!response.ok) throw new Error('Postagem não encontrada.');
            
            const post = await response.json();

            // Preenche os detalhes da postagem
            postTitulo.innerText = `Postagem #${post.id}`;
            postTexto.innerText = post.texto;
            postCurtidas.innerText = post.curtidas;
            
            // Troca a visibilidade das divs
            listaDePostagensDiv.classList.add('hidden');
            visualizacaoPostagemDiv.classList.remove('hidden');

            // 4) Carrega os comentários da postagem
            await carregarComentarios(id);

        } catch (error) {
            console.error("Erro ao buscar postagem:", error);
            alert(error.message);
        }
    }

    // Carrega e exibe os comentários de uma postagem
    async function carregarComentarios(idPost) {
        try {
            const response = await fetch(`${urlBase}/postagens/${idPost}/comentarios`);
            const comentarios = await response.json();
            
            listaComentarios.innerHTML = '';
            if (comentarios.length === 0) {
                listaComentarios.innerHTML = "<p>Seja o primeiro a comentar!</p>";
            } else {
                comentarios.forEach(comentario => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    const dataFormatada = new Date(comentario.data_criacao).toLocaleString('pt-BR');
                    commentElement.innerHTML = `<p>${comentario.texto}</p><small>Em: ${dataFormatada}</small>`;
                    listaComentarios.appendChild(commentElement);
                });
            }
        } catch (error) {
            console.error("Erro ao carregar comentários:", error);
        }
    }

    // Volta para a tela de lista de postagens
    function voltarParaLista() {
        idPostagemAtual = null;
        visualizacaoPostagemDiv.classList.add('hidden');
        listaDePostagensDiv.classList.remove('hidden');
        areaEdicao.classList.add('hidden'); // Esconde a área de edição ao voltar
        carregarPostagens(); // Recarrega a lista para refletir possíveis mudanças
    }

    // --- EVENT LISTENERS PARA OS BOTÕES ---

    botaoVoltar.addEventListener('click', voltarParaLista);

    // Cria uma nova postagem
    botaoPostar.addEventListener('click', async () => {
        const texto = document.getElementById('textoNovaPostagem').value;
        if (!texto) {
            alert("Por favor, escreva algo para postar.");
            return;
        }

        try {
            await fetch(`${urlBase}/postagens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto: texto })
            });
            document.getElementById('textoNovaPostagem').value = ''; // Limpa o campo
            carregarPostagens(); // Atualiza a lista
        } catch (error) {
            console.error("Erro ao postar:", error);
        }
    });

    // 3) Exclui a postagem atual com confirmação
    botaoExcluir.addEventListener('click', async () => {
        // Pede confirmação ao usuário
        const confirmado = window.confirm("Você tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.");
        if (confirmado && idPostagemAtual) {
            try {
                await fetch(`${urlBase}/postagens/${idPostagemAtual}`, { method: 'DELETE' });
                alert("Postagem excluída com sucesso!");
                voltarParaLista();
            } catch (error) {
                console.error("Erro ao excluir:", error);
            }
        }
    });

    // 2) Adiciona um novo comentário
    botaoComentar.addEventListener('click', async () => {
        const textoComentario = document.getElementById('textoNovoComentario').value;
        if (!textoComentario || !idPostagemAtual) return;

        try {
            await fetch(`${urlBase}/postagens/${idPostagemAtual}/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto: textoComentario })
            });
            document.getElementById('textoNovoComentario').value = ''; // Limpa o campo
            carregarComentarios(idPostagemAtual); // Recarrega apenas os comentários
        } catch (error) {
            console.error("Erro ao comentar:", error);
        }
    });

    // 5.3) Curte a postagem atual
    botaoCurtir.addEventListener('click', async () => {
        if (!idPostagemAtual) return;
        try {
            const response = await fetch(`${urlBase}/postagens/${idPostagemAtual}/curtir`, { method: 'POST' });
            const postAtualizado = await response.json();
            postCurtidas.innerText = postAtualizado.curtidas;
        } catch (error) {
            console.error("Erro ao curtir:", error);
        }
    });

    // 5.2) Habilita o modo de edição
    botaoEditar.addEventListener('click', () => {
        textoEdicao.value = postTexto.innerText; // Preenche o textarea com o texto atual
        areaEdicao.classList.remove('hidden');
    });

    // Salva as alterações da edição
    botaoSalvarEdicao.addEventListener('click', async () => {
        const novoTexto = textoEdicao.value;
        if (!novoTexto || !idPostagemAtual) return;
        
        try {
            const response = await fetch(`${urlBase}/postagens/${idPostagemAtual}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto: novoTexto })
            });
            const postAtualizado = await response.json();
            
            postTexto.innerText = postAtualizado.texto; // Atualiza o texto na tela
            areaEdicao.classList.add('hidden'); // Esconde a área de edição
            alert("Postagem atualizada com sucesso!");

        } catch (error) {
            console.error("Erro ao salvar edição:", error);
        }
    });


    
    carregarPostagens();
});