document.addEventListener('DOMContentLoaded', function() {

    const HOJE = new Date('2025-06-28T10:00:00');

    // BANCO DE DADOS ATUALIZADO COM MAIS ITENS
    const bancoDeDadosFicticio = {
        alunos: [
            { id: 2, nome: "Bruno Costa", nivel: 8, avatar: 'img/aluno.jpg', pontos: 450, medalhas: [], ultimoLogin: new Date('2025-06-24T11:00:00'), desempenho: 5.5, desempenhoAnterior: 7.8, notificacoesSentinela: [] }
        ],
        // LISTA DE TAREFAS ATUALIZADA COM 4 ITENS CONCLUÍDOS
        tarefas: [
            // Tarefas pendentes
            { id: 401, alunoId: 2, titulo: "Entregar Análise de SWOT", prazo: new Date('2025-06-28T23:59:00'), status: 'pendente' },
            { id: 402, alunoId: 2, titulo: "Quiz Semanal de Cálculo", prazo: new Date('2025-06-29T23:59:00'), status: 'pendente' },
            // 4 Itens concluídos para a coluna "Concluído Esta Semana"
            { id: 501, alunoId: 2, titulo: "Leitura: Artigo sobre SEO", prazo: null, status: 'concluido' },
            { id: 502, alunoId: 2, titulo: "Exercícios de Fixação: Limites", prazo: null, status: 'concluido' },
            { id: 503, alunoId: 2, titulo: "Assistir Aula Introdutória", prazo: null, status: 'concluido' },
            { id: 504, alunoId: 2, titulo: "Participar do Fórum Inicial", prazo: null, status: 'concluido' }
        ]
    };

    const ID_ALUNO_LOGADO = 2;

    function simularLogicaSentinela() {
        const aluno = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        if (!aluno) return;
        const diffDays = Math.ceil(Math.abs(HOJE - aluno.ultimoLogin) / (1000 * 60 * 60 * 24));
        const quedaPercentual = ((aluno.desempenho - aluno.desempenhoAnterior) / aluno.desempenhoAnterior) * 100;
        if (diffDays > 3) {
            aluno.notificacoesSentinela.push({ texto: `<b>Inatividade Detectada:</b> Notei que você não acessa o material há ${diffDays} dias. Vamos voltar aos estudos?`, link: 'disciplina.html', textoBotao: 'Ver Disciplinas' });
        }
        if (quedaPercentual < -20) {
            aluno.notificacoesSentinela.push({ texto: `<b>Queda no Desempenho:</b> Suas notas recentes caíram. Que tal checar seu roteiro de estudos?`, link: 'roteiro.html', textoBotao: 'Ver Meu Roteiro' });
            console.warn(`RELATÓRIO PARA TUTOR: Aluno ${aluno.nome} (ID: ${aluno.id}) em risco.`);
        }
    }

    /**
     * ATUALIZADO: Gera os dados para TODAS as colunas do painel.
     */
    function gerarDadosDashboard(alunoId) {
        const agora = HOJE;
        
        // Dados para "Minhas Prioridades"
        const prioridades = bancoDeDadosFicticio.tarefas
            .filter(t => t.alunoId === alunoId && t.status === 'pendente')
            .sort((a, b) => a.prazo - b.prazo)
            .map(t => ({ titulo: t.titulo, prazo: `Prazo: ${t.prazo.toLocaleDateString('pt-BR')} às ${t.prazo.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, tipo: (t.prazo - agora) / (1000 * 60 * 60) < 48 ? 'Urgente' : 'Próxima' }));

        // Dados para "Concluído Esta Semana"
        const concluidos = bancoDeDadosFicticio.tarefas
            .filter(t => t.alunoId === alunoId && t.status === 'concluido')
            .map(t => ({ titulo: t.titulo }));
            
        // Dados para a coluna "Continue de Onde Parou"
        const continuar = [
            { titulo: 'Vídeo: Introdução a Derivadas', progresso: 60, link: '#' }
        ];

        return { prioridades, continuar, concluidos };
    }

    /**
     * Função principal que carrega todo o painel.
     */
    function carregarPainel() {
        const prioridadesContainer = document.getElementById('prioridades-column');
        const continuarContainer = document.getElementById('continuar-column');
        const concluidoContainer = document.getElementById('concluido-column');

        if (!prioridadesContainer) return;

        const dadosDashboard = gerarDadosDashboard(ID_ALUNO_LOGADO);
        
        const criarCardPrioridade = (item) => `<div class="card trello-card mb-3"><div class="card-body"><span class="badge ${item.tipo === 'Urgente' ? 'text-bg-danger' : 'text-bg-warning'} mb-2">${item.tipo}</span><h6 class="card-title">${item.titulo}</h6><p class="card-text small text-muted">${item.prazo}</p><a href="#" class="btn btn-sm btn-outline-primary stretched-link">Acessar</a></div></div>`;
        const criarCardContinuar = (item) => `<div class="card trello-card mb-3"><div class="card-body"><h6 class="card-title">${item.titulo}</h6><div class="progress mt-2" role="progressbar" style="height: 5px;"><div class="progress-bar" style="width: ${item.progresso || 25}%;"></div></div><a href="#" class="btn btn-sm btn-outline-primary mt-3 stretched-link">Continuar</a></div></div>`;
        const criarCardConcluido = (item) => `<div class="card trello-card trello-card-done mb-3"><div class="card-body"><h6 class="card-title text-decoration-line-through text-muted">${item.titulo}</h6><span class="badge text-bg-success"><i class="bi bi-check-circle-fill"></i> Concluído</span></div></div>`;

        prioridadesContainer.innerHTML = dadosDashboard.prioridades.map(criarCardPrioridade).join('');
        continuarContainer.innerHTML = dadosDashboard.continuar.map(criarCardContinuar).join('');
        concluidoContainer.innerHTML = dadosDashboard.concluidos.map(criarCardConcluido).join('');
    }

    /**
     * Processa as notificações e as exibe no sino da navbar.
     */
    function processarNotificacoesDoNavbar() {
        const alunoLogado = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        const dropdownMenu = document.getElementById('notification-dropdown-menu');
        const notificationDot = document.querySelector('.notification-dot');

        if (!dropdownMenu || !notificationDot) return;

        if (alunoLogado && alunoLogado.notificacoesSentinela.length > 0) {
            notificationDot.classList.add('show');
            dropdownMenu.innerHTML = alunoLogado.notificacoesSentinela.map(alerta => 
                `<li class="p-2">
                    <div class="d-flex">
                        <i class="bi bi-exclamation-triangle-fill text-danger mt-1"></i>
                        <div class="ms-2">
                            <p class="mb-2 small">${alerta.texto}</p>
                            <a href="${alerta.link}" class="btn btn-sm btn-primary">${alerta.textoBotao}</a>
                        </div>
                    </div>
                 </li>`
            ).join('<hr class="my-1">');
        } else {
            notificationDot.classList.remove('show');
            dropdownMenu.innerHTML = '<li><span class="dropdown-item text-muted">Nenhuma notificação nova.</span></li>';
        }
    }
    
    /**
     * Faz o chatbot abrir sozinho com a mensagem de ajuda.
     */
    function iniciarChatProativo() {
        const alunoLogado = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        if (!alunoLogado || alunoLogado.notificacoesSentinela.length === 0) return;

        const chatWindow = document.getElementById('chat-window');
        const messagesContainer = document.getElementById('messages-container');
        if (!chatWindow || !messagesContainer) return;

        setTimeout(() => {
            chatWindow.classList.add('show');
            document.getElementById('chat-toggle-button').classList.add('active');
            const primeiraNotificacao = alunoLogado.notificacoesSentinela[0];
            messagesContainer.innerHTML = `<div class="message bot-message">${primeiraNotificacao.texto.replace(/<b>(.*?)<\/b>/g, '$1')}<a href="${primeiraNotificacao.link}" class="btn btn-sm btn-primary mt-2 d-block">${primeiraNotificacao.textoBotao}</a></div>`;
        }, 2000);
    }
    
    /**
     * Atualiza as informações da sidebar (nível, pontos, etc.).
     */
    function renderSidebarInfo() {
        const aluno = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        if (!aluno) return;
        const sidebarLevel = document.getElementById('sidebar-level');
        const sidebarPontos = document.getElementById('sidebar-pontos');
        if (sidebarLevel) sidebarLevel.textContent = `Nível ${aluno.nivel}`;
        if (sidebarPontos) sidebarPontos.textContent = aluno.pontos;
    }

    // --- INICIALIZAÇÃO DA PÁGINA ---
    simularLogicaSentinela();
    carregarPainel();
    processarNotificacoesDoNavbar();
    renderSidebarInfo();
    iniciarChatProativo();
});

// --- FUNCIONALIDADE DO CHATBOT (ENVIO DE MENSAGENS E RESPOSTAS SIMULADAS) ---
document.getElementById('chat-send-button').addEventListener('click', enviarMensagemChat);
document.getElementById('chat-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') enviarMensagemChat();
});

document.getElementById('chat-toggle-button').addEventListener('click', function () {
    const chatWindow = document.getElementById('chat-window');
    const toggleButton = document.getElementById('chat-toggle-button');
    chatWindow.classList.toggle('show');
    toggleButton.classList.toggle('active');
});

// Respostas simuladas com base em palavras-chave
function gerarRespostaIA(mensagem) {
    mensagem = mensagem.toLowerCase();

    if (mensagem.includes('resumo') && mensagem.includes('cálculo')) {
        return 'Claro! Aqui está um resumo rápido sobre Derivadas e Limites. Você quer exercícios também?';
    } else if (mensagem.includes('atrasado') || mensagem.includes('prazo')) {
        return 'Sem problemas! Vamos ver o que está pendente. Acesse "Minhas Prioridades" para priorizar suas tarefas.';
    } else if (mensagem.includes('ajuda')) {
        return 'Posso te ajudar com resumos, exercícios e até dicas para estudar melhor. Diga o que você precisa!';
    } else {
        return 'Entendi! Vou anotar isso. Logo mais teremos uma resposta melhor para você 😉';
    }
}

function enviarMensagemChat() {
    const input = document.getElementById('chat-input');
    const mensagem = input.value.trim();
    if (!mensagem) return;

    const messagesContainer = document.getElementById('messages-container');

    // Mensagem do aluno
    const msgAluno = document.createElement('div');
    msgAluno.className = 'message user-message';
    msgAluno.textContent = mensagem;
    messagesContainer.appendChild(msgAluno);

    input.value = '';

    // Resposta da IA simulada
    setTimeout(() => {
        const resposta = gerarRespostaIA(mensagem);
        const msgBot = document.createElement('div');
        msgBot.className = 'message bot-message';
        msgBot.textContent = resposta;
        messagesContainer.appendChild(msgBot);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}
function carregarPlanoFundoSalvo() {
    const bgSalvo = localStorage.getItem('planoFundoAluno');
    if (bgSalvo) {
        document.body.style.backgroundImage = `url('${bgSalvo}')`;
        document.body.classList.add('custom-bg');
    }
}
carregarPlanoFundoSalvo();


// Chamada no onload
document.addEventListener("DOMContentLoaded", () => {
    const imagemSalva = localStorage.getItem("imagemBackground");

    if (imagemSalva) {
        document.body.classList.add("background-customizado");
        document.body.style.backgroundImage = `url(${imagemSalva})`;
    }
});

// Função para upload e salvar no localStorage
function aplicarImagemDeFundo(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const imagemBase64 = e.target.result;
        localStorage.setItem("imagemBackground", imagemBase64);
        document.body.classList.add("background-customizado");
        document.body.style.backgroundImage = `url(${imagemBase64})`;
    };
    reader.readAsDataURL(file);
}

