# Guia Completo de Desenvolvimento de Software Assistido por IA

Este guia ensina os conceitos de ponta a ponta. Cada seção explica a teoria, mostra como funciona na prática e indica fontes para aprofundar.

## Sumário

1. Metodologias de Desenvolvimento de Software
2. Conceito de Modelo de GenAI
3. Conceito de Contexto (degradação, harness, RAG)
4. Protocolos de Comunicação entre Agentes
5. Ferramentas (Skills, Comandos, MCP Server Tools)
6. Agentes de IA
7. Harness (Claude Code, Roo, Kimi, etc.)
8. Spec-Driven Development (SDD)
9. Sub-Agent Driven Development
10. Aplicação: Waterfall + Extreme Programming + Pair Programming (Zero Code)
11. Loop Engineering
12. Ralph Loop
13. Graph Engineering
14. Juntando tudo: a anatomia do workflow
15. Checklist de boas práticas (Loop, Ralph, Graph)
16. Anti-padrões
17. Detalhando a modelagem do grafo
- Apêndice: Referências gerais complementares

---

## 1. Metodologias de Desenvolvimento de Software

A IA acelera o processo que você já tem. Se o processo é ruim, a IA só acelera o caos. Por isso comece pelos fundamentos.

### 1.1 Waterfall (Cascata)

O modelo cascata organiza o desenvolvimento em fases sequenciais, onde cada fase só começa quando a anterior termina.

Como ocorre a mudança de etapa: cada fase tem um artefato de saída que serve de critério de transição (gate). A próxima fase só inicia quando esse documento é concluído e, em geral, formalmente aprovado:

| De → Para | O que dispara a transição |
|---|---|
| Requisitos → Design | Documento de requisitos (SRS) aprovado e congelado |
| Design → Implementação | Especificação de arquitetura/design assinada |
| Implementação → Verificação | Código completo (code freeze) e compilando |
| Verificação → Manutenção | Testes aprovados e produto entregue/aceito |

Como cada gate "congela" a fase anterior, voltar atrás é caro. Um erro de requisito descoberto na fase de teste obriga a reabrir três fases já fechadas.

Vantagem: previsibilidade e documentação forte. Fraqueza: rigidez.

Fontes: https://www.praxisframework.org/files/royce1970.pdf · https://en.wikipedia.org/wiki/Waterfall_model

### 1.2 Agile

Reação à rigidez da cascata: em vez de planejar tudo no início, você entrega incrementos pequenos e frequentes, aprendendo e ajustando a cada ciclo.

Como ocorre a mudança de etapa: ao contrário da cascata, as transições não dependem de documentos congelados, mas de incrementos funcionando. O ciclo se repete em iterações curtas:

| De → Para | O que dispara a transição |
|---|---|
| Planejar → Construir | Item priorizado e entendido pelo time |
| Construir → Testar | Incremento de software funcionando |
| Testar → Revisar | Incremento validado tecnicamente |
| Revisar → Planejar | Feedback do cliente coletado, vira insumo do próximo ciclo |

O gatilho que reinicia o ciclo é o feedback, não uma assinatura. A transição mais importante é o retorno (Revisar → Planejar): é onde a mudança de requisito entra de forma barata.

Os quatro valores do Manifesto Ágil:

| Valoramos mais... | ...do que |
|---|---|
| Indivíduos e interações | processos e ferramentas |
| Software funcionando | documentação abrangente |
| Colaboração com o cliente | negociação de contratos |
| Responder a mudanças | seguir um plano |

Ressalva essencial: "embora haja valor nos itens à direita, valorizamos mais os itens à esquerda." Ágil não significa abandonar documentação ou planejamento, significa priorizar.

Fontes: https://agilemanifesto.org/ · https://agilemanifesto.org/principles.html

### 1.3 Scrum

Framework ágil mais usado. Trabalho dividido em Sprints (ciclos de um mês ou menos). Alinhado ao Scrum Guide 2020.

Como ocorre a mudança de etapa: em Scrum, as transições são eventos com tempo fixo (time-boxed). Cada evento é o gatilho formal que abre e fecha uma etapa:

| De → Para | O que dispara a transição |
|---|---|
| Product Backlog → Sprint Planning | Início do Sprint; backlog suficientemente refinado |
| Sprint Planning → Sprint Backlog | Time define o Sprint Goal e seleciona itens |
| Durante o Sprint | Daily Scrum reajusta o plano a cada 24h |
| Sprint → Increment | Itens atingem a Definition of Done |
| Increment → Sprint Review | Fim do time-box do Sprint |
| Sprint Review → Retrospective | Increment inspecionado com stakeholders |
| Retrospective → próximo Planning | Melhorias de processo definidas |

A regra-chave: o fim do time-box do Sprint dispara o encerramento, mesmo que nem tudo tenha terminado. O que não ficou pronto volta ao Product Backlog.

Papéis (Accountabilities):

| Papel | Responsabilidade (Guide 2020) |
|---|---|
| Product Owner | Maximiza o valor; dono do Product Backlog e do seu ordenamento |
| Scrum Master | Líder a serviço do time; responsável pela eficácia do Scrum |
| Developers | Constroem o Increment a cada Sprint |

Artefatos e compromissos: Product Backlog → Product Goal; Sprint Backlog → Sprint Goal; Increment → Definition of Done.

Fonte: https://scrumguides.org/scrum-guide.html

### 1.4 Kanban

Gestão visual de fluxo. Tarefas avançam por colunas e você limita o WIP (work in progress) para evitar sobrecarga e gargalos.

Como ocorre a mudança de etapa: Kanban usa sistema puxado (pull). A transição não é empurrada por um prazo, ela acontece quando há capacidade livre na coluna seguinte:

| De → Para | O que dispara a transição |
|---|---|
| A Fazer → Fazendo | Surge uma vaga dentro do limite de WIP; o time "puxa" o próximo item |
| Fazendo → Feito | A tarefa atende aos critérios de conclusão da coluna |

Diferença central frente às outras metodologias: não há ciclos fixos nem eventos. O gatilho é puramente o limite de WIP. Se "Fazendo" está cheio (no exemplo, 2 itens), ninguém puxa nada novo, mesmo que haja gente "livre", o foco vira destravar o que já está em andamento. Isso torna gargalos visíveis na hora.

Ótimo para gerenciar tarefas delegadas a agentes de IA, pois cada agente vira uma raia de fluxo com limite explícito.

Fonte: https://www.atlassian.com/agile/kanban

### 1.5 Lean

Sete princípios do Lean Software Development (Mary e Tom Poppendieck).

Como ocorre a mudança de etapa: Lean não prescreve fases, mas governa as transições por dois mecanismos:

1. Fluxo puxado e single-piece flow: o trabalho avança quando a etapa seguinte está pronta para recebê-lo, eliminando estoques intermediários (trabalho parado é desperdício).
2. Decidir no último momento responsável: uma decisão só "avança" quando adiar mais traria custo maior que decidir agora. Até lá, mantêm-se opções abertas.

Ou seja, o gatilho de transição é a demanda real da etapa seguinte + o momento de máxima informação disponível, nunca um cronograma fixo.

Nota de tradução: "build integrity in" significa construir integridade (coerência conceitual + percepção do usuário + robustez interna), mais amplo que "qualidade".

Como a IA reduz o custo de experimentar, "amplificar aprendizado" e "decidir o mais tarde possível" ficam ainda mais poderosos.

Fonte: https://en.wikipedia.org/wiki/Lean_software_development

### 1.6 DevOps

Cultura + automação para integrar desenvolvimento e operações, com entrega contínua, em um ciclo infinito.

Como ocorre a mudança de etapa: a transição é automatizada por pipeline (CI/CD). Cada etapa só avança se a anterior passar em uma verificação automática (quality gate); se falhar, o pipeline para e devolve o feedback na hora:

| De → Para | O que dispara a transição |
|---|---|
| Code → Build | Commit no repositório aciona o pipeline |
| Build → Test | Build compila sem erro |
| Test → Release | Testes automatizados passam (gate de qualidade) |
| Release → Deploy | Artefato versionado e aprovado |
| Deploy → Operate | Deploy bem-sucedido em produção |
| Monitor → Plan | Métricas e incidentes alimentam o próximo ciclo |

A diferença frente ao Scrum/Kanban: aqui o gatilho é uma máquina, não uma pessoa nem um relógio. O fluxo é contínuo (Continuous Integration / Continuous Delivery) e a transição acontece em minutos.

As 4 métricas DORA:

| Métrica | O que mede |
|---|---|
| Deployment Frequency | Com que frequência você faz deploy em produção |
| Lead Time for Changes | Tempo do commit até rodar em produção |
| Change Failure Rate | % de deploys que causam falha em produção |
| Failed Deployment Recovery Time | Tempo para restaurar o serviço após uma falha |

As duas primeiras medem velocidade; as duas últimas, estabilidade.

Fontes: https://dora.dev/ · https://www.atlassian.com/devops

---

## 2. Conceito de Modelo de GenAI

### 2.1 O que é um LLM

Um Large Language Model (LLM) é um modelo treinado para prever o próximo token (pedaço de texto) dado o contexto anterior. Treinado em enormes volumes de texto, ele aprende padrões de linguagem, código e raciocínio. Ele não "consulta um banco de dados"; ele gera estatisticamente a continuação mais provável.

### 2.2 Transformers e Attention

A arquitetura Transformer (2017) é a base de quase todos os LLMs. Seu mecanismo central, self-attention, permite ao modelo ponderar a relevância de cada token em relação a todos os outros da sequência. Isso captura dependências de longo alcance (ex.: ligar um pronome ao substantivo certo várias frases atrás).

Fonte: https://arxiv.org/abs/1706.03762

### 2.3 Foundation Models

Modelos fundacionais são treinados em larga escala e adaptáveis a muitas tarefas (resumo, código, tradução). Apresentam capacidades emergentes (habilidades que surgem com a escala) mas também riscos: viés, homogeneização e propagação de erros.

Fontes: https://crfm.stanford.edu/ · https://arxiv.org/abs/2108.07258

### 2.4 Famílias de modelos

- Anthropic Claude: https://docs.anthropic.com/en/docs/about-claude/models
- OpenAI GPT: https://platform.openai.com/docs/models
- Google Gemini (multimodal, contexto longo): https://ai.google.dev/gemini-api/docs/models/gemini
- Meta Llama (aberto, auto-hospedável): https://www.llama.com/
- Mistral (aberto): https://docs.mistral.ai/getting-started/models/models_overview/

### 2.5 Conceitos operacionais essenciais

#### Tokens

O texto é fatiado em tokens, as unidades que o modelo realmente processa. Um token não é uma palavra nem uma letra: é um pedaço de texto (subpalavra). Em inglês, a média é de ~4 caracteres por token (≈ 0,75 palavra). Em português a contagem tende a ser um pouco maior, porque acentos e palavras menos frequentes são quebrados em mais pedaços.

- **Por que importa:** custo, limites de contexto e velocidade são todos medidos em tokens, não em palavras. Você paga por tokens de entrada (prompt) e de saída (resposta).
- **Janela de contexto (context window):** é o total de tokens que o modelo "enxerga" de uma vez (entrada + saída). Estourou o limite, o modelo "esquece" o início ou recusa a requisição.
- **Regra prática:** 1.000 tokens ≈ 750 palavras em inglês. Textos com código, números ou outros idiomas consomem mais.

Fonte: https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them

#### Temperatura

Controla a aleatoriedade da saída. Tecnicamente, ajusta a distribuição de probabilidade dos próximos tokens antes da escolha:

- **Baixa (0 a 0,3):** quase determinístico. Sempre escolhe os tokens mais prováveis. Ideal para extração de dados, classificação, código e respostas factuais.
- **Média (0,4 a 0,7):** equilíbrio entre coerência e variação. Bom para texto geral e assistentes.
- **Alta (0,8 a 1,2+):** mais criativo e surpreendente, porém mais propenso a fugir do tema e a alucinar. Útil para brainstorm e escrita criativa.

Parâmetros relacionados: top-p (nucleus sampling) e top-k também limitam de quais tokens o modelo pode escolher. Em geral ajusta-se temperatura ou top-p, não os dois ao mesmo tempo.

#### Embeddings

São representações numéricas (vetores) de um texto que capturam seu significado. Textos com sentido parecido ficam próximos no espaço vetorial, mesmo que usem palavras diferentes ("carro" e "automóvel" ficam perto; "carro" e "banana" ficam longe).

- **Como se mede a proximidade:** por similaridade entre vetores (tipicamente cosine similarity).
- **Para que servem:** busca semântica, recomendação, agrupamento (clustering), detecção de duplicatas e, principalmente, RAG (Retrieval-Augmented Generation), onde se busca o trecho mais relevante de uma base e se injeta no prompt para reduzir alucinação.
- **Onde ficam:** geralmente armazenados em um vector database (ex.: Pinecone, Weaviate, pgvector) para busca rápida.

#### Prompt engineering

Conjunto de técnicas para guiar o modelo a produzir a saída desejada. As principais:

- **Zero-shot:** pedir a tarefa direto, sem exemplos.
- **Few-shot:** incluir alguns exemplos de entrada→saída no prompt para o modelo seguir o padrão.
- **Chain-of-thought (CoT):** pedir que o modelo "pense passo a passo", expondo o raciocínio. Melhora muito tarefas de lógica e matemática.
- **Role prompting:** atribuir um papel ("Você é um revisor de código sênior...") para ajustar tom e foco.
- **Boas práticas gerais:** ser específico, dar contexto, definir o formato de saída esperado e delimitar instruções claramente.

Fonte: https://www.promptingguide.ai/

### 2.6 Limitação central: alucinação

LLMs podem gerar informações falsas com confiança (alucinação), porque otimizam plausibilidade, não verdade. Consequência prática: TODO output de IA precisa de verificação (testes, revisão humana, fontes).

Fonte: https://arxiv.org/abs/2311.05232

---

## 3. Conceito de Contexto (degradação, harness, RAG)

### 3.1 Janela de contexto

É o limite máximo de tokens que o modelo processa de uma vez, somando o que você envia (prompt) e o que ele gera (resposta). Tudo que o modelo "sabe" naquela chamada precisa caber aqui. Ele não tem memória entre chamadas, a menos que você reenvie o histórico.

Fonte: https://www.ibm.com/think/topics/context-window

### 3.2 Degradação de contexto

Dois fenômenos importantes:

- **Lost in the Middle:** o modelo presta mais atenção ao início e ao fim do contexto e tende a "esquecer" o que está no meio. Coloque instruções críticas no começo ou no fim. Fonte: https://arxiv.org/abs/2307.03172
- **Context Rot:** conforme o contexto cresce, a qualidade das respostas degrada mesmo dentro do limite teórico. Lição: mantenha o contexto enxuto e relevante, não jogue tudo dentro. Fonte: https://research.trychroma.com/context-rot

### 3.3 Context Engineering

Evolução do prompt engineering. Em vez de só escrever um bom prompt, você projeta dinamicamente TODO o contexto: quais dados, quais ferramentas, qual histórico e qual instrução o modelo vê em cada passo. Inclui técnicas de compactação (resumir histórico) e recuperação sob demanda.

Fontes: https://blog.langchain.com/the-rise-of-context-engineering/ · https://www.anthropic.com/engineering/effective-context-engineering-for-agents

### 3.4 RAG (Retrieval-Augmented Generation)

Técnica para dar ao modelo conhecimento externo: você busca trechos relevantes (em uma base vetorial, por exemplo) e os injeta no contexto antes de gerar a resposta. Reduz alucinação e permite usar dados privados/atuais sem retreinar o modelo.

Fontes: https://arxiv.org/abs/2005.11401 · https://aws.amazon.com/what-is/retrieval-augmented-generation/

### 3.5 Harness

"Harness" (arnês) é toda a estrutura de software que envolve o modelo e o torna útil: gerencia o contexto, executa as ferramentas, controla o loop de raciocínio-ação e lida com erros. Quando você usa Claude Code ou Cursor, está usando um harness. O modelo é o motor; o harness é o carro.

Fonte (padrões): https://www.anthropic.com/engineering/building-effective-agents

---

## 4. Protocolos de Comunicação entre Agentes

Para que modelos, ferramentas e agentes conversem de forma padronizada surgiram protocolos abertos.

### 4.1 MCP (Model Context Protocol)

Padrão aberto criado pela Anthropic que funciona como um "USB-C para IA": define uma forma única de conectar modelos a fontes de dados e ferramentas. Em vez de integrações sob medida para cada par modelo-ferramenta, você expõe um MCP server e qualquer cliente compatível o usa.

Fontes: https://modelcontextprotocol.io/ · https://spec.modelcontextprotocol.io/ · https://www.anthropic.com/news/model-context-protocol

### 4.2 A2A (Agent2Agent)

Protocolo do Google (agora na Linux Foundation) para agentes de fornecedores diferentes colaborarem entre si: descobrir capacidades uns dos outros, trocar tarefas e resultados. Enquanto o MCP conecta agente a ferramentas, o A2A conecta agente a agente.

Fontes: https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/ · https://github.com/a2aproject/A2A

### 4.3 ACP (Agent Communication Protocol)

Outro esforço de padronização da comunicação entre agentes, com foco em mensagens estruturadas.

Fonte: https://agentcommunicationprotocol.dev/

### 4.4 Function / Tool Calling

Mecanismo no qual o modelo, em vez de responder em texto, devolve uma chamada de função estruturada (nome + argumentos em JSON) que o harness executa. É a base técnica de como agentes "usam ferramentas".

Fonte: https://platform.openai.com/docs/guides/function-calling

---

## 5. Ferramentas (Skills, Comandos, MCP Server Tools)

Ferramentas dão ao modelo capacidades concretas além de gerar texto.

### 5.1 Tool Use

O modelo recebe uma lista de ferramentas disponíveis (cada uma com nome, descrição e parâmetros). Ele decide quando chamar, o harness executa e devolve o resultado, e o modelo continua. Assim ele pode buscar na web, rodar código, ler arquivos etc.

Fonte: https://docs.anthropic.com/en/docs/build-with-claude/tool-use

### 5.2 Skills (Agent Skills)

Skills são pacotes de instruções e recursos que ensinam o agente a executar uma tarefa específica de forma consistente (ex.: "gerar relatório no padrão da empresa"). Ficam disponíveis e são carregadas quando relevantes, economizando contexto.

Fontes: https://www.anthropic.com/news/skills · https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview

### 5.3 Comandos (Slash Commands)

Atalhos definidos pelo usuário (ex.: /review, /test) que disparam prompts ou fluxos pré-configurados dentro do harness. Padronizam tarefas repetitivas do time.

Fonte: https://docs.claude.com/en/docs/claude-code/slash-commands

### 5.4 MCP Server Tools

Ferramentas expostas por um MCP server. Você (ou a comunidade) cria um servidor que oferece capacidades (acessar GitHub, banco de dados, sistema de arquivos) e qualquer cliente MCP passa a usá-las.

Fontes: https://github.com/modelcontextprotocol/servers · https://modelcontextprotocol.io/quickstart/server · https://modelcontextprotocol.io/docs/sdk

---

## 6. Agentes de IA

### 6.1 O que é um agente

Um agente é um sistema em que o LLM, em loop, planeja, escolhe e usa ferramentas, observa resultados e decide o próximo passo até concluir um objetivo, com autonomia. Diferente de uma única pergunta-resposta, o agente persegue uma meta em vários passos.

Fonte: https://www.anthropic.com/engineering/building-effective-agents

### 6.2 Padrões fundamentais

- **ReAct (Reasoning + Acting):** o modelo alterna entre raciocinar ("preciso buscar X") e agir (chamar ferramenta), usando o resultado para o próximo raciocínio. https://arxiv.org/abs/2210.03629
- **Reflexion:** o agente critica o próprio resultado e tenta de novo, aprendendo com o erro dentro da tarefa. https://arxiv.org/abs/2303.11366

### 6.3 Frameworks

- LangGraph / LangChain Agents: https://langchain-ai.github.io/langgraph/ · https://python.langchain.com/docs/concepts/agents/
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/
- CrewAI (equipes de agentes): https://docs.crewai.com/
- AutoGen (Microsoft): https://microsoft.github.io/autogen/

### 6.4 Segurança

Agentes que executam ações têm superfície de ataque maior (ex.: prompt injection que faz o agente vazar dados). O OWASP Top 10 para aplicações LLM cataloga os riscos principais.

Fonte: https://genai.owasp.org/llm-top-10/

---

## 7. Harness (Claude Code, Roo, Kimi, etc.)

O harness é o ambiente que orquestra modelo + ferramentas + loop de codificação. Principais opções:

- **Claude Code:** harness de linha de comando da Anthropic, foco em agente que lê/edita seu repositório.
  - Docs: https://docs.claude.com/en/docs/claude-code/overview
  - Boas práticas: https://www.anthropic.com/engineering/claude-code-best-practices
- **Roo Code:** extensão do VS Code, multi-modo (arquiteto, codificador, etc.) e orquestração. https://docs.roocode.com/ · https://github.com/RooCodeInc/Roo-Code
- **Cline:** agente open-source para VS Code. https://github.com/cline/cline
- **Aider:** pair programming em IA no terminal, integra com git. https://aider.chat/
- **Cursor:** editor com IA integrada. https://docs.cursor.com/
- **GitHub Copilot:** assistente integrado a editores e GitHub. https://docs.github.com/en/copilot
- **Kimi (Moonshot AI):** modelos com contexto muito longo e ferramentas agentivas. https://platform.moonshot.ai/ · https://moonshotai.github.io/Kimi-K2/
- **Gemini CLI:** https://github.com/google-gemini/gemini-cli
- **OpenAI Codex CLI:** https://github.com/openai/codex

Como escolher: avalie integração com seu editor/CI, suporte a MCP, controle de contexto, modos de revisão (plan mode) e custo.

---

## 8. Spec-Driven Development (SDD)

### 8.1 Conceito

Em vez de pedir código solto à IA, você escreve primeiro uma especificação estruturada (o quê, requisitos, critérios de aceitação, plano técnico). Essa spec vira a fonte da verdade que guia o agente. Isso reduz ambiguidade, melhora a qualidade e torna o resultado auditável e reproduzível.

A diferença na prática:

❌ Prompt solto (ambíguo):

> "Faz um endpoint de login pra mim."

O agente adivinha tudo: formato do token, validações, mensagens de erro, banco de dados. Cada execução gera algo diferente.

✅ Spec-driven (sem ambiguidade):

> "Endpoint POST /login que recebe email e senha, valida contra a tabela users (senha em bcrypt), retorna um JWT válido por 24h em caso de sucesso (200) e 401 com mensagem genérica em caso de falha. Rate limit de 5 tentativas/min por IP."

O agente tem critérios objetivos para acertar e você tem critérios objetivos para verificar.

### 8.2 Fluxo típico

1. **Especificar:** descrever objetivo e requisitos.
2. **Planejar:** a IA propõe arquitetura e passos; humano aprova.
3. **Decompor em tarefas.**
4. **Implementar** tarefa a tarefa, validando contra a spec.

**Exemplo de cada etapa**

**1. Especificar** — o "o quê" e o "porquê", com critérios de aceitação:

```markdown
# Spec: Exportação de relatório em CSV

## Objetivo
Permitir que o usuário exporte sua lista de pedidos em CSV.

## Requisitos
- Botão "Exportar CSV" na tela de pedidos.
- Exporta apenas pedidos do usuário logado.
- Colunas: id, data, valor_total, status.

## Critérios de aceitação
- [ ] Arquivo abre corretamente no Excel e no Google Sheets.
- [ ] Datas no formato YYYY-MM-DD.
- [ ] Valores com 2 casas decimais e ponto como separador.
- [ ] Usuário sem pedidos recebe CSV só com o cabeçalho.
```

**2. Planejar** — a IA propõe o "como" e você aprova antes de uma linha de código:

```markdown
# Plano técnico (proposto pela IA, aprovado pelo humano)
- Rota: GET /orders/export
- Camada de serviço reaproveita OrderService.listByUser()
- Geração de CSV com a lib csv-writer
- Stream da resposta (não carregar tudo em memória)
- Header: Content-Disposition: attachment; filename="orders.csv"
```

**3. Decompor** — quebrar em tarefas pequenas e verificáveis:

```markdown
- [ ] T1: criar rota GET /orders/export
- [ ] T2: implementar serviço de geração de CSV
- [ ] T3: aplicar formatação de data e valor
- [ ] T4: tratar caso de lista vazia
- [ ] T5: testes automatizados cobrindo os 4 critérios de aceitação
```

**4. Implementar** — o agente faz uma tarefa por vez, e cada entrega é checada contra a spec. Se T3 não formatar a data como YYYY-MM-DD, falha no critério de aceitação e volta, sem precisar revisar o resto.

### 8.3 Ferramentas

- **GitHub Spec Kit:** toolkit open-source para SDD. Estrutura o fluxo em comandos como /specify (escrever a spec), /plan (gerar o plano técnico) e /tasks (decompor em tarefas). https://github.com/github/spec-kit · https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- **Amazon Kiro:** IDE orientado a spec. Gera automaticamente três arquivos por feature: requirements.md, design.md e tasks.md, mantendo spec e código sincronizados. https://kiro.dev/ · https://kiro.dev/docs/specs/

### 8.4 Arquivos de contexto do projeto

Definir regras e contexto persistentes para o agente, para não repetir as mesmas instruções a cada prompt.

Exemplo de AGENTS.md ou CLAUDE.md na raiz do projeto:

```markdown
# Contexto do projeto
API de e-commerce em Node.js + TypeScript + PostgreSQL.

## Convenções
- Use TypeScript estrito; nada de any.
- Testes com Vitest; toda feature precisa de teste.
- Commits no padrão Conventional Commits.

## Comandos
- npm run dev   inicia o servidor local
- npm test      roda os testes
- npm run lint  verifica o estilo

## Regras
- Nunca commitar segredos; use variáveis de ambiente.
- Migrations de banco sempre via npm run migrate.
```

Com esse arquivo, o agente já sabe a stack, as convenções e os comandos, sem você precisar reexplicar a cada sessão.

- CLAUDE.md / memory: https://docs.claude.com/en/docs/claude-code/memory
- AGENTS.md (padrão aberto entre ferramentas): https://agents.md/

---

## 9. Sub-Agent Driven Development

### 9.1 Conceito

Em vez de um único agente gigante fazendo tudo (e estourando o contexto), você decompõe o trabalho em subagentes especializados, cada um com seu próprio contexto isolado e papel (ex.: pesquisador, codificador, revisor, testador). Um agente orquestrador coordena.

A diferença na prática:

❌ Agente único (contexto sobrecarregado):

> "Pesquise as melhores libs de pagamento, implemente a integração, escreva os testes e revise tudo."

Um só agente acumula pesquisa + código + testes + revisão na mesma janela de contexto. Ele "esquece" decisões do início, mistura papéis e a qualidade cai conforme o contexto enche.

✅ Subagentes especializados (contexto isolado):

Orquestrador divide: o pesquisador compara libs e devolve só a recomendação; o codificador recebe essa recomendação e implementa; o testador escreve os testes; o revisor audita o resultado. Cada um só vê o que precisa.

Cada subagente trabalha limpo, focado em uma responsabilidade.

### 9.2 Por que funciona

- Evita degradação de contexto (cada subagente vê só o que precisa).
- Especialização melhora qualidade.
- Paralelismo: vários subagentes trabalham ao mesmo tempo.

**Exemplo concreto**

Imagine a tarefa "adicionar autenticação 2FA ao app":

Resultado: cada janela de contexto fica pequena e relevante, dois agentes rodam em paralelo (codificador + testador) e a especialização eleva a qualidade de cada parte.

### 9.3 Padrão orquestrador-trabalhador

Um agente líder divide a tarefa, delega a subagentes, coleta e integra os resultados. A Anthropic descreve esse padrão em um sistema de pesquisa multiagente real.

Como o fluxo acontece:

O orquestrador não faz o trabalho braçal: ele planeja, delega e integra. Os trabalhadores não falam entre si diretamente, eles reportam de volta ao líder, que junta as peças. Isso mantém a coordenação simples e evita que subagentes "briguem" pelo mesmo contexto.

Quando NÃO usar: se a tarefa é simples e cabe num único contexto, multiagente só adiciona overhead (mais chamadas, mais custo, mais latência). A própria Anthropic recomenda começar simples e só escalar para multiagente quando o problema realmente exige.

Fontes: https://docs.claude.com/en/docs/claude-code/sub-agents · https://www.anthropic.com/engineering/built-multi-agent-research-system · https://www.anthropic.com/engineering/building-effective-agents

### 9.4 Suporte em ferramentas

- **Roo Code** (modos e orquestração Boomerang): cada "modo" é um subagente com papel próprio (Architect, Code, Debug); o padrão Boomerang faz uma tarefa voltar ao orquestrador após cada subtarefa. https://docs.roocode.com/features/custom-modes · https://docs.roocode.com/features/boomerang-tasks
- **CrewAI (Crews):** você define uma "crew" de agentes com papéis e objetivos, e eles colaboram em sequência ou em paralelo. https://docs.crewai.com/concepts/crews
- **LangGraph (multi-agente):** modela o sistema como um grafo, onde cada nó é um agente e as arestas definem o fluxo de controle entre eles. https://langchain-ai.github.io/langgraph/concepts/multi_agent/

Exemplo mínimo de definição de subagente (estilo Claude Code):

```yaml
---
name: revisor-seguranca
description: Revisa código em busca de falhas de segurança.
tools: Read, Grep
---

Você é um revisor de segurança sênior. Analise o código
em busca de: segredos expostos, injeção de SQL, falta de
rate limit e validação de entrada. Devolva apenas os
problemas encontrados e como corrigi-los.
```

Com isso, o orquestrador pode invocar o revisor-seguranca sob demanda, e ele roda no próprio contexto isolado, com acesso só às ferramentas que precisa.

---

## 10. Aplicação: Waterfall + Extreme Programming + Pair Programming (Zero Code)

A síntese prática. Combine a disciplina de fases da Cascata, as práticas de qualidade do XP e o papel de "par" humano sobre o agente, em um fluxo em que o humano não escreve código diretamente (zero code), mas dirige, revisa e aprova.

### 10.1 As práticas que estamos combinando

Extreme Programming (XP) traz práticas técnicas essenciais:

- **TDD (Test-Driven Development):** escreva o teste antes do código. O teste define o comportamento esperado e dá uma rede de segurança. Crucial com IA, pois o teste verifica objetivamente o código gerado. https://martinfowler.com/bliki/TestDrivenDevelopment.html
- **Refactoring:** melhorar a estrutura do código sem mudar o comportamento, continuamente. https://refactoring.com/
- **Continuous Integration:** integrar e testar mudanças com frequência para detectar problemas cedo. https://martinfowler.com/articles/continuousIntegration.html
- **Práticas gerais do XP:** http://www.extremeprogramming.org/rules.html

O ciclo do TDD é o coração da qualidade aqui.

**Exemplo de TDD com IA (você dirige, a IA executa):**

**Pair Programming:** dois papéis, o "condutor" (driver) que escreve e o "navegador" (navigator) que revisa e pensa à frente. No desenvolvimento assistido, a IA é o driver e VOCÊ é o navegador: revisa cada mudança, questiona decisões, garante direção.

Fontes: https://martinfowler.com/articles/on-pair-programming.html · https://github.blog/news-insights/product-news/github-copilot-your-ai-pair-programmer/

**Vibe coding / Zero Code:** termo de Andrej Karpathy para descrever guiar a IA em linguagem natural, aceitando e iterando sobre o código que ela produz, sem escrevê-lo manualmente. Funciona bem com supervisão e testes; é perigoso sem revisão.

⚠️ O risco do zero code sem rede de segurança: aceitar código que você não leu nem testou acumula dívida e bugs invisíveis. O que torna o modelo seguro é a combinação spec + TDD + humano como gate. Sem isso, é só "caos acelerado".

Fontes: https://en.wikipedia.org/wiki/Vibe_coding · https://twitter.com/karpathy/status/1886192184808149383

### 10.2 Mapeamento de fases (o fluxo combinado)

| Fase (Waterfall) | Prática XP/Par | Como a IA atua | Referência |
|---|---|---|---|
| Requisitos | User stories | IA estrutura a spec; humano revisa | https://github.com/github/spec-kit |
| Design | Simple design / planning | IA propõe arquitetura; humano aprova o plano | https://docs.claude.com/en/docs/claude-code/common-workflows |
| Implementação | TDD + Pair | IA escreve testes e código; humano navega/revisa | https://martinfowler.com/bliki/TestDrivenDevelopment.html |
| Verificação | CI + refactoring | IA roda testes e refatora sob revisão | https://martinfowler.com/articles/continuousIntegration.html |
| Manutenção | Collective ownership | Subagentes especializados evoluem o código | https://docs.claude.com/en/docs/claude-code/sub-agents |

O fluxo com os gates humanos (note os pontos de aprovação):

Cada losango é um gate: o fluxo só avança com aprovação humana ou testes verdes. Reprovou, volta para a fase anterior, exatamente a disciplina da Cascata, mas com iteração barata do Agile dentro de cada fase.

### 10.3 Boas práticas do modelo Zero Code supervisionado

- **Humano como gate:** aprove explicitamente cada fase antes de avançar. https://www.anthropic.com/engineering/claude-code-best-practices
- **Testes sempre:** exija testes automatizados gerados E executados para cada mudança. https://martinfowler.com/bliki/TestDrivenDevelopment.html
- **Segurança em primeiro lugar:** revise o código gerado contra os riscos conhecidos. https://genai.owasp.org/llm-top-10/ · https://www.nist.gov/itl/ai-risk-management-framework
- **Contexto curado:** use spec + arquivos de regra (AGENTS.md/CLAUDE.md) para manter o agente alinhado. https://agents.md/
- **Meça resultados:** acompanhe métricas DORA e evidências de produtividade para validar ganhos reais. https://dora.dev/research/2024/dora-report/ · https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/

**Checklist rápido antes de aprovar cada gate:**

```markdown
- [ ] A spec descreve critérios de aceitação objetivos?
- [ ] Existe teste automatizado para a mudança? Ele estava vermelho antes?
- [ ] Todos os testes estão verdes agora (CI)?
- [ ] Revisei o diff de segurança (segredos, injeção, validação)?
- [ ] O agente seguiu as regras do AGENTS.md/CLAUDE.md?
- [ ] Sei explicar o que esse código faz (não aceitei às cegas)?
```

Se algum item estiver desmarcado, o gate não passou.

---

---

## 11. Loop Engineering

> Este guia ENSINA os três pilares de um workflow agêntico de codificação orientado a contrato e testes. Cada seção explica a teoria, mostra como funciona na prática e ancora num exemplo de um workflow de referência (setup determinístico + workflow multi-agente Contract → Implement → Report).

### Por que esses três pilares

Desenvolvimento assistido por IA de alta qualidade não é "pedir código e colar". É desenhar um SISTEMA que produz código correto de forma repetível. Esse sistema tem três disciplinas complementares:

- **Loop Engineering** — projetar o ciclo de execução do agente: o que roda, quantas vezes, quando para, quem julga e como se recupera de erro. É o "motor" que roda em repetição controlada.
- **Ralph Loop** — um padrão específico de loop: rodar o agente repetidamente sobre a MESMA tarefa até um critério de aprovação ser atingido. No workflow de referência isso vira um ciclo TDD com um juiz (modelo forte) que aprova ou rejeita cada tentativa.
- **Graph Engineering** — modelar o trabalho como um GRAFO de dependências (DAG), ordenar por toposort e executar respeitando as arestas. É o que define a ORDEM e o TAMANHO de cada unidade de trabalho.

No workflow de referência os três aparecem juntos: o *contrato* vira um grafo de itens (dependsOn), o grafo é ordenado por toposort (graph engineering), e cada item é implementado dentro de um ralph loop TDD (loop + ralph engineering).

### 11.1 O que é um loop agêntico

Um agente de IA opera em LOOP: ele raciocina, age (usa ferramenta), observa o resultado e decide o próximo passo, repetindo até concluir o objetivo. Loop Engineering é a disciplina de PROJETAR esse ciclo com intenção, em vez de deixá-lo implícito. O padrão base é o loop raciocínio-ação (ReAct) e sua variante com auto-crítica (Reflexion).

Fontes: https://www.anthropic.com/engineering/building-effective-agents · https://arxiv.org/abs/2210.03629 · https://arxiv.org/abs/2303.11366

### 11.2 As decisões de projeto de um loop

Ao engenheirar um loop, você define explicitamente:

- **Unidade de trabalho** — o que UM passo do loop produz. No workflow de referência a unidade é "um item do contrato, pequeno o bastante para UM commit". Unidades pequenas = loops mais confiáveis e reversíveis.
- **Condição de término** — quando o loop para. Pode ser "objetivo atingido", "juiz aprovou", "máximo de tentativas" ou "erro fatal". Sem término claro, o loop trava ou gasta tokens à toa.
- **Critério de sucesso / juiz** — quem decide que o passo está bom. No workflow de referência é um modelo forte no papel de juiz (padrão LLM-as-judge). Ver seção 12.4.
- **Estratégia de retry** — o que acontece quando o passo falha. No workflow de referência, rejeição do juiz volta com feedback específico e incrementa attempt++, tentando de novo até aprovar.
- **Estado / memória entre passos** — como o contexto sobrevive entre iterações. No workflow de referência, arquivos de memória são a fonte de verdade; cada subagente parte de contexto FRESCO lendo esses arquivos (evita context rot).
- **Guardrails** — invariantes que o loop nunca pode violar (ex.: "nunca burlar o hook de commit", "nunca escreve fora da área de trabalho isolada", "nunca push").

### 11.3 Loop sequencial vs. paralelo (fan-out)

Um loop pode processar itens em paralelo (fan-out) ou um por vez (sequencial). O workflow de referência escolhe DELIBERADAMENTE o sequencial: "um item por vez, sem fan-out paralelo". Motivo: os itens têm dependências (um reescreve linhas que o outro criou), então paralelizar causaria conflito. Loop Engineering é justamente tomar essa decisão com base na estrutura do trabalho (que vem do grafo, seção 13).

### 11.4 Por que contexto fresco a cada iteração

LLMs sofrem de degradação de contexto: quanto mais longo e poluído o histórico, pior a resposta (fenômenos "lost in the middle" e "context rot"). Loops bem engenheirados NÃO acumulam todo o histórico numa única janela; eles persistem o estado essencial fora do modelo (arquivos, banco) e recarregam só o necessário a cada iteração. É exatamente o que os arquivos de memória fazem no workflow de referência.

Fontes: https://arxiv.org/abs/2307.03172 · https://research.trychroma.com/context-rot · https://www.anthropic.com/engineering/effective-context-engineering-for-agents

### 11.5 Setup determinístico antes do loop

Nem tudo deve ser feito pelo LLM. Loop Engineering separa a parte DETERMINÍSTICA (scripts confiáveis) da parte que exige raciocínio. No workflow de referência, os passos de setup são determinísticos: resolver o ticket, criar a área de trabalho/branch, copiar variáveis de ambiente, instalar dependências, cross-check, extrair contratos, gerar a tasklist, escrever a memória inicial. Só depois o workflow invoca os LLMs. Regra prática: se dá para fazer com código confiável, não delegue ao modelo.

---

## 12. Ralph Loop

### 12.1 Origem: a técnica "Ralph"

"Ralph" é a técnica de rodar um agente de codificação em loop contínuo sobre a mesma tarefa/prompt, deixando-o iterar repetidamente até convergir para uma solução. A ideia contraintuitiva: um agente "simples" rodando em repetição persistente, com bons guardrails, resolve tarefas complexas que uma única passada não resolveria.

Fonte: https://ghuntley.com/ralph/

### 12.2 O ralph loop do workflow de referência: TDD com juiz

O workflow de referência refina o Ralph puro num loop TDD disciplinado, com um JUIZ que aprova cada etapa. Em vez de "roda até parecer pronto", é "roda até o juiz aprovar, com testes verdes". O ciclo por item tem 5 passos:

| Passo | Quem | Modelo | Faz |
|---|---|---|---|
| A. Testes (TDD red) | agente dev | modelo do item | Escreve só testes; roda e CONFIRMA que falham (red). Se passam de cara, reescreve. |
| B. Review dos testes | agente juiz | modelo forte | Testes cobrem objetivo+AC? Usam contratos como declarado? Seguem regras? Red verificado? Aprova só se tudo. |
| C. Implementação | agente dev | modelo do item | Faz os testes passarem (green); lint + style; autofix até limpo. NÃO commita. |
| D. Review final | agente juiz | modelo forte | Requisito satisfeito? Contratos verbatim? Regras (com file:line)? Testes ainda verdes? Scope creep? Aprova só se tudo. |
| E. Commit | agente | modelo leve | git add só os arquivos esperados (nunca -A); commit semântico; NUNCA burla o hook. |

Rejeição em B ou D volta com feedback específico e nova tentativa (attempt++). Só avança ao commit quando o juiz aprova. Item commitado → completed, próximo item.

### 12.3 Por que TDD é o núcleo do ralph loop

TDD (escrever o teste ANTES do código) é ideal para loops de IA porque o teste é um critério de sucesso OBJETIVO e executável. O passo A força o "red" (teste falhando) para provar que o teste realmente testa algo; o passo C busca o "green" (teste passando). Isso transforma "o código está bom?" (subjetivo) em "os testes passam?" (verificável). Sem TDD, o loop não tem como saber se convergiu.

Fonte: https://martinfowler.com/bliki/TestDrivenDevelopment.html

### 12.4 O padrão LLM-as-judge (o "juiz")

Usar um modelo forte para avaliar a saída de outro (ou de si mesmo) é o padrão "LLM-as-a-judge". No workflow de referência, um modelo forte é o juiz: nunca implementa, só JULGA (produz o contrato e faz os reviews B e D). Boas práticas do padrão: critérios de aprovação explícitos, feedback acionável na rejeição e o juiz rodando os testes de fato (não confiando só na leitura). Separar "quem faz" de "quem julga" reduz o viés do agente aprovar o próprio trabalho.

Fonte: https://arxiv.org/abs/2306.05685

### 12.5 Model tiering (economia e adequação)

Nem toda etapa precisa do modelo mais caro. O workflow de referência atribui modelos por complexidade:

- **modelo leve** — mecânico puro: arquivo de types, enum, const estática, wrapper de estilo, extrair styles, remover código morto, o commit.
- **modelo médio** — lógica, hooks, containers, testes com asserts reais, mudanças em fluxo de dados/condicionais.
- **modelo forte** — reservado ao JUIZ (contrato + reviews). Nunca atribuído a itens de implementação.

Isso é Loop Engineering aplicado a custo: reserve o modelo caro para o julgamento, use os baratos para o trabalho mecânico.

### 12.6 Guardrails do ralph loop

Loops autônomos precisam de trilhos rígidos para não causar dano:

- Nunca ramifica de main/master.
- Agentes nunca escrevem fora da área de trabalho isolada.
- Não passa do cross-check com inconsistências não resolvidas.
- Contratos de interface são IMUTÁVEIS — usados verbatim em todo item.
- Nunca burla o hook de commit: se o hook falha, corrige e faz commit NOVO (nunca amend).
- Commita por item, mas NUNCA dá push e NUNCA muda o estado do ticket além do combinado.

Git worktree é o que dá o isolamento físico do loop: uma árvore de trabalho separada por branch.

Fonte: https://git-scm.com/docs/git-worktree

---

## 13. Graph Engineering

### 13.1 O trabalho como um grafo (DAG)

Graph Engineering é modelar as tarefas como um GRAFO DIRIGIDO ACÍCLICO (DAG): cada item é um nó, e uma aresta A → B significa "B depende de A". "Dirigido" = as dependências têm direção. "Acíclico" = não há ciclos (A não pode depender de B que depende de A). No workflow de referência, o contrato define cada item com um campo dependsOn[], que são exatamente as arestas do grafo.

Fonte: https://en.wikipedia.org/wiki/Directed_acyclic_graph

### 13.2 Toposort: transformar o grafo em uma ordem de execução

Uma ordenação topológica (toposort) produz uma sequência linear dos nós tal que todo nó aparece DEPOIS de suas dependências. É assim que o workflow de referência decide a ordem: os itens são ordenados por toposort do grafo dependsOn e então percorridos sequencialmente. Algoritmos clássicos: Kahn (por grau de entrada) e DFS.

Fonte: https://en.wikipedia.org/wiki/Topological_sorting

### 13.3 Quebra de ciclos

Toposort só existe se o grafo for acíclico. Se houver um ciclo (dependência circular), não há ordem válida. O workflow de referência lida com isso "quebrando ciclos com aviso" — ou seja, detecta o ciclo, escolhe onde cortar e segue, mas sinaliza que houve uma dependência circular a revisar. Bom Graph Engineering torna ciclos visíveis, não os esconde.

### 13.4 Granularidade dos nós: um commit por item

A regra "cada item pequeno o bastante para UM commit" é uma decisão de Graph Engineering. Nós pequenos:

- geram commits atômicos e reversíveis;
- cabem no contexto de uma iteração do loop (menos context rot);
- isolam falhas (se um item quebra, os anteriores já estão commitados).

Quando um item "incha", o contrato o QUEBRA em vários com arestas dependsOn entre eles. Ou seja, o tamanho do nó e as arestas são co-desenhados.

### 13.5 O contrato como grafo imutável e completo

Na Fase Contract, o modelo forte transforma o plano num grafo de requisitos com duas propriedades fortes:

- **Cobertura total** — todo item de DoD/AC do ticket/specs é coberto por ≥1 nó. Nada é descartado silenciosamente. (Completude do grafo.)
- **Imutabilidade dos contratos de interface** — interfaces/types/enums extraídos das specs são congelados e batem verbatim em cada nó (sem rename/reshape/widening/narrowing).

Cada nó carrega metadados ricos: id, title, why, projectRules[], specs{...}, objective, files[], model, testStrategy, dependsOn[]. Esses metadados são o que alimenta o loop da Fase 2.

### 13.6 Como grafo e loop se encaixam

O grafo responde "O QUÊ e em que ORDEM"; o loop responde "COMO cada item é feito". O toposort do grafo alimenta o loop sequencial; as arestas dependsOn são o que JUSTIFICA ser sequencial (ex.: cadeia A → B → C, onde C reescreve as mesmas linhas de B). Sem o grafo, o loop não saberia a ordem segura; sem o loop, o grafo seria só um plano estático.

---

## 14. Juntando tudo: a anatomia do workflow

```
Setup determinístico
ticket + specs → área isolada → cross-check → contratos → tasklist → memória
        ↓
Fase 1 — CONTRACT (modelo forte, juiz)
plano → grafo de itens (dependsOn)
1 commit por item · cobertura total · contratos imutáveis
        ↓ [Graph Engineering]
Fase 2 — IMPLEMENT
toposort(grafo) → item a item, sequencial
        ↓ [Graph + Loop + Ralph]
Fase 3 — REPORT
relatório: itens aplicados/total · contratos congelados · tabela por item
```

**Ralph loop TDD (por item, retry até o juiz aprovar):**

```
A. Testes (red) → B. Review testes (juiz) → C. Implementação (green) → D. Review final (juiz) → E. Commit
         ↑                    |                                                      |
         └──── rejeita ───────┘                                                      |
         ↑                                                                           |
         └────────────────────────── rejeita ─────────────────────────────────────-─┘
```

- **Graph Engineering** vive na Fase Contract (montar o DAG) e no início da Fase Implement (toposort).
- **Loop Engineering** define a estrutura da Fase Implement (sequencial, memória fresca, guardrails, término).
- **Ralph Loop** é o miolo por item: A→E com juiz e retry.

---

## 15. Checklist de boas práticas (Loop, Ralph, Graph)

**Loop Engineering**

```markdown
- [ ] Unidade de trabalho pequena e reversível (idealmente "um commit").
- [ ] Condição de término explícita (aprovação do juiz + testes verdes + limite de tentativas).
- [ ] Estado persistido FORA do modelo (arquivos de memória), recarregado fresco a cada iteração.
- [ ] Parte determinística separada da parte que exige LLM.
- [ ] Guardrails duros e não-negociáveis codificados no workflow.
```

**Ralph Loop**

```markdown
- [ ] TDD: teste primeiro, red verificado antes do green.
- [ ] Juiz separado do executor (LLM-as-judge); juiz RODA os testes.
- [ ] Rejeição gera feedback acionável + nova tentativa (não segue quebrado).
- [ ] Model tiering: modelo caro só no julgamento; barato no mecânico.
- [ ] Commit atômico, semântico, sem burlar o hook, sem push automático.
```

**Graph Engineering**

```markdown
- [ ] Modele dependências como DAG explícito (dependsOn).
- [ ] Ordene por toposort; detecte e sinalize ciclos.
- [ ] Cobertura total: todo requisito de DoD/AC vira ≥1 nó.
- [ ] Contratos de interface imutáveis e verbatim em cada nó.
- [ ] Quebre nós grandes em nós menores conectados por arestas.
```

---

## 16. Anti-padrões

Anti-padrão = uma solução que parece boa mas gera problema. Abaixo, os mais comuns em cada pilar, com o "cheiro" (como detectar), por que dói e a correção que o workflow de referência aplica.

### 16.1 Anti-padrões de Loop Engineering

**A. Loop sem condição de término ("loop infinito otimista")**
- Cheiro: "roda até ficar bom" sem definir o que é "bom" nem um teto de tentativas.
- Por que dói: queima tokens, trava, ou o agente declara vitória prematuramente.
- Correção: término explícito. O loop só encerra quando o juiz aprova E os testes estão verdes; a rejeição incrementa attempt++ (retry acotado, com feedback).

**B. Acúmulo de contexto ("bola de neve de histórico")**
- Cheiro: cada iteração empilha todo o histórico anterior na mesma janela.
- Por que dói: context rot e "lost in the middle" degradam a qualidade justamente quando a tarefa cresce.
- Correção: estado persistido FORA do modelo. Os arquivos de memória são a fonte de verdade, e cada subagente parte de contexto FRESCO lendo só o que precisa. Fontes: https://arxiv.org/abs/2307.03172 · https://research.trychroma.com/context-rot

**C. Delegar ao LLM o que é determinístico**
- Cheiro: pedir ao modelo para criar branch, instalar dependências, mudar estado do ticket, montar caminhos.
- Por que dói: não-determinismo em passos que precisam ser 100% confiáveis; falhas silenciosas.
- Correção: setup determinístico em script; o LLM só entra na fase de raciocínio. Regra: se dá para fazer com código confiável, não delegue ao modelo.

**D. O executor é o próprio juiz ("réu no tribunal")**
- Cheiro: o mesmo agente que escreve o código também aprova o código.
- Por que dói: viés de auto-aprovação; o agente tende a validar o próprio trabalho.
- Correção: separar papéis. O modelo forte é o juiz (contrato + reviews B/D) e NUNCA implementa itens. Fonte: https://arxiv.org/abs/2306.05685

**E. Juiz que só lê, não executa**
- Cheiro: o review aprova "parece que os testes passam" sem rodar.
- Por que dói: alucinação — o modelo "acha" que passa.
- Correção: no Passo D o juiz RODA os testes e verifica o green de fato.

**F. Modelo caro para tudo (ou barato para tudo)**
- Cheiro: usar o modelo forte até para criar um enum, ou usar o modelo leve para revisar lógica crítica.
- Por que dói: custo desnecessário ou qualidade insuficiente.
- Correção: model tiering — leve (mecânico), médio (lógica/testes), forte (só juiz).

### 16.2 Anti-padrões de Ralph Loop

**G. Green sem red ("teste que não testa")**
- Cheiro: escrever o teste e ele já passa de primeira.
- Por que dói: teste que nunca falha não prova nada; pode estar testando o nada.
- Correção: Passo A exige confirmar o RED; se passa de cara, reescreve o teste. Fonte: https://martinfowler.com/bliki/TestDrivenDevelopment.html

**H. Rejeição vaga ("tá ruim, tenta de novo")**
- Cheiro: o juiz rejeita sem dizer o quê e onde.
- Por que dói: o próximo attempt repete o erro; o loop não converge.
- Correção: feedback acionável e específico (com file:line nos reviews D). A nova tentativa parte do que foi apontado.

**I. Burlar o portão de qualidade (pular o hook, amend)**
- Cheiro: quando o git hook falha, o agente pula a verificação ou dá --amend para "resolver rápido".
- Por que dói: mascara falhas de lint/commit-msg; reescreve história e some com o problema.
- Correção: NUNCA burlar o hook. Se o hook falha, corrige e faz commit NOVO (nunca amend).

**J. Commit-tudo (git add -A)**
- Cheiro: git add -A / git add . no passo de commit.
- Por que dói: arrasta arquivos não intencionais (build, variáveis de ambiente, lixo) para o commit do item.
- Correção: git add só os arquivos ESPERADOS daquele item (declarados em files[]).

**K. Scope creep dentro do item**
- Cheiro: o item "aproveita e refatora" algo fora do seu objetivo.
- Por que dói: quebra a atomicidade (o commit deixa de mapear 1:1 com o requisito) e escapa da revisão.
- Correção: o Passo D checa explicitamente scope creep; nada além das specs.

### 16.3 Anti-padrões de Graph Engineering

**L. Nó grande demais ("épico disfarçado de item")**
- Cheiro: um item que não cabe em um commit; toca 15 arquivos e três camadas.
- Por que dói: não cabe no contexto de uma iteração (context rot), a revisão fica difícil e a falha não isola.
- Correção: "cada item pequeno o bastante para UM commit"; se incha, o contrato QUEBRA em vários nós ligados por dependsOn.

**M. Dependência oculta ("acoplamento fantasma")**
- Cheiro: C na verdade depende de B, mas o dependsOn não registra isso.
- Por que dói: o toposort pode ordenar C antes de B; C quebra ou reescreve algo inconsistente.
- Correção: declarar TODA aresta real.

**N. Ciclo ignorado ("dependência circular escondida")**
- Cheiro: A depende de B e B depende de A; toposort não tem ordem válida.
- Por que dói: trava a ordenação ou produz ordem arbitrária silenciosa.
- Correção: detectar e QUEBRAR ciclos com aviso (não esconder). Ciclo é sinal de que os nós foram mal fatiados.

**O. Requisito órfão ("DoD que sumiu")**
- Cheiro: um critério de aceitação do ticket não está coberto por nenhum item.
- Por que dói: a feature entrega incompleta e ninguém percebe até o fim.
- Correção: cobertura total — todo item de DoD/AC vira ≥1 nó; nada é descartado silenciosamente.

**P. Reshape de contrato de interface ("melhorei a interface")**
- Cheiro: um item renomeia um campo, alarga um tipo ou "arruma" uma interface das specs.
- Por que dói: quebra o contrato com quem consome; os nós deixam de ser compatíveis entre si.
- Correção: contrato imutável — interface/type/enum verbatim em todo nó (sem rename/reshape/widening/narrowing).

---

## 17. Detalhando a modelagem do grafo

Aqui destrinchamos como um plano vira um DAG executável, usando uma cadeia de exemplo: A → B → C.

### 17.1 De requisito a nó

Cada nó do grafo é um item de contrato com metadados. Estrutura de um nó:

```json
{
  "id": "B",
  "title": "Ligar o container ao hook de dados",
  "why": "AC-2 exige que a lista reflita o estado remoto em tempo real",
  "projectRules": ["Object Calisthenics: sem else", "..."],
  "specs": {
    "interfaces": ["DataHookResult"],
    "types": ["RowModel"],
    "props": ["rows: RowModel[]", "isLoading: boolean"],
    "signatures": ["useData(id: string): DataHookResult"],
    "acceptanceCriteria": ["AC-2: lista atualiza ao aplicar"],
    "notes": "reaproveita o loading do container"
  },
  "objective": "consumir useData no container e passar props ao componente",
  "files": ["src/containers/ExampleContainer/ExampleContainer.tsx"],
  "model": "medio",
  "testStrategy": "render + mock do hook, assert nas linhas renderizadas",
  "dependsOn": ["A"]
}
```

Repare: `dependsOn` é o que cria a ARESTA. `files` é o que delimita o git add no commit (evita o anti-padrão J). `specs.interfaces/types` são verbatim das specs (evita o anti-padrão P).

### 17.2 Descobrindo as arestas (a lógica das dependências)

A pergunta que define cada aresta é: "o item Y pode ser feito de forma correta e testável SEM que X já esteja pronto?" Se não, então Y dependsOn X.

No exemplo:
- A cria o hook de dados (a fonte de dados).
- B liga o container ao hook. Para o teste de B fazer sentido (render consumindo o hook), o hook precisa existir. Logo B dependsOn A.
- C reescreve as MESMAS linhas de B (ex.: troca o mapeamento das rows, ajusta o estado de loading). Como C opera sobre o que B produziu, C dependsOn B.

Resultado: uma cadeia linear `A → B → C`.

### 17.3 Por que essa cadeia FORÇA execução sequencial

Duas arestas, dois motivos distintos, ambos exigindo ordem:

1. **Dependência de existência (B → A):** sem o hook, o container e seu teste não compilam. Ordem necessária.
2. **Dependência de LINHA / conflito de escrita (C → B):** C edita exatamente as linhas que B escreveu. Se rodassem em paralelo, haveria conflito de merge e o segundo sobrescreveria o primeiro.

É por isso que o workflow roda "um item por vez, sem fan-out paralelo": o grafo tem arestas de conflito de escrita, que paralelismo não tolera. Esta é a decisão de Loop Engineering (Seção 11.3) sendo DITADA pela estrutura do grafo.

### 17.4 Toposort da cadeia

O toposort transforma o DAG em uma ordem linear onde todo nó vem depois de suas dependências. Para a cadeia A → B → C, a única ordem válida é:

```
[A, B, C]
```

Aplicando o algoritmo de Kahn (por grau de entrada):
1. Grau de entrada inicial: A=0, B=1, C=1. → só A tem grau 0. Emite A.
2. Remove A; atualiza: B passa a grau 0. Emite B.
3. Remove B; C passa a grau 0. Emite C.
4. Fila vazia, todos emitidos → sem ciclo.

Fonte: https://en.wikipedia.org/wiki/Topological_sorting

### 17.5 Um caso com paralelismo (para contrastar)

Se houvesse também um item D (criar um enum de status) independente do hook, o grafo seria:

```
A → B → C
D (independente, pode rodar em paralelo)
```

Aqui D não depende de nada e ninguém depende dele para começar, então PODERIA rodar em paralelo com a cadeia principal. O toposort admitiria várias ordens válidas (ex.: [D, A, B, C] ou [A, D, B, C]). Nesse cenário, um loop com fan-out ganharia tempo. A lição de Graph Engineering: o grafo revela onde há paralelismo seguro e onde NÃO há.

### 17.6 Detecção de ciclo (o que o "quebra ciclos com aviso" faz)

Suponha um erro de modelagem: alguém marca A dependsOn C. Agora temos A → B → C → A, um ciclo. Kahn nunca zera todos os graus de entrada (sobra um subconjunto preso em grau >=1), o que SINALIZA o ciclo. O workflow então quebra o ciclo (corta uma aresta) e emite um AVISO para revisão humana, em vez de esconder o problema. Ciclo quase sempre significa que dois nós deveriam ser um só, ou que uma aresta está invertida.

### 17.7 Cobertura: fechando o loop com o DoD

Depois de montar os nós e arestas, valida-se a COBERTURA: cada critério de aceitação (AC) e item de DoD do ticket tem de mapear para ≥1 nó. Uma matriz simples ajuda:

```
DoD / AC                          -> coberto por
AC-1 (hook busca dados)           -> A
AC-2 (lista reflete estado)       -> B, C
AC-3 (loading correto)            -> C
```

Se alguma linha ficar sem nó à direita, há um requisito órfão (anti-padrão O) e o contrato PARA para resolver antes de implementar.

### 17.8 Resumo do fluxo de modelagem

```
Specs + DoD do ticket
        ↓ [Fase Contract, modelo forte]
1. Fatiar em itens pequenos (1 commit cada)           → evita anti-padrão L: nó grande
        ↓
2. Extrair contratos de interface verbatim por item   → evita anti-padrão P: reshape de contrato
        ↓
3. Traçar arestas dependsOn (existência + conflito)   → evita anti-padrão M: dep. oculta
        ↓
4. Validar acíclico (toposort) · quebrar ciclos       → trata anti-padrão N: ciclo
        ↓
5. Validar cobertura DoD/AC ⇔ itens                  → evita anti-padrão O: requisito órfão
        ↓
DAG imutável → toposort → Fase Implement (ralph loop)
```

---

## Apêndice: Referências gerais complementares

**Gerais**
- Anthropic Engineering Blog: https://www.anthropic.com/engineering
- Martin Fowler (bliki): https://martinfowler.com/bliki/
- Prompting Guide: https://www.promptingguide.ai/
- OWASP GenAI Security Project: https://genai.owasp.org/
- Model Context Protocol: https://modelcontextprotocol.io/

**Loops e agentes**
- Anthropic — Building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- ReAct (raciocínio + ação): https://arxiv.org/abs/2210.03629
- Reflexion (auto-crítica): https://arxiv.org/abs/2303.11366
- Effective context engineering for agents: https://www.anthropic.com/engineering/effective-context-engineering-for-agents

**Ralph**
- Geoffrey Huntley — "Ralph Wiggum as a software engineer": https://ghuntley.com/ralph/

**Juiz / avaliação**
- Judging LLM-as-a-Judge (MT-Bench): https://arxiv.org/abs/2306.05685

**TDD e qualidade**
- Test-Driven Development (Fowler): https://martinfowler.com/bliki/TestDrivenDevelopment.html
- Continuous Integration (Fowler): https://martinfowler.com/articles/continuousIntegration.html

**Grafo**
- Directed Acyclic Graph: https://en.wikipedia.org/wiki/Directed_acyclic_graph
- Topological sorting (Kahn/DFS): https://en.wikipedia.org/wiki/Topological_sorting

**Contexto**
- Lost in the Middle: https://arxiv.org/abs/2307.03172
- Context Rot (Chroma): https://research.trychroma.com/context-rot

**Infra**
- git worktree: https://git-scm.com/docs/git-worktree