# API Phase B Completion + Phase A Fixes

> **Goal:** Completar toda a Phase B do plano original da API (streaming, background jobs, internal routes) e corrigir implementações fracas da Phase A (catalog, storage).

**Status atual:** Phase A ~90% implementada. Phase B 0% implementada.
**Tech stack:** Elixir 1.17, Plug + Bandit, Ecto, PostgreSQL, Oban, JOSE, Finch, ExAWS/S3, phoenix_pubsub (nova dep).
**Comunicação com agents:** HTTP (porta 50052) — sem gRPC. O agents service não expõe gRPC server.

---

## Sumário de Work Items

| # | Grupo | Work Item | Tipo |
|---|-------|-----------|------|
| 1 | Phase A Fix | Catalog com filtros + paginação | Reescrita |
| 2 | Phase A Fix | Storage.ex (presigned S3 URLs) | Novo módulo |
| 3 | Phase B | Agent chat SSE real | Correção |
| 4 | Phase B | SSE notifications + PubSub | Novo endpoint + dep |
| 5 | Phase B | Internal routes (agents→API) | Novo controller |
| 6 | Phase B | Oban GrowthCheckWorker | Novo worker |
| 7 | Phase B | Smoke test | Novo test |

---

## WI-1: Catalog com Filtros + Paginação

**Arquivo:** `lib/api/controllers/catalog_controller.ex`
**Contexto:** `lib/api/items/items.ex`

### Problema

O `CatalogController` atual retorna seções fixas hardcoded (`trending`, `newborn`, `bodys`, `macacoes`, `under_50`). O plano original especifica filtros dinâmicos com paginação.

### Spec

**Endpoint:** `GET /catalog`

**Query params:**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `category` | string | nil | body, macacao, etc. |
| `gender` | string | nil | male, female, unisex |
| `size` | string | nil | RN, P, M, G, GG |
| `condition` | string | nil | new, like_new, used |
| `min_price` | integer | nil | Preço mínimo em centavos |
| `max_price` | integer | nil | Preço máximo em centavos |
| `page` | integer | 1 | Página atual |
| `per_page` | integer | 20 | Items por página (max 50) |

**Regras:**
- Só retorna items com `status: :active`
- Preload `:photos` e `:seller`
- Ordenação: `inserted_at DESC`
- `per_page` clampado em max 50

**Response 200:**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Body Rosa",
      "category": "body",
      "gender": "female",
      "clothing_size": "M",
      "condition": "like_new",
      "price_cents": 3500,
      "photo_url": "https://cdn.example.com/photo1.jpg",
      "seller": {
        "id": 1,
        "name": "Maria",
        "avatar_url": "https://example.com/avatar.png"
      },
      "inserted_at": "2026-07-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 143,
    "total_pages": 8
  }
}
```

### Mudanças

1. **`Api.Items`** — adicionar função `list_catalog/1` que recebe map de filtros + paginação:
   - Reutilizar `apply_filters/2` existente
   - Adicionar filtros `min_price` e `max_price` (cláusulas `>=` e `<=` em `price_cents`)
   - Retornar `{items, pagination_meta}`
   - Query de count separada para `total` (sem limit/offset)

2. **`CatalogController`** — reescrever `index/1`:
   - Parsear query params
   - Chamar `Api.Items.list_catalog/1`
   - Formatar response com `catalog_item_json/1` (inclui `photo_url` da primeira foto e `seller` nested)

3. **Remover** do controller: `fetch_trending/0`, `fetch_by_size/1`, `fetch_by_category/1`, `fetch_under_price/1`

### Testes

- Retorna items ativos, exclui sold/removed
- Filtra por cada param individualmente
- Combina múltiplos filtros
- Paginação: page 1 com 10 items de 25 retorna 10 + pagination meta correta
- `per_page` > 50 é clampado para 50
- Retorna `photo_url` da primeira foto
- Retorna seller nested

---

## WI-2: Storage.ex — Presigned S3 URLs

**Arquivo:** `lib/api/storage.ex`

### Problema

O módulo `Storage.ex` não existe. O `ItemsController.add_photo/2` recebe `url` direto no body sem flow de upload.

### Spec

**Módulo:** `Api.Storage`

**Função pública:**

```elixir
@spec generate_upload_url(integer()) :: {:ok, String.t(), String.t()} | {:error, term()}
def generate_upload_url(item_id)
```

**Comportamento:**
- Gera key no pattern: `items/{item_id}/{uuid}.jpg`
- Cria presigned PUT URL via `ExAws.S3.presigned_url/4` com expiração de 3600 segundos
- Retorna tupla `{:ok, upload_url, photo_url}`:
  - `upload_url` = presigned PUT URL (frontend faz PUT direto no S3)
  - `photo_url` = URL pública final (`https://{bucket}.s3.amazonaws.com/{key}`)
- Bucket via `Application.get_env(:api, :s3_bucket)`

**Config** (adicionar em `runtime.exs`):

```elixir
config :api, s3_bucket: System.get_env("S3_BUCKET", "babyclothes-uploads")
```

### Impacto no ItemsController

Alterar `add_photo/2`:
- Remover recebimento de `url` do body
- Chamar `Storage.generate_upload_url(item_id)`
- Criar registro `Photo` com `photo_url` antecipada
- Response 201:

```json
{
  "upload_url": "https://babyclothes-uploads.s3.amazonaws.com/items/1/uuid.jpg?X-Amz-...",
  "photo": {
    "id": 1,
    "url": "https://babyclothes-uploads.s3.amazonaws.com/items/1/uuid.jpg",
    "position": 0
  }
}
```

### Testes

- `generate_upload_url/1` retorna tupla com URLs válidas
- Key segue pattern `items/{id}/{uuid}.jpg`
- Controller retorna `upload_url` + `photo` no response

---

## WI-3: Agent Chat SSE Real

**Arquivo:** `lib/api/controllers/agent_controller.ex`

### Problema

O controller atual faz `Finch.request` síncrono e retorna tudo com `send_resp`. O cliente espera a resposta inteira antes de receber qualquer chunk. Não é streaming real.

### Spec

**Endpoint:** `POST /agent/chat` (autenticado)

**Request body:**

```json
{
  "message": "Quando meu bebê vai precisar de tamanho M?",
  "child_id": 1
}
```

**Validações:**
- `message` obrigatório, não vazio → 400 se ausente
- Autenticação Bearer → 401 se inválido
- Se `child_id` presente, valida ownership → 403 se não pertence ao user

**Fluxo de streaming:**

1. Abre SSE: `send_chunked(200)` + headers:
   - `content-type: text/event-stream`
   - `cache-control: no-cache`
   - `connection: keep-alive`
2. Faz `Finch.stream(:post, agents_endpoint, headers, body, Api.Finch, fun)`:
   - `fun` recebe `{:status, status}`, `{:headers, headers}`, `{:data, chunk}`
   - Para cada `{:data, chunk}`, faz `Plug.Conn.chunk(conn, chunk)`
   - Se `:closed`, encerra
3. Se agents indisponível: envia `data: {"error": "agents_unavailable"}\n\n` e fecha

**Agents endpoint:** `{agents_http_url}/chat` (config `agents_http_url` já existe em `runtime.exs`)

**Diferença do atual:**
- `Finch.stream/5` em vez de `Finch.request/2`
- `send_chunked/2` em vez de `send_resp/3`
- Proxy transparente dos chunks SSE do agents service

### Testes

- Requer `message` no body → 400
- Rejeita request sem auth → 401
- Retorna 502 se agents indisponível (mock Finch error)

---

## WI-4: SSE Notifications + Phoenix.PubSub

**Arquivos:**
- `mix.exs` (nova dep)
- `lib/api/application.ex` (supervisor)
- `lib/api/router.ex` (nova rota)

### Nova Dependência

```elixir
{:phoenix_pubsub, "~> 2.1"}
```

Funciona standalone sem Phoenix framework. Só precisa adicionar ao supervision tree.

### Supervisor

Adicionar em `Api.Application.children`:

```elixir
{Phoenix.PubSub, name: Api.PubSub}
```

Posicionar antes do Bandit no supervision tree.

### Endpoint

**Rota:** `GET /sse/notifications` (autenticado)

**Fluxo:**

1. Extrai `current_user_id` do Bearer token → 401 se inválido
2. Abre SSE:
   - `put_resp_content_type("text/event-stream")`
   - `put_resp_header("cache-control", "no-cache")`
   - `put_resp_header("connection", "keep-alive")`
   - `send_chunked(200)`
3. Subscribe: `Phoenix.PubSub.subscribe(Api.PubSub, "notifications:{user_id}")`
4. Envia heartbeat inicial: `": heartbeat\n\n"`
5. Loop `receive`:
   - `{:new_notification, notification}` → `chunk(conn, format_sse(notification_json))` 
   - `after 30_000` → `chunk(conn, ": heartbeat\n\n")` (keep-alive)
6. Se `{:error, :closed}` → sai do loop

**SSE event format:**

```
data: {"id":1,"type":"growth_prediction","title":"Sofia vai precisar de M!","body":"Em 30 dias...","metadata":{},"inserted_at":"2026-07-01T10:00:00Z"}

```

### Broadcast Pattern

Qualquer local que cria notification deve fazer broadcast:

```elixir
Phoenix.PubSub.broadcast(
  Api.PubSub,
  "notifications:#{notification.user_id}",
  {:new_notification, notification}
)
```

**Locais que fazem broadcast:**
- `Api.Controllers.NotificationsController.create/2`
- `Api.Controllers.InternalController` (POST /internal/notifications)
- `Api.Workers.GrowthCheckWorker`

**Helper compartilhado** — adicionar em `Api.Notifications`:

```elixir
def broadcast_notification(notification) do
  Phoenix.PubSub.broadcast(
    Api.PubSub,
    "notifications:#{notification.user_id}",
    {:new_notification, notification}
  )
end
```

### Testes

- Rejeita sem auth → 401
- Conexão abre com status 200 e content-type `text/event-stream`
- (Broadcast e receive testados via unit test do PubSub, não via HTTP)

---

## WI-5: Internal Routes

**Arquivo:** `lib/api/controllers/internal_controller.ex`
**Router:** `lib/api/router.ex`

### Spec

Todas as rotas protegidas pelo plug `Api.Plugs.InternalKey` (valida header `x-internal-key`). Retorna 403 se key inválida ou ausente.

#### POST /internal/notifications

Permite o agents service criar notifications diretamente.

**Request body:**

```json
{
  "user_id": 1,
  "type": "growth_prediction",
  "title": "Sofia vai precisar de M!",
  "body": "Em 30 dias, Sofia vai precisar de tamanho M (confiança: 85%)",
  "metadata": {
    "child_id": 1,
    "predicted_size": "M",
    "confidence": 85,
    "days_until_next_size": 30
  }
}
```

**Fluxo:**
1. Insere via `Api.Notifications.create_notification/1`
2. Broadcast via `Api.Notifications.broadcast_notification/1`
3. Response 201: `{"id": 1}`
4. Se changeset inválido: 422 com errors

#### GET /internal/children/:id/context

Retorna contexto completo de uma criança para o agents service.

**Response 200:**

```json
{
  "child": {
    "id": 1,
    "name": "Sofia",
    "birth_date": "2023-01-15",
    "birth_weight_g": 3200,
    "birth_height_cm": 50,
    "user_id": 1
  },
  "measurements": [
    {
      "recorded_at": "2024-01-15T10:00:00Z",
      "weight_g": 5000,
      "height_cm": 60,
      "clothing_size": "P"
    }
  ],
  "user": {
    "id": 1,
    "name": "Maria",
    "email": "maria@example.com"
  }
}
```

**Preloads:** `:measurements`, `:user`
**404** se child não encontrado.

#### GET /internal/items/search

Busca items para o agents recomendar ao usuário.

**Query params:**

| Param | Tipo | Default |
|-------|------|---------|
| `category` | string | nil |
| `size` | string | nil |
| `gender` | string | nil |
| `limit` | integer | 10 |

**Regras:**
- Só items `status: :active`
- Reutiliza filtros de `Api.Items`
- Preload `:photos`
- Ordenação: `inserted_at DESC`

**Response 200:**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Body Rosa",
      "category": "body",
      "clothing_size": "M",
      "condition": "like_new",
      "price_cents": 3500,
      "photo_url": "https://cdn.example.com/photo1.jpg"
    }
  ]
}
```

### Router

```
POST   /internal/notifications       → InternalController.create_notification/1
GET    /internal/children/:id/context → InternalController.child_context/2
GET    /internal/items/search        → InternalController.search_items/1
```

**Plug guard:** Como `Plug.Router` não tem `scope`/`pipe_through`, o `InternalController` deve chamar `Api.Plugs.InternalKey.call(conn, [])` no início de cada action. Se `conn.halted`, retorna `conn` direto. Alternativa: criar um `forward "/internal", to: Api.InternalRouter` com um router separado que tenha o plug no pipeline.

### Testes

- Cada endpoint com key válida → sucesso
- Cada endpoint sem key → 403
- POST /internal/notifications com body inválido → 422
- GET /internal/children/:id/context com id inexistente → 404

---

## WI-6: Oban GrowthCheckWorker

**Arquivo:** `lib/api/workers/growth_check_worker.ex`

### Spec

**Queue:** `:growth` (já configurada, concurrency 5)
**Max attempts:** 3

**Dois modos:**

#### Modo 1: Job individual (`args: %{"child_id" => id}`)

1. Busca child com preload `:measurements` e `:user`
2. Se child não encontrado → `{:error, :child_not_found}`
3. Faz `POST {agents_http_url}/predict-growth` via Finch com body:

```json
{
  "child_id": "1",
  "name": "Sofia",
  "birth_date": "2023-01-15",
  "measurements": [
    {"recorded_at": "2024-01-15T10:00:00Z", "weight_g": 5000, "height_cm": 60, "clothing_size": "P"}
  ]
}
```

4. Response esperada do agents:

```json
{
  "predicted_size": "M",
  "confidence": 85,
  "days_until_next_size": 30
}
```

5. Cria notification:
   - `type: :growth_prediction`
   - `title: "{child.name} vai precisar de {predicted_size}!"`
   - `body: "Em {days} dias, {child.name} vai precisar de tamanho {predicted_size} (confiança: {confidence}%)"`
   - `metadata: %{child_id, predicted_size, confidence, days_until_next_size}`
6. Broadcast via `Api.Notifications.broadcast_notification/1`
7. Retorna `:ok`

#### Modo 2: Cron diário (`args: %{"check_all" => true}`)

1. Lista todos os children que têm pelo menos 1 measurement:
   ```elixir
   Child
   |> join(:inner, [c], m in assoc(c, :measurements))
   |> distinct(true)
   |> Repo.all()
   ```
2. Para cada child, enfileira job individual:
   ```elixir
   %{"child_id" => child.id} |> new() |> Oban.insert()
   ```
3. Retorna `:ok`

### Scheduling Manual

**Função pública:**

```elixir
@spec schedule(integer()) :: {:ok, Oban.Job.t()} | {:error, term()}
def schedule(child_id)
```

**Chamada em:** `ChildrenController.add_measurement/2` — após inserir measurement com sucesso, dispara `GrowthCheckWorker.schedule(child.id)`.

### Config Oban Atualizada

```elixir
config :api, Oban,
  repo: Api.Repo,
  plugins: [
    Oban.Plugins.Pruner,
    {Oban.Plugins.Cron, crontab: [
      {"0 2 * * *", Api.Workers.GrowthCheckWorker, args: %{"check_all" => true}}
    ]}
  ],
  queues: [default: 10, growth: 5]
```

### Testes

- Job individual com child válida → cria notification (mock HTTP call ao agents)
- Job individual com child inexistente → `{:error, :child_not_found}`
- Job `check_all` enfileira jobs para children com measurements, ignora children sem
- `schedule/1` insere job na queue `:growth`

---

## WI-7: Smoke Test

**Arquivo:** `test/api/smoke_test.exs`

### Spec

**Tag:** `@moduletag :smoke` — rodar isolado com `mix test --only smoke`
**Async:** `false` (sequencial)

**Cenário — Full user journey:**

| Step | Endpoint | Expect |
|------|----------|--------|
| 1 | `GET /health` | 200 |
| 2 | Factory: cria user + gera token | — |
| 3 | `POST /children` (Sofia, 2023-01-15, 3200g, 50cm) | 201 |
| 4 | `POST /children/:id/measurements` (5000g, 60cm, "P") | 201 |
| 5 | `POST /items` (Body Rosa, body, female, M, like_new, R$35) | 201 |
| 6 | `GET /catalog` | 200, items >= 1 |
| 7 | `GET /catalog?category=body` | 200, filtro funciona |
| 8 | `GET /users/:user_id/notifications` | 200 |
| 9 | `GET /feature-flags` | 200 |
| 10 | `POST /internal/notifications` (com x-internal-key) | 201 |
| 11 | `PATCH /notifications/:id/read` | 200 |
| 12 | `DELETE /items/:id` | 204 |

**Não testa** (dependência de serviço externo):
- Agent chat (agents service)
- GrowthCheckWorker (agents service)
- SSE notifications (conexão long-lived)
- Storage/S3 (AWS)

---

## Dependências e Ordem de Implementação

```
WI-4 (PubSub setup) ──→ WI-4 cont. (SSE notifications endpoint, usa subscribe)
                    ├──→ WI-5 (Internal routes, usa broadcast)
                    └──→ WI-6 (Worker, usa broadcast)

WI-1 (Catalog filtros) ── independente
WI-2 (Storage.ex)      ── independente
WI-3 (Agent chat SSE)  ── independente (não usa PubSub)

WI-7 (Smoke test)      ── depende de WI-1 e WI-5
```

**Ordem sugerida:**

1. WI-4 (PubSub + SSE notifications) — desbloqueia WI-5, WI-6
2. WI-1 (Catalog) + WI-2 (Storage) + WI-3 (Agent chat SSE) — em paralelo
3. WI-5 (Internal routes) — em paralelo com acima
4. WI-6 (GrowthCheckWorker) — depende de WI-4 e WI-5
5. WI-7 (Smoke test) — por último

---

## File Map — Arquivos Novos e Modificados

```
apps/api/
├── mix.exs                                          # MOD: add phoenix_pubsub dep
├── config/
│   ├── config.exs                                   # MOD: Oban cron plugin
│   └── runtime.exs                                  # MOD: add s3_bucket config
├── lib/
│   └── api/
│       ├── application.ex                           # MOD: add PubSub to supervisor
│       ├── router.ex                                # MOD: add /internal/*, /sse/notifications, SSE handler
│       ├── storage.ex                               # NEW: S3 presigned URL generation
│       ├── items/
│       │   └── items.ex                             # MOD: add list_catalog/1, min/max price filters
│       ├── notifications/
│       │   └── notifications.ex                     # MOD: add broadcast_notification/1
│       ├── controllers/
│       │   ├── catalog_controller.ex                # MOD: rewrite with filters + pagination
│       │   ├── agent_controller.ex                  # MOD: Finch.stream for real SSE
│       │   ├── items_controller.ex                  # MOD: add_photo uses Storage.ex
│       │   ├── children_controller.ex               # MOD: schedule GrowthCheckWorker on new measurement
│       │   ├── notifications_controller.ex          # MOD: broadcast on create
│       │   └── internal_controller.ex               # NEW: internal routes controller
│       └── workers/
│           └── growth_check_worker.ex               # NEW: Oban worker
└── test/
    └── api/
        ├── catalog_test.exs                         # MOD: rewrite for filters + pagination
        ├── storage_test.exs                         # NEW
        ├── agent_chat_test.exs                      # NEW
        ├── sse_notifications_test.exs               # NEW
        ├── internal_routes_test.exs                 # NEW
        ├── workers/
        │   └── growth_check_worker_test.exs         # NEW
        └── smoke_test.exs                           # NEW
```
