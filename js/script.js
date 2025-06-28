document.addEventListener('DOMContentLoaded', function() {

    // =================================================================
    // PARTE 1: BANCO DE DADOS FICTÍCIO
    // =================================================================
    const HOJE = new Date('2025-06-28T10:00:00');

    const bancoDeDadosFicticio = {
        alunos: [
            {
                id: 1, nome: "Ana Silva", nivel: 15, avatar: 'img/ana.jpg', pontos: 1250, medalhas: [{nome: 'Melhor Argumento', icon: 'bi-lightbulb-fill'}],
                ultimoLogin: new Date('2025-06-27T18:00:00'), desempenho: 8.5, desempenhoAnterior: 8.2, statusRisco: 'normal', notificacoesSentinela: []
            },
            {
                id: 2, nome: "Bruno Costa", nivel: 8, avatar: 'img/aluno.jpg', pontos: 450, medalhas: [],
                // Gatilhos de risco ativados para o Bruno:
                ultimoLogin: new Date('2025-06-24T11:00:00'), // Inativo há 4 dias
                desempenho: 5.5,                               // Nota atual
                desempenhoAnterior: 7.8,                       // Nota anterior (queda > 20%)
                statusRisco: 'normal',
                notificacoesSentinela: []
            },
            {
                id: 3, nome: "Carla Dias", nivel: 11, avatar: 'img/carla.jpg', pontos: 780, medalhas: [{nome: 'Debatedora da Semana', icon: 'bi-chat-quote-fill'}],
                ultimoLogin: new Date('2025-06-26T20:00:00'), desempenho: 7.0, desempenhoAnterior: 7.1, statusRisco: 'normal', notificacoesSentinela: []
            }
        ],
        tarefas: [
            { id: 401, alunoId: 2, disciplinaId: 102, titulo: "Entregar Análise de SWOT", prazo: new Date('2025-06-28T23:59:00'), status: 'pendente' },
            { id: 402, alunoId: 2, disciplinaId: 101, titulo: "Quiz Semanal de Cálculo", prazo: new Date('2025-06-29T23:59:00'), status: 'pendente' },
            { id: 403, alunoId: 2, disciplinaId: 102, titulo: "Leitura: Artigo de SEO", prazo: null, status: 'concluido' }
        ]
    };

    const ID_ALUNO_LOGADO = 2; // Bruno Costa, que está em risco

    // =================================================================
    // PARTE 2: LÓGICA DA SENTINELA E DO PAINEL
    // =================================================================

    function simularLogicaSentinela() {
        console.log("SENTINELA: Monitoramento ativado...");
        const aluno = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        if (!aluno) return;

        const diffTime = Math.abs(HOJE - aluno.ultimoLogin);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 3) {
            aluno.statusRisco = 'alerta_amarelo';
            const msg = `Olá, ${aluno.nome}. Notei que você não acessa o material de Cálculo há ${diffDays} dias. Está tudo bem? Se a matéria acumulou, posso preparar um resumo dos pontos principais que você perdeu.`;
            if (!aluno.notificacoesSentinela.includes(msg)) aluno.notificacoesSentinela.push(msg);
        }

        const quedaPercentual = ((aluno.desempenho - aluno.desempenhoAnterior) / aluno.desempenhoAnterior) * 100;
        if (quedaPercentual < -20) {
            aluno.statusRisco = 'alerta_vermelho';
            const msg = `Percebi também que seu desempenho nos últimos quizzes caiu. Às vezes um tópico específico pode ser mais difícil. Quer conversar sobre isso ou ver alguns exercícios de reforço?`;
            if (!aluno.notificacoesSentinela.includes(msg)) aluno.notificacoesSentinela.push(msg);
        }

        // Simulação da Intervenção Nível 2 (Relatório para o Tutor)
        if (aluno.statusRisco === 'alerta_vermelho') {
            console.warn('%c=============================================', 'color: #dc3545; font-weight: bold;');
            console.warn('%cRELATÓRIO PARA TUTOR: Alerta de Risco de Evasão', 'color: #dc3545; font-size: 14px; font-weight: bold;');
            console.log(`Aluno: ${aluno.nome} (ID: ${aluno.id})`);
            console.log(`Sinais Vitais: ${diffDays} dias sem login, queda de ${Math.abs(quedaPercentual).toFixed(0)}% no desempenho.`);
            console.log('Sugestão de Ação: Enviar mensagem pessoal sobre o Tópico de Derivadas.');
            console.warn('%c=============================================', 'color: #dc3545; font-weight: bold;');
        }
    }

    function gerarDadosDashboard(alunoId) {
        const agora = HOJE;
        const prioridades = bancoDeDadosFicticio.tarefas.filter(t => t.alunoId === alunoId && t.status === 'pendente').sort((a, b) => a.prazo - b.prazo).map(t => ({ titulo: t.titulo, prazo: `Prazo: ${t.prazo.toLocaleDateString('pt-BR')} às ${t.prazo.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, tipo: (t.prazo - agora) / (1000 * 60 * 60) < 48 ? 'Urgente' : 'Próxima' }));
        const concluidos = bancoDeDadosFicticio.tarefas.filter(t => t.alunoId === alunoId && t.status === 'concluido').map(t => ({ titulo: t.titulo }));
        const continuar = [{ titulo: 'Aula 5: Introdução a Derivadas', progresso: 25, link: '#' }];
        return { prioridades, continuar, concluidos };
    }

    // =================================================================
    // PARTE 3: RENDERIZAÇÃO E INTERAÇÃO
    // =================================================================

    function carregarPainel() {
        const dadosDashboard = gerarDadosDashboard(ID_ALUNO_LOGADO);
        const criarCardPrioridade = (item) => `<div class="card trello-card mb-3"><div class="card-body"><span class="badge ${item.tipo === 'Urgente' ? 'text-bg-danger' : 'text-bg-warning'} mb-2">${item.tipo}</span><h6 class="card-title">${item.titulo}</h6><p class="card-text small text-muted">${item.prazo}</p><a href="#" class="btn btn-sm btn-outline-primary stretched-link">Acessar</a></div></div>`;
        const criarCardContinuar = (item) => `<div class="card trello-card mb-3"><div class="card-body"><h6 class="card-title">${item.titulo}</h6><div class="progress mt-2" role="progressbar" style="height: 5px;"><div class="progress-bar" style="width: ${item.progresso}%;"></div></div><a href="#" class="btn btn-sm btn-outline-primary mt-3 stretched-link">Continuar</a></div></div>`;
        const criarCardConcluido = (item) => `<div class="card trello-card trello-card-done mb-3"><div class="card-body"><h6 class="card-title text-decoration-line-through text-muted">${item.titulo}</h6><span class="badge text-bg-success"><i class="bi bi-check-circle-fill"></i> Concluído</span></div></div>`;

        document.getElementById('prioridades-column').innerHTML = dadosDashboard.prioridades.map(criarCardPrioridade).join('');
        document.getElementById('continuar-column').innerHTML = dadosDashboard.continuar.map(criarCardContinuar).join('');
        document.getElementById('concluido-column').innerHTML = dadosDashboard.concluidos.map(criarCardConcluido).join('');
    }

    function processarAlertasVisuais() {
        const alunoLogado = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        if (!alunoLogado || alunoLogado.notificacoesSentinela.length === 0) return;

        const numeroDeAlertas = alunoLogado.notificacoesSentinela.length;
        const profilePicture = document.getElementById('profile-picture');
        const pictureContainer = profilePicture.parentElement;
        const notificationBadge = document.getElementById('notification-badge');
        
        profilePicture.classList.add('alerta');
        notificationBadge.textContent = numeroDeAlertas;
        notificationBadge.classList.add('show');
        pictureContainer.classList.add('clicavel');

        pictureContainer.addEventListener('click', () => {
            const modalBody = document.getElementById('alertasModalBody');
            const modalElement = document.getElementById('alertasModal');
            modalBody.innerHTML = alunoLogado.notificacoesSentinela.map(alerta => `<div class="alert alert-warning" role="alert">${alerta}</div>`).join('');
            new bootstrap.Modal(modalElement).show();
        });
    }

    function iniciarChatProativo() {
        const alunoLogado = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        if (alunoLogado.statusRisco === 'normal') return;

        const chatWindow = document.getElementById('chat-window');
        const messagesContainer = document.getElementById('messages-container');

        setTimeout(() => {
            chatWindow.classList.add('show');
            document.getElementById('chat-toggle-button').classList.add('active');
            const primeiraMensagem = alunoLogado.notificacoesSentinela[0];
            messagesContainer.innerHTML = `<div class="message bot-message">${primeiraMensagem}</div>`;
        }, 2000);
    }
    
    function renderSidebarInfo(alunoId) {
        const aluno = bancoDeDadosFicticio.alunos.find(a => a.id === alunoId);
        if (!aluno) return;

        const sidebarLevel = document.getElementById('sidebar-level');
        const sidebarPontos = document.getElementById('sidebar-pontos');
        const sidebarMedalhas = document.getElementById('sidebar-medalhas');
        
        if (sidebarLevel) sidebarLevel.textContent = `Nível ${aluno.nivel}`;
        if (sidebarPontos) sidebarPontos.textContent = aluno.pontos;
        if (sidebarMedalhas) {
            sidebarMedalhas.innerHTML = aluno.medalhas.map(m => `<div class="medalha" title="${m.nome}"><i class="bi ${m.icon}"></i></div>`).join('');
        }
    }

    // =================================================================
    // INICIALIZAÇÃO DA PÁGINA
    // =================================================================
    simularLogicaSentinela();
    carregarPainel();
    processarAlertasVisuais();
    renderSidebarInfo(ID_ALUNO_LOGADO);
    iniciarChatProativo();
});