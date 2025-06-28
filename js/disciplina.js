document.addEventListener('DOMContentLoaded', function() {

    // =================================================================
    // BANCO DE DADOS FICTÍCIO COM TODOS OS BLOCOS RESTAURADOS
    // =================================================================
    const bancoDeDadosFicticio = {
        alunos: [
            { id: 1, nome: "Ana Silva", nivel: 15, avatar: 'img/ana.jpg', pontos: 1250, medalhas: [{nome: 'Melhor Argumento', icon: 'bi-lightbulb-fill'}] },
            { id: 2, nome: "Bruno Costa", nivel: 8, avatar: 'img/aluno.jpg', pontos: 450, medalhas: [] },
            { id: 3, nome: "Carla Dias", nivel: 11, avatar: 'img/carla.jpg', pontos: 780, medalhas: [{nome: 'Debatedora da Semana', icon: 'bi-chat-quote-fill'}] },
            { id: 0, nome: "Sentinela UNIka", nivel: 99, avatar: 'img/logo.png', pontos: null, medalhas: [] }
        ],
        disciplinas: [
            {
                id: 101, nome: "Cálculo I",
                blocos: [
                    // LISTA COMPLETA DE BLOCOS
                    { id: 1, titulo: "Comece Aqui", icone: "bi-flag-fill", conteudo: `<p class="fs-5">Boas-vindas à disciplina de Cálculo I! Explore o plano de ensino e prepare-se para a jornada.</p>` },
                    { id: 2, titulo: "Aulas ao Vivo", icone: "bi-camera-video-fill", conteudo: `<p class="fs-5">Acesse aqui as gravações de todas as aulas ao vivo.</p>` },
                    { id: 3, titulo: "Unidade 1 - Limites", icone: "bi-arrow-right-circle-fill", conteudo: `<div class="video-player-wrapper shadow-sm"><iframe src="https://www.youtube.com/embed/4_zZ_4qGSA8" title="YouTube video player" frameborder="0" allowfullscreen></iframe></div>` },
                    { id: 4, titulo: "Unidade 2 - Derivadas", icone: "bi-graph-up-arrow", conteudo: `<p class="fs-5">Conteúdo da Unidade 2 sobre Derivadas será disponibilizado aqui.</p>` },
                    { id: 5, titulo: "Estudo de Caso", icone: "bi-file-earmark-text-fill", conteudo: `<div class="p-4 border rounded bg-light"><h4 class="mb-3">Entrega do Estudo de Caso</h4><p>Leia o material de apoio e, em seguida, envie seu trabalho finalizado no formato PDF.</p><div class="input-group mt-4"><input type="file" class="form-control" id="inputGroupFile02"><label class="input-group-text" for="inputGroupFile02"><i class="bi bi-upload me-2"></i> Enviar Arquivo</label></div></div>` },
                    { id: 6, titulo: "Portifólio", icone: "bi-briefcase-fill", conteudo: `<p class="fs-5">Instruções e espaço para entrega do seu portifólio final.</p>` },
                    { 
                        id: 7, 
                        titulo: "Discussão da Matéria", 
                        icone: "bi-chat-quote-fill", 
                        conteudo: `<p class="text-muted">Este é o espaço central para tirar dúvidas, debater com os colegas e colaborar. Suas contribuições valem pontos!</p>`,
                        forumTopicos: [
                            { id: 200, autorId: 0, texto: "Analisando os resultados do último quiz, notei que muitos erraram a questão sobre Limites Laterais. O que torna esse conceito tão desafiador? Vamos debater!", data: "25 de Junho de 2025", pontosGanhos: 0, respostas: [] },
                            { id: 201, autorId: 1, texto: "Estou com dificuldade em entender quando exatamente devo aplicar a Regra da Cadeia.", data: "26 de Junho de 2025", pontosGanhos: 10, respostas: [
                                { id: 301, autorId: 3, texto: "A chave é pensar na função de 'dentro' e na de 'fora'. Primeiro você deriva a de fora, mantendo a de dentro, e DEPOIS multiplica pela derivada da de dentro.", data: "27 de Junho de 2025", isSolucao: false, pontosGanhos: 5 },
                            ]},
                            { id: 202, autorId: 2, texto: "Qual a aplicação prática da segunda derivada no dia a dia? Além de concavidade, onde mais usamos?", data: "28 de Junho de 2025", pontosGanhos: 10, respostas: [] },
                            { id: 204, autorId: 0, texto: "<b>Resumo da Semana:</b> Ótimo debate sobre Limites! Os pontos principais foram: 1) A importância de testar os limites laterais separadamente. 2) A confusão comum entre limite e o valor da função no ponto. Parabéns a todos que participaram!", data: "28 de Junho de 2025", pontosGanhos: 0, respostas: [] }
                        ] 
                    }
                ]
            }
        ]
    };

    const ID_DISCIPLINA_ATUAL = 101;
    const ID_ALUNO_LOGADO = 2; // Bruno Costa
    let ID_BLOCO_ATUAL = null;

    const accordionContainer = document.getElementById('disciplinaAccordion');

    function criarPostHtml(post, autor, isResposta = false, topicoPaiId = null) {
        const solucaoClass = post.isSolucao ? 'post-solucao' : '';
        const iaClass = autor.id === 0 ? 'post-ia' : '';
        const marginClass = isResposta ? 'ms-md-5 ms-3' : '';
        const medalhasHtml = autor.medalhas ? autor.medalhas.map(m => `<span class="badge text-bg-light" title="${m.nome}"><i class="bi ${m.icon}"></i> ${m.nome}</span>`).join('') : '';
        
        const botaoSolucaoHtml = isResposta && !post.isSolucao ? 
            `<button class="btn btn-outline-success btn-sm btn-marcar-solucao" data-topico-id="${topicoPaiId}" data-resposta-id="${post.id}">
                <i class="bi bi-check-circle"></i> Marcar como Solução
             </button>` : '';

        return `
        <div id="post-${post.id}" class="forum-post card ${solucaoClass} ${iaClass} ${marginClass}">
            <div class="post-header">
                <img src="${autor.avatar}" alt="Avatar" class="post-author-avatar">
                <div class="post-author-info">
                    <h6 class="author-name">${autor.nome}</h6>
                    ${autor.id !== 0 ? `<div class="text-muted small"><span>Nível ${autor.nivel}</span> | <span class="fw-bold">${autor.pontos || 0} pts</span></div>` : ''}
                    <div class="post-author-medalhas">${medalhasHtml}</div>
                </div>
                ${post.pontosGanhos > 0 ? `<div class="ms-auto post-pontos">+${post.pontosGanhos} pts</div>` : ''}
            </div>
            <div class="post-body"><p>${post.texto}</p></div>
            <div class="post-footer">
                <span>Postado em ${post.data}</span>
                ${post.isSolucao ? '<span class="badge bg-success"><i class="bi bi-check-circle-fill"></i> Solução</span>' : botaoSolucaoHtml}
            </div>
        </div>`;
    }

    function handleNewPost(blocoId, textareaElement) {
        const texto = textareaElement.value.trim();
        if (texto === '') return;

        const alunoLogado = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        const disciplina = bancoDeDadosFicticio.disciplinas.find(d => d.id === ID_DISCIPLINA_ATUAL);
        const bloco = disciplina.blocos.find(b => b.id === blocoId);

        const PONTOS_NOVO_TOPICO = 10;
        
        const novoTopico = {
            id: Math.random(),
            autorId: ID_ALUNO_LOGADO,
            texto: texto,
            data: "28 de Junho de 2025",
            pontosGanhos: PONTOS_NOVO_TOPICO,
            respostas: []
        };

        bloco.forumTopicos.push(novoTopico);
        alunoLogado.pontos += PONTOS_NOVO_TOPICO;

        textareaElement.value = '';
        const collapseElement = document.getElementById(`collapse-${blocoId}`);
        renderForum(blocoId, collapseElement);
        renderSidebarInfo(ID_ALUNO_LOGADO);
    }

    function marcarComoSolucao(topicoId, respostaId) {
        const disciplina = bancoDeDadosFicticio.disciplinas.find(d => d.id === ID_DISCIPLINA_ATUAL);
        const bloco = disciplina.blocos.find(b => b.id === ID_BLOCO_ATUAL);
        const topico = bloco.forumTopicos.find(t => t.id === topicoId);
        
        if (!topico) return;

        topico.respostas.forEach(r => {
            if (r.isSolucao) {
                r.isSolucao = false;
                const autorAntigaSolucao = bancoDeDadosFicticio.alunos.find(a => a.id === r.autorId);
                autorAntigaSolucao.pontos -= (20 - 5);
                r.pontosGanhos = 5;
            }
        });
        
        const resposta = topico.respostas.find(r => r.id === respostaId);
        if (!resposta) return;
        
        resposta.isSolucao = true;
        const PONTOS_POR_SOLUCAO = 20;
        
        const autorDaSolucao = bancoDeDadosFicticio.alunos.find(a => a.id === resposta.autorId);
        autorDaSolucao.pontos += (PONTOS_POR_SOLUCAO - resposta.pontosGanhos);
        resposta.pontosGanhos = PONTOS_POR_SOLUCAO;
        
        const collapseElement = document.getElementById(`collapse-${ID_BLOCO_ATUAL}`);
        renderForum(ID_BLOCO_ATUAL, collapseElement);
        renderSidebarInfo(ID_ALUNO_LOGADO);
    }

    function renderAccordion() {
        const disciplina = bancoDeDadosFicticio.disciplinas.find(d => d.id === ID_DISCIPLINA_ATUAL);
        if (!disciplina) return;

        accordionContainer.innerHTML = disciplina.blocos.map((bloco, index) => {
            const isExpanded = index === 0; // Abre o "Comece Aqui" por padrão
            return `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading-${bloco.id}">
                    <button class="accordion-button ${isExpanded ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${bloco.id}" aria-expanded="${isExpanded}" aria-controls="collapse-${bloco.id}">
                        <i class="bi ${bloco.icone}"></i>
                        ${bloco.titulo}
                    </button>
                </h2>
                <div id="collapse-${bloco.id}" class="accordion-collapse collapse ${isExpanded ? 'show' : ''}" aria-labelledby="heading-${bloco.id}" data-bs-parent="#disciplinaAccordion" data-bloco-id="${bloco.id}">
                    <div class="accordion-body">
                        <div class="bloco-conteudo-dinamico">${bloco.conteudo || ''}</div>
                        ${bloco.forumTopicos && bloco.forumTopicos.length > 0 ? `
                            <hr class="my-4">
                            <div class="arena-debates">
                                <h2 class="arena-title"><i class="bi bi-chat-quote-fill"></i> Arena de Debates</h2>
                                <div class="forum-posts-container mt-4"></div>
                                <div class="new-post-form card mt-4">
                                    <div class="card-body">
                                        <h5 class="card-title">Inicie um novo tópico!</h5>
                                        <textarea class="form-control new-post-textarea" rows="3" placeholder="Digite sua dúvida ou contribuição..."></textarea>
                                        <div class="d-flex justify-content-between align-items-center mt-3">
                                            <small class="text-muted">Iniciar um tópico vale +10 pontos!</small>
                                            <button class="btn btn-primary submit-post-btn" data-bloco-id="${bloco.id}"><i class="bi bi-send-fill"></i> Publicar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    function renderForum(blocoId, collapseElement) {
        const disciplina = bancoDeDadosFicticio.disciplinas.find(d => d.id === ID_DISCIPLINA_ATUAL);
        const bloco = disciplina.blocos.find(b => b.id === blocoId);
        const forumContainer = collapseElement.querySelector('.forum-posts-container');
        if (!bloco || !forumContainer) return;

        let html = '';
        bloco.forumTopicos.forEach(topico => {
            const autorTopico = bancoDeDadosFicticio.alunos.find(a => a.id === topico.autorId);
            html += criarPostHtml(topico, autorTopico, false, topico.id);
            if (topico.respostas) {
                topico.respostas.forEach(resposta => {
                    const autorResposta = bancoDeDadosFicticio.alunos.find(a => a.id === resposta.autorId);
                    html += criarPostHtml(resposta, autorResposta, true, topico.id);
                });
            }
        });
        forumContainer.innerHTML = html;
    }

    function renderSidebarInfo(alunoId) {
        const aluno = bancoDeDadosFicticio.alunos.find(a => a.id === alunoId);
        if (!aluno) return;
        document.getElementById('sidebar-level').textContent = `Nível ${aluno.nivel}`;
        document.getElementById('sidebar-pontos').textContent = aluno.pontos;
        const medalhasContainer = document.getElementById('sidebar-medalhas');
        medalhasContainer.innerHTML = aluno.medalhas.map(m => `<div class="medalha" title="${m.nome}"><i class="bi ${m.icon}"></i></div>`).join('');
    }

    // INICIALIZAÇÃO E LISTENERS DE EVENTOS
    renderAccordion();

    accordionContainer.addEventListener('show.bs.collapse', event => {
        const blocoId = parseInt(event.target.dataset.blocoId);
        ID_BLOCO_ATUAL = blocoId;
        renderForum(blocoId, event.target);
    });

    accordionContainer.addEventListener('click', event => {
        if (event.target.matches('.submit-post-btn')) {
            const blocoId = parseInt(event.target.dataset.blocoId);
            const form = event.target.closest('.new-post-form');
            const textarea = form.querySelector('.new-post-textarea');
            handleNewPost(blocoId, textarea);
        }
        if (event.target.matches('.btn-marcar-solucao')) {
            const topicoId = parseFloat(event.target.dataset.topicoId);
            const respostaId = parseFloat(event.target.dataset.respostaId);
            marcarComoSolucao(topicoId, respostaId);
        }
    });

    const itemAbertoInicial = document.querySelector('.accordion-collapse.show');
    if (itemAbertoInicial) {
        const blocoIdInicial = parseInt(itemAbertoInicial.dataset.blocoId);
        ID_BLOCO_ATUAL = blocoIdInicial;
        renderForum(blocoIdInicial, itemAbertoInicial);
    }
    renderSidebarInfo(ID_ALUNO_LOGADO);
});