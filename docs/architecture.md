# BabyClothes — Diagramas de Arquitetura

> Total: **33 endpoints** em 7 controladores · **7 schemas Ecto** · **10 migrations** · **2 grafos LangGraph** · **13 rotas SvelteKit**

---

## 1. Diagrama de Casos de Uso

```mermaid
graph TB
  %% Atores
  U([Usuário])
  S([Vendedor PF/PJ])
  A([Agente IA])
  Admin([Admin])

  %% Casos de uso - Autenticação
  subgraph Auth["Autenticação"]
    LOGIN[Fazer login com Google]
    REGPF[Registrar como PF com CPF]
    REGPJ[Registrar como PJ com CNPJ]
    LOGOUT[Fazer logout]
  end

  %% Casos de uso - Catálogo
  subgraph Catalog["Catálogo"]
    BROWSE[Navegar por categorias]
    FILTER[Filtrar por tamanho/gênero/condição]
    SEARCH[Buscar itens]
    VIEW_ITEM[Ver detalhes do item]
  end

  %% Casos de uso - Anúncios
  subgraph Items["Anúncios"]
    CREATE_ITEM[Criar anúncio<br>2-step form]
    EDIT_ITEM[Editar anúncio]
    REMOVE_ITEM[Remover anúncio]
    ADD_PHOTO[Adicionar fotos<br>drag & drop]
  end

  %% Casos de uso - Crianças
  subgraph Child["Gestão Infantil"]
    REG_CHILD[Cadastrar criança]
    ADD_MEASUREMENT[Adicionar medida<br>peso/altura/size]
    VIEW_GROWTH[Ver curva de crescimento]
    LIST_CHILDREN[Listar crianças]
  end

  %% Casos de uso - Agente IA
  subgraph Agent["Assistente IA"]
    CHAT[Conversar com assistente<br>SSE streaming]
    RECOMMEND[Receber recomendações<br>de tamanho]
    PREDICT[Prever próximo tamanho<br>Growth Graph]
    GROWTH_ALERT[Receber alerta de crescimento]
  end

  %% Casos de uso - Notificações
  subgraph Notif["Notificações"]
    VIEW_NOTIF[Ver notificações]
    MARK_READ[Marcar como lida]
    MARK_ALL_READ[Marcar todas como lidas]
  end

  %% Relacionamentos
  U --> LOGIN
  U --> LOGOUT
  U --> BROWSE
  U --> FILTER
  U --> SEARCH
  U --> VIEW_ITEM
  U --> CHAT
  U --> RECOMMEND
  U --> VIEW_NOTIF
  U --> MARK_READ
  U --> MARK_ALL_READ
  U --> REG_CHILD
  U --> LIST_CHILDREN
  U --> ADD_MEASUREMENT
  U --> VIEW_GROWTH
  U --> REGPF

  S --> REGPJ
  S --> CREATE_ITEM
  S --> EDIT_ITEM
  S --> REMOVE_ITEM
  S --> ADD_PHOTO

  A -.-> PREDICT
  A -.-> RECOMMEND
  A -.-> GROWTH_ALERT
```

## 2. Diagrama de Atores e Papéis

```mermaid
graph LR
  subgraph Atores["Atores do Sistema"]
    direction TB
    U([Usuário não autenticado])
    PF([Usuário PF])
    PJ([Usuário PJ])
    A([Agente IA<br>LangGraph])
    Admin([Administrador])
  end

  subgraph Papeis["Papéis / Permissões"]
    direction TB
    BROWSE[Pode navegar e ver catálogo]
    SELL[Pode criar/editar anúncios]
    MANAGE_CHILD[Pode gerenciar crianças]
    CHAT_AI[Pode conversar com IA]
    MANAGE_FLAGS[Pode gerenciar feature flags]
  end

  U --> BROWSE
  PF --> SELL
  PF --> MANAGE_CHILD
  PF --> CHAT_AI
  PJ --> SELL
  PJ --> MANAGE_CHILD
  PJ --> CHAT_AI
  Admin --> MANAGE_FLAGS
```

## 3. Diagrama de Arquitetura do Sistema

```mermaid
graph TB
  %% Clientes
  Browser([Navegador])

  %% Frontend
  subgraph Web["apps/web — SvelteKit (Porta 5173)"]
    Svelte[Svelte 5 + SvelteKit 2]
    UI["@babyclothes/ui<br>12 componentes compartilhados"]
    Clean[Clean Architecture<br>Domain / Application / Infrastructure / Presentation]
    I18n[i18n en-US / pt-BR<br>13 rotas]
  end

  %% API
  subgraph API["apps/api — Elixir (Porta 4000)"]
    Plug[Plug + Bandit]
    Router[Router — 33 endpoints]
    Pipeline[Pipeline: CORS → Logger → JSON]
    AuthCtrl[AuthController<br>Google OAuth + JWT]
    CatalogCtrl[CatalogController]
    ItemsCtrl[ItemsController<br>CRUD + fotos S3]
    ChildrenCtrl[ChildrenController<br>CRUD + medidas]
    NotifCtrl[NotificationsController]
    AgentCtrl[AgentController<br>SSE Proxy HTTP p/ Agents]
    FeatureCtrl[FeatureFlagsController]
    Ecto[Ecto + Postgrex<br>7 schemas]
    Oban[Oban Background Jobs<br>default:10 + growth:5]
  end

  %% Agents
  subgraph Agents["apps/agents — TypeScript"]
    direction TB
    GRPC[gRPC Server<br>Porta 50051]
    HTTPSSE[HTTP SSE Server<br>Porta 50052]
    subgraph LangGraph["LangGraph"]
      ChatGraph[Chat Graph<br>4 nós]
      GrowthGraph[Growth Graph<br>4 nós]
    end
    Claude[Anthropic Claude API]
    Manifest[System Manifest<br>UI component descriptions]
  end

  %% Database
  DB[(PostgreSQL 16<br>Porta 5432)]

  %% Comunicação
  Browser <-->|REST JSON| Web
  Web -->|REST JSON| API
  API -->|Ecto SQL| DB
  API -->|HTTP Finch| Agents
  API -->|Oban| DB
  Agents -->|HTTP API| Claude

  style Browser fill:#f9f,stroke:#333
  style DB fill:#f96,stroke:#333
  style Claude fill:#6cf,stroke:#333
```

## 4. Diagrama de Sequência — Fluxos Principais

```mermaid
sequenceDiagram
  participant Browser as Navegador
  participant Web as SvelteKit Web
  participant API as Elixir API
  participant DB as PostgreSQL
  participant Agents as Agents Service
  participant Claude as Anthropic Claude

  Note over Browser,Claude: Fluxo de autenticação
  Browser->>Web: Login Google OAuth
  Web->>API: POST /auth/google
  API->>API: Verificar token RS256
  API->>DB: UPSERT users (google_id)
  API-->>Web: JWT HS256 + user data
  Web-->>Browser: Renderizar app autenticado

  Note over Browser,Claude: Fluxo de registro PF/PJ
  Browser->>Web: Selecionar PF ou PJ
  Web->>API: PATCH /auth/me {type, cpf/cnpj}
  API->>DB: Update users
  API-->>Web: User atualizado
  Web-->>Browser: Redirecionar para catálogo

  Note over Browser,Claude: Fluxo de catálogo com filtros
  Browser->>Web: Navegar catálogo + filtros
  Web->>API: GET /catalog?category=&size=&gender=&condition=
  API->>DB: Query items com joins
  DB-->>API: Resultados
  API-->>Web: JSON items + photos
  Web-->>Browser: Cards + filtros + badges

  Note over Browser,Claude: Fluxo de chat com IA (SSE)
  Browser->>Web: Mensagem do usuário
  Web->>API: POST /agent/chat (SSE)
  API->>Agents: POST /chat (HTTP Finch)
  Agents->>LangGraph: interpretIntent
  LangGraph->>Claude: Classificar intenção
  Claude-->>LangGraph: search_items | ask_recommendation | general_question
  alt search_items ou ask_recommendation
    LangGraph->>API: GET /items (HTTP interna)
    API->>DB: Query itens
    DB-->>API: Resultados
    API-->>LangGraph: JSON items
    LangGraph->>LangGraph: rankItems por relevância
  end
  LangGraph->>Claude: Gerar resposta com contexto
  Claude-->>LangGraph: Texto + recomendação
  LangGraph-->>API: SSE stream (HTTP)
  API-->>Web: SSE stream (text/event-stream)
  Web-->>Browser: Streaming UI em tempo real

  Note over Browser,Claude: Fluxo de predição de crescimento
  Agents->>LangGraph: analyzeCurve
  LangGraph->>Claude: Analisar medidas históricas
  Claude-->>LangGraph: Tendência
  LangGraph->>LangGraph: predictSize (12 tamanhos)
  LangGraph->>LangGraph: checkThreshold
  alt threshold atingido
    LangGraph->>API: POST /notifications (interna)
    API->>DB: INSERT notifications
  end

  Note over Browser,Claude: Fluxo de notificações
  Browser->>Web: Abrir notificações
  Web->>API: GET /users/:uid/notifications
  API->>DB: SELECT com rate limiting
  DB-->>API: Lista paginada
  API-->>Web: JSON notificações
  Browser->>Web: Marcar como lida
  Web->>API: PATCH /notifications/:id/read
  API->>DB: UPDATE read_at

  Note over Browser,Claude: Upload de fotos (criar anúncio)
  Browser->>Web: Drag & drop + submit form
  Web->>API: POST /items + POST /items/:id/photos
  API->>API: Upload para S3
  API->>DB: INSERT item + photos
  API-->>Web: Item criado
```

## 5. Diagrama de Grafos dos Agentes (LangGraph)

### Chat Graph

```mermaid
graph TD
  START((Start))
  INTERPRET[interpret_intent<br>Classificar intenção do usuário]
  FETCH[fetch_items<br>Buscar itens no catálogo via API]
  RANK[rank_items<br>Ordenar por relevância<br>para o contexto]
  FORMAT[format_response<br>Gerar resposta + manifest components]
  END((End))

  START --> INTERPRET
  INTERPRET -->|search_items / ask_recommendation| FETCH
  INTERPRET -->|general_question / greeting / unknown| FORMAT
  FETCH -->|itens encontrados| RANK
  FETCH -->|sem resultados| FORMAT
  RANK --> FORMAT
  FORMAT --> END

  subgraph SystemPrompt["System Prompt"]
    DESC[Manifest com descrição<br>dos componentes de UI:<br>Card, ItemList, FilterBar<br>GrowthChart, ChatBubble]
  end

  FORMAT --> SystemPrompt

  style INTERPRET fill:#e1f5fe
  style FETCH fill:#fff3e0
  style RANK fill:#fff3e0
  style FORMAT fill:#e8f5e9
```

### Growth Graph

```mermaid
graph TD
  START((Start))
  ANALYZE[analyze_curve<br>Analisar tendências de<br>peso/altura históricos]
  PREDICT[predict_size<br>Prever próximo tamanho<br>RN, RN+, P, P+, M, M+, G, G+, GG, 1, 2, 3, 4, 5, 6]
  CHECK[check_threshold<br>Verificar limiar de<br>mudança de tamanho]
  EMIT[emit_notification<br>Gerar notificação<br>push para o usuário]
  END((End))

  START --> ANALYZE
  ANALYZE --> PREDICT
  PREDICT --> CHECK
  CHECK -->|threshold atingido| EMIT
  CHECK -->|dentro do esperado| END
  EMIT --> END

  style ANALYZE fill:#e1f5fe
  style PREDICT fill:#fff3e0
  style CHECK fill:#f3e5f5
  style EMIT fill:#e8f5e9
```

## 6. Diagrama de Rotas da Aplicação (SvelteKit)

```mermaid
graph TB
  subgraph Routes["apps/web — Rotas SvelteKit"]
    HOME["/ — redirect para /catalog"]
    LOGIN["/login — AuthScreen + RegistrationForm"]
    CATALOG["/catalog — Catálogo com filtros"]
    CATALOG_ID["/catalog/[id] — Detalhe do item"]
    CHAT["/chat — Assistente IA com SSE"]
    CHILD["/child — Lista de crianças"]
    CHILD_REGISTER["/child/register — Cadastro"]
    CHILD_ID["/child/[id] — Gráfico de crescimento"]
    NOTIFICATIONS["/notifications — Central"]
    SELL["/sell — Formulário 2-step"]
    PROFILE["/profile — Perfil + idioma"]
    TERMS["/terms — Termos de uso"]
    PRIVACY["/privacy — Política de privacidade"]
  end

  LAYOUT["+layout.svelte<br>TopBar + BottomNav + Footer"]
  LAYOUT_SERVER["+layout.server.ts<br>Session + locale loader"]

  LAYOUT --> HOME
  LAYOUT --> LOGIN
  LAYOUT --> CATALOG
  LAYOUT --> CATALOG_ID
  LAYOUT --> CHAT
  LAYOUT --> CHILD
  LAYOUT --> CHILD_REGISTER
  LAYOUT --> CHILD_ID
  LAYOUT --> NOTIFICATIONS
  LAYOUT --> SELL
  LAYOUT --> PROFILE
  LAYOUT --> TERMS
  LAYOUT --> PRIVACY
  LAYOUT --> LAYOUT_SERVER
```

## 7. Diagrama de Roteamento da API (Elixir Plug)

```mermaid
graph TB
  subgraph APIRoutes["apps/api — 33 endpoints em 7 controladores"]
    HEALTH["GET /health"]

    subgraph Auth["AuthController (3)"]
      SESSION["GET /auth/session"]
      GOOGLE["POST /auth/google<br>Recebe credential JWT RS256<br>Retorna JWT HS256"]
      UPDATE_ME["PATCH /auth/me<br>type + cpf/cnpj"]
    end

    subgraph Items["ItemsController (7)"]
      LIST_ITEMS["GET /items<br>com filtros opcionais"]
      SHOW_ITEM["GET /items/:id<br>com fotos + seller"]
      CREATE_ITEM["POST /items<br>multipart"]
      UPDATE_ITEM["PATCH /items/:id"]
      DELETE_ITEM["DELETE /items/:id"]
      LIST_PHOTOS["GET /items/:id/photos"]
      ADD_PHOTO["POST /items/:id/photos<br>upload S3"]
    end

    subgraph Catalog["CatalogController (1)"]
      CATALOG_INDEX["GET /catalog<br>query params: category,<br>size, gender, condition"]
    end

    subgraph Children["ChildrenController (5)"]
      LIST_CHILDREN["GET /users/:uid/children"]
      SHOW_CHILD["GET /children/:id"]
      CREATE_CHILD["POST /children"]
      UPDATE_CHILD["PATCH /children/:id"]
      DELETE_CHILD["DELETE /children/:id"]
    end

    subgraph Measurements["ChildrenController — medidas (4)"]
      LIST_MEAS["GET /children/:cid/measurements"]
      ADD_MEAS["POST /children/:cid/measurements"]
      UPDATE_MEAS["PATCH /measurements/:id"]
      DELETE_MEAS["DELETE /measurements/:id"]
    end

    subgraph Agent["AgentController (1)"]
      CHAT_SSE["POST /agent/chat<br>SSE Proxy via HTTP Finch"]
    end

    subgraph Notifications["NotificationsController (6)"]
      LIST_NOTIF["GET /users/:uid/notifications"]
      UNREAD["GET /users/:uid/notifications/unread-count"]
      CREATE_NOTIF["POST /users/:uid/notifications"]
      MARK_READ["PATCH /notifications/:id/read"]
      MARK_ALL["PATCH /users/:uid/notifications/read-all"]
      DELETE_NOTIF["DELETE /notifications/:id"]
    end

    subgraph FeatureFlags["FeatureFlagsController (6)"]
      LIST_FLAGS["GET /feature-flags"]
      SHOW_FLAG["GET /feature-flags/:key"]
      CREATE_FLAG["POST /feature-flags"]
      UPDATE_FLAG["PATCH /feature-flags/:key"]
      TOGGLE_FLAG["POST /feature-flags/:key/toggle"]
      DELETE_FLAG["DELETE /feature-flags/:key"]
    end
  end

  subgraph Pipeline["Pipeline (única)"]
    CORS[CORS<br>CORSPlug]
    LOGGER[Logger]
    JSON[JSONPlug<br>JSON body parser]
  end

  %% Auth/InternalKey plugs exist but não estão no pipeline
  subgraph Unused["Definidos mas não wireados"]
    AUTH[AuthPlug<br>JWT validation]
    INT_KEY[InternalKeyPlug<br>x-internal-key]
  end

  HEALTH --> JSON
  CORS --> LOGGER
  LOGGER --> JSON

  style HEALTH fill:#e8f5e9
  style CHAT_SSE fill:#e1f5fe
  style Unused fill:#fff0f0
```

## 8. Diagrama Entidade-Relacionamento (Ecto Schemas)

```mermaid
erDiagram
  users {
    int id PK
    string email UK
    string name
    string avatar_url
    string google_id UK
    string type "pf | pj | null"
    string cpf UK "nullable"
    string cnpj UK "nullable"
    boolean is_seller
    timestamps inserted_at
    timestamps updated_at
  }

  children {
    int id PK
    string name
    date birth_date
    int birth_weight_g "nullable"
    int birth_height_cm "nullable"
    string document "nullable"
    int user_id FK
    timestamps inserted_at
    timestamps updated_at
  }

  child_measurements {
    int id PK
    datetime recorded_at
    int weight_g
    int height_cm
    string clothing_size "RN, P, M, G, etc"
    int child_id FK
    timestamps inserted_at
  }

  items {
    int id PK
    string title
    string description "nullable"
    string category "enum text"
    enum gender "male|female|unisex"
    string clothing_size
    enum condition "new|like_new|used"
    int price_cents
    enum status "active|sold|removed"
    int seller_id FK
    timestamps inserted_at
    timestamps updated_at
  }

  item_photos {
    int id PK
    string url "S3 URL"
    int position
    int item_id FK
    timestamps inserted_at
  }

  notifications {
    int id PK
    enum type "growth_prediction|new_message|item_sold|system"
    string title
    string body
    map metadata "JSONB"
    datetime read_at "nullable"
    int user_id FK
    timestamps inserted_at
    timestamps updated_at
  }

  feature_flags {
    int id PK
    string key UK
    boolean enabled
    string description "nullable"
    timestamps inserted_at
    timestamps updated_at
  }

  users ||--o{ children : "has many"
  users ||--o{ items : "sells"
  users ||--o{ notifications : "receives"
  children ||--o{ child_measurements : "has many"
  items ||--o{ item_photos : "has many"
```

## 9. Diagrama de Migrações (10 migrations)

```mermaid
graph LR
  M1["01_create_users"]
  M2["02_create_items"]
  M3["03_create_item_photos"]
  M4["04_create_children"]
  M5["05_create_child_measurements"]
  M6["06_create_notifications"]
  M7["07_create_feature_flags"]
  M8["08_add_type_to_users"]
  M9["09_add_cpf_cnpj_to_users"]
  M10["10_add_category_gender_to_items"]

  M1 --> M2
  M2 --> M3
  M3 --> M4
  M4 --> M5
  M5 --> M6
  M6 --> M7
  M7 --> M8
  M8 --> M9
  M9 --> M10

  style M1 fill:#e8f5e9
  style M8 fill:#fff3e0
  style M9 fill:#fff3e0
  style M10 fill:#e1f5fe
```

## 10. Clean Architecture — Frontend (apps/web)

```mermaid
graph LR
  subgraph Domain["Camada de Domínio<br>src/lib/domain/"]
    Entities[Entities<br>Item, Child, Message, User]
    VOs[Value Objects<br>ClothingSize, Condition, Category]
    Schemas[Zod Schemas<br>Validação de formulários]
    RepoInterfaces[Repository Interfaces<br>ICatalogRepository, IChatRepository]
  end

  subgraph Application["Camada de Aplicação<br>src/lib/application/"]
    UseCases[Use Cases<br>CreateItem, RegisterChild<br>SendChatMessage, AddMeasurement]
  end

  subgraph Infrastructure["Camada de Infraestrutura<br>src/lib/infrastructure/"]
    HTTP[HTTP Repositories<br>HttpCatalogRepository<br>HttpChildRepository]
    SSE[SSE Repositories<br>SseChatRepository]
  end

  subgraph Presentation["Camada de Apresentação<br>src/lib/presentation/"]
    Pages["13 Pages (SvelteKit)"]
    Components["12 Componentes<br>ItemCard, AuthScreen<br>ChatBubble, GrowthChart"]
    Shell["Shell<br>TopBar, BottomNav, PageHeader"]
  end

  Pages --> UseCases
  UseCases --> RepoInterfaces
  RepoInterfaces --> HTTP
  RepoInterfaces --> SSE
  HTTP -->|REST| API["Elixir API<br>Porta 4000"]
  SSE -->|SSE| Agents["Agents Service<br>Porta 50052"]
  UseCases --> Entities
  UseCases --> Schemas

  style Domain fill:#e8f5e9
  style Application fill:#e3f2fd
  style Infrastructure fill:#fff3e0
  style Presentation fill:#f3e5f5
```

## 11. Mapa de Tecnologias

```mermaid
graph TB
  subgraph Frontend["Frontend — Porta 5173"]
    SK[SvelteKit 2]
    S5[Svelte 5 Runes]
    TS[TypeScript 5 Strict]
    Vite[Vite 5<br>host: true]
    SK --> S5
    SK --> TS
    SK --> Vite
  end

  subgraph Shared["Pacote Compartilhado"]
    UI["@babyclothes/ui<br>12 componentes Svelte 5"]
    Tokens[Design Tokens CSS<br>--color-pk, --color-bk, --glass]
    Tests["Tests<br>7 componentes com testes<br>Vitest + testing-library"]
  end

  subgraph Backend["Backend — Porta 4000"]
    Elixir[Elixir ~> 1.17]
    Bandit[Bandit HTTP]
    Plug[Plug Middleware<br>CORS + Logger + JSON]
    Ecto[Ecto SQL<br>7 schemas, 10 migrations]
    PG[Postgrex]
    Oban[Oban Jobs<br>default:10, growth:5, Pruner]
    JWT[JOSE JWT<br>RS256 Google + HS256 interno]
    Finch[Finch HTTP Client<br>comunicação com Agents]
    Elixir --> Bandit
    Bandit --> Plug
    Elixir --> Ecto
    Ecto --> PG
    Elixir --> Oban
    Elixir --> Finch
  end

  subgraph AI["IA — TypeScript"]
    TS2[TypeScript 5]
    LG[LangGraph<br>Chat + Growth]
    ClaudeSDK[Anthropic SDK<br>claude-sonnet-4-20250514]
    gRPC[gRPC Server<br>Porta 50051]
    HTTPSSE[HTTP SSE<br>Porta 50052]
    TS2 --> LG
    TS2 --> ClaudeSDK
    gRPC --> LG
    HTTPSSE --> LG
  end

  subgraph DB["Banco de Dados"]
    PG16[PostgreSQL 16<br>Porta 5432]
  end

  subgraph Storage["Armazenamento"]
    S3[AWS S3<br>Fotos de itens]
  end

  subgraph Auth2["Autenticação"]
    Google[Google OAuth 2.0<br>GSI + RS256]
  end

  Ecto --> PG16
  Backend --> S3
  Backend --> Google
  Finch --> AI
  AI -->|HTTP API| ClaudeSDK
```

## 12. Diagrama de Containers (Docker)

```mermaid
graph TB
  subgraph Docker["docker compose"]
    PG[(postgres:16-alpine<br>Porta 5432)]
    API[api<br>Porta 4000<br>elixir:1.17-alpine]
    AGENTS[agents<br>Porta 50051 (gRPC)<br>Porta 50052 (SSE)<br>node:22-alpine]
    WEB[web<br>Porta 5173<br>node:22-alpine]
  end

  PG -->|volume| DATA[(postgres_data)]
  API -->|depends_on| PG
  AGENTS -->|depends_on| API
  WEB -->|depends_on| API

  subgraph Networks["babyclothes network"]
    PG
    API
    AGENTS
    WEB
  end

  style PG fill:#f96
  style API fill:#6cf
  style AGENTS fill:#9c6
  style WEB fill:#f9f
```

---

*Documento gerado em 2026-06-26.*
