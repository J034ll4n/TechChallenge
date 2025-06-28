document.addEventListener('DOMContentLoaded', function() {

    const bancoDeDadosFicticio = {
        alunos: [
            { id: 2, nome: "Bruno Costa", nivel: 8, avatar: 'img/aluno.jpg', pontos: 450, medalhas: [] }
        ],
        disciplinas: [
            {
                id: 101, nome: "Cálculo I",
                roteiro: [
                    { id: 1, titulo: "O que são Limites?", tipo: 'video', tags: ['limite'], statusPorAluno: { 2: 'concluido' } },
                    { id: 2, titulo: "Limites Laterais", tipo: 'leitura', tags: ['limite'], statusPorAluno: { 2: 'aprendendo' } },
                    { id: 3, titulo: "Propriedades dos Limites", tipo: 'leitura', tags: ['limite'], statusPorAluno: { 2: 'bloqueado' } },
                    { id: 4, titulo: "Quiz Rápido: Limites", tipo: 'quiz', tags: ['limite'], statusPorAluno: { 2: 'bloqueado' } },
                    { id: 5, titulo: "Introdução a Derivadas", tipo: 'video', tags: ['derivada'], statusPorAluno: { 2: 'dificuldade' } },
                    { id: 6, titulo: "Regra da Cadeia", tipo: 'desafio', tags: ['derivada', 'regra da cadeia'], statusPorAluno: { 2: 'bloqueado' } },
                ]
            }
        ],
        biblioteca: [
            { id: 1001, titulo: "Vídeo: Introdução à Regra da Cadeia", tipo: 'video', descricao: "Um vídeo explicativo de 15 minutos sobre como e quando usar a Regra da Cadeia.", tags: ['derivada', 'regra da cadeia', 'cálculo', 'video'] },
            { id: 1002, titulo: "PDF: Tabela de Derivadas Comuns", tipo: 'pdf', descricao: "Um guia de referência rápido com as derivadas das funções mais comuns.", tags: ['derivada', 'tabela', 'referência', 'pdf'] },
            { id: 1003, titulo: "Artigo: O Conceito de Limite no Infinito", tipo: 'artigo', descricao: "Exploração teórica sobre o comportamento de funções quando x tende ao infinito.", tags: ['limite', 'infinito', 'teoria', 'artigo'] },
            { id: 1004, titulo: "Exercícios Resolvidos: Limites Laterais", tipo: 'exercicios', descricao: "Passo a passo da resolução de 10 exercícios sobre limites laterais.", tags: ['limite', 'exercícios', 'resolvido', 'prática'] }
        ]
    };

    const ID_ALUNO_LOGADO = 2;
    const ID_DISCIPLINA_ATUAL = 101;

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsContainer = document.getElementById('search-results-container');
    const roadmapContainer = document.getElementById('roadmap-container');
    const sugestoesContainer = document.getElementById('sugestoes-ia-container').querySelector('.card-body');

    /**
     * LÓGICA DE SUGESTÕES DA IA (REFEITA E MELHORADA)
     */
    function getSugestoesDaIA() {
        const disciplina = bancoDeDadosFicticio.disciplinas.find(d => d.id === ID_DISCIPLINA_ATUAL);
        const biblioteca = bancoDeDadosFicticio.biblioteca;
        let sugestoes = new Map(); // Usar um Map para evitar sugestões duplicadas

        disciplina.roteiro.forEach(estacao => {
            const status = estacao.statusPorAluno[ID_ALUNO_LOGADO];
            
            if (status === 'dificuldade' || status === 'aprendendo') {
                const motivo = status === 'dificuldade' ? 
                    "Notei que você pode revisar este tópico." : 
                    "Para te ajudar no seu ponto de estudo atual.";
                
                // Encontra todos os materiais da biblioteca com as mesmas tags do tópico do roteiro
                estacao.tags.forEach(tag => {
                    biblioteca.forEach(item => {
                        if (item.tags.includes(tag) && !sugestoes.has(item.id)) {
                            sugestoes.set(item.id, { ...item, motivo: motivo });
                        }
                    });
                });
            }
        });
        return Array.from(sugestoes.values());
    }

    /**
     * Renderiza o card de sugestões da IA
     */
    function renderSugestoesIA(sugestoes) {
        const iconMap = { video: 'bi-youtube', pdf: 'bi-file-earmark-pdf-fill', artigo: 'bi-journal-text', exercicios: 'bi-pencil-square' };

        if (sugestoes.length === 0) {
            sugestoesContainer.innerHTML = '<p class="text-muted p-3">Nenhuma sugestão no momento. Continue estudando!</p>';
            return;
        }
        const sugestoesHtml = sugestoes.map(item => `
            <div class="sugestao-item">
                <i class="bi ${iconMap[item.tipo] || 'bi-file-earmark'} sugestao-icon"></i>
                <div class="flex-grow-1">
                    <h6 class="sugestao-title">${item.titulo}</h6>
                    <p class="sugestao-motivo mb-0">${item.motivo}</p>
                </div>
                <a href="#" class="btn btn-sm btn-outline-success align-self-center">Ver</a>
            </div>`).join('');
        sugestoesContainer.innerHTML = sugestoesHtml;
    }

    /**
     * Realiza a busca na biblioteca
     */
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (query === '') {
            // Se a busca for vazia, volta a mostrar os itens em destaque
            renderItensEmDestaque();
            return;
        }

        const resultados = bancoDeDadosFicticio.biblioteca.filter(item => {
            const textoBuscavel = `${item.titulo} ${item.descricao} ${item.tags.join(' ')}`.toLowerCase();
            return textoBuscavel.includes(query);
        });

        renderSearchResults(resultados, `Resultados para "${query}"`);
    }

    /**
     * Renderiza os resultados da busca ou itens em destaque
     */
    function renderSearchResults(resultados, titulo) {
        if (resultados.length === 0) {
            searchResultsContainer.innerHTML = `<div class="alert alert-warning mt-3">Nenhum resultado encontrado.</div>`;
            return;
        }
        const iconMap = { video: 'bi-youtube', pdf: 'bi-file-earmark-pdf-fill', artigo: 'bi-journal-text', exercicios: 'bi-pencil-square' };
        
        const html = resultados.map(item => `
            <div class="result-item card mb-3">
                <div class="card-body">
                    <i class="bi ${iconMap[item.tipo] || 'bi-file-earmark'} result-icon"></i>
                    <div class="flex-grow-1">
                        <h6 class="result-title">${item.titulo}</h6>
                        <p class="result-description mb-2">${item.descricao}</p>
                        <a href="#" class="btn btn-sm btn-outline-primary">Acessar Material</a>
                    </div>
                </div>
            </div>`).join('');

        // Adiciona um título dinâmico à seção de resultados
        searchResultsContainer.innerHTML = `<h6 class="text-muted mb-3">${titulo}</h6>` + html;
    }

    /**
     * NOVO: Mostra os primeiros itens da biblioteca como destaque
     */
    function renderItensEmDestaque() {
        const itensDestaque = bancoDeDadosFicticio.biblioteca.slice(0, 2);
        renderSearchResults(itensDestaque, "Itens em Destaque na Biblioteca");
    }

    // --- Funções do Roteiro e Sidebar (sem alterações) ---
    function getStationDetails(estacao, status) {
        const iconMap = { video: 'bi-play-btn-fill', leitura: 'bi-book-fill', quiz: 'bi-patch-question-fill', desafio: 'bi-trophy-fill', video_reforco: 'bi-lightbulb-fill' };
        const statusMap = {
            concluido: { class: 'status-concluido', text: 'Você já domina este tópico. Bom trabalho!', color: 'text-success' },
            aprendendo: { class: 'status-aprendendo', text: 'Recomendamos começar por aqui. Vamos lá?', color: 'text-warning-emphasis' },
            dificuldade: { class: 'status-dificuldade', text: 'Atenção aqui! Vamos revisar este ponto com calma.', color: 'text-danger' },
            bloqueado: { class: 'status-bloqueado', text: 'Este tópico será liberado em breve.', color: 'text-muted' }
        };
        return {
            icon: iconMap[estacao.tipo] || 'bi-circle-fill',
            statusInfo: statusMap[status] || statusMap['bloqueado']
        };
    }
    function renderRoteiro() {
        const disciplina = bancoDeDadosFicticio.disciplinas.find(d => d.id === ID_DISCIPLINA_ATUAL);
        if (!disciplina || !disciplina.roteiro) {
            roadmapContainer.innerHTML = '<p>Roteiro de estudos não disponível.</p>';
            return;
        }
        const html = disciplina.roteiro.map(estacao => {
            const status = estacao.statusPorAluno[ID_ALUNO_LOGADO] || 'bloqueado';
            const details = getStationDetails(estacao, status);
            return `<div class="roadmap-station"><div class="station-dot ${details.statusInfo.class}"></div><div class="station-content card"><div class="card-body"><i class="bi ${details.icon} station-icon"></i><div class="flex-grow-1"><h5 class="station-title">${estacao.titulo}</h5><p class="station-status-text ${details.statusInfo.color} mb-0">${details.statusInfo.text}</p></div><a href="#" class="btn btn-outline-primary ${status === 'bloqueado' ? 'disabled' : ''}">Acessar</a></div></div></div>`;
        }).join('');
        roadmapContainer.innerHTML = html;
    }
    function renderSidebarInfo() {
        const aluno = bancoDeDadosFicticio.alunos.find(a => a.id === ID_ALUNO_LOGADO);
        if (!aluno) return;
        const sidebarLevel = document.getElementById('sidebar-level');
        const sidebarPontos = document.getElementById('sidebar-pontos');
        const sidebarMedalhas = document.getElementById('sidebar-medalhas');
        if (sidebarLevel) sidebarLevel.textContent = `Nível ${aluno.nivel}`;
        if (sidebarPontos) sidebarPontos.textContent = aluno.pontos;
        if (sidebarMedalhas) { sidebarMedalhas.innerHTML = aluno.medalhas ? aluno.medalhas.map(m => `<div class="medalha" title="${m.nome}"><i class="bi ${m.icon}"></i></div>`).join('') : ''; }
    }

    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    renderSidebarInfo();
    renderRoteiro();
    
    // Mostra as sugestões da IA e os itens em destaque ao carregar a página
    const sugestoes = getSugestoesDaIA();
    renderSugestoesIA(sugestoes);
    renderItensEmDestaque();

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
});