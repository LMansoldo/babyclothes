# BabyClothes — Auditoria de Segurança e Guia de Endurecimento (Hardening)

> **Público-alvo:** este documento é escrito para ser executado por modelos mais simples, um item por vez.
> Cada achado tem: local exato (`arquivo:linha`), severidade, por que é explorável, cenário de ataque e a correção em código.
> **Regra de ouro:** o **backend (apps/api) é a única fronteira de confiança**. Código no navegador (apps/web) e o serviço de agents NUNCA devem ser tratados como confiáveis. Toda autorização e validação tem de existir no `apps/api`, mesmo que o front também valide por UX.

Data: 2026-07-10 · Escopo: `apps/api` (Elixir), `apps/web` (SvelteKit), `apps/agents` (LangGraph/TS).

---

## 0. Modelo de ameaça (resumo)

| Ator | Pode controlar | Não controla |
|---|---|---|
| Usuário autenticado malicioso | Corpo/params/headers de qualquer request, seu próprio JWT | JWTs de outros usuários (se o segredo for forte) |
| Usuário anônimo | Qualquer request sem token | — |
| Prompt injection via chat | O texto da mensagem que chega ao LLM, e indiretamente a saída do LLM (texto e "componentes") | O código de render do front |
| Rede interna (se agents/API expostos) | Requests diretos a `:4000` e `:50052` | — |

Dados sensíveis em jogo: **CPF/CNPJ do usuário**, **nome + documento + data de nascimento de crianças (menores)**, tokens de sessão. Vazamento de PII de menores é o pior cenário.

---

## 1. Achados — ranqueados por severidade

| # | Severidade | Categoria | Local | Resumo |
|---|---|---|---|---|
| 1 | **CRÍTICA** | Segredo fraco previsível em prod | `apps/api/config/runtime.exs:17-22` | JWT/segredos têm default de dev usado também em `:prod`; sem env var → forja de token de qualquer usuário |
| 2 | **ALTA** | Broken access control / IDOR (PII de menor) | `apps/api/lib/api/controllers/children_controller.ex:39-51, 144-150` | `GET /children/:id` e `GET /children/:child_id/measurements` sem auth nem ownership → qualquer um lê nome, documento, nascimento e medidas de qualquer criança |
| 3 | **ALTA** | Auth bypass no endpoint do agente | `apps/api/lib/api/controllers/agent_controller.ex:13-33, 60-68` | `/agent/chat` só checa que o Bearer é não-vazio; nunca valida o JWT nem a posse de `user_id`/`child_id` |
| 4 | **ALTA** | Serviço interno sem auth + CORS `*` | `apps/agents/src/http-server.ts:54-59, 104-134` | Agents HTTP (`:50052`) não autentica nada e confia em `user_id`/`child_id`/`context` do corpo; `Access-Control-Allow-Origin: *` |
| 5 | **ALTA** | Auth bypass global via flag | `apps/web/src/hooks.server.ts:48-52` | `PUBLIC_MOCK_DATA==='true'` injeta sessão fake e pula toda a auth; se ligado em prod, acesso total |
| 6 | **MÉDIA→ALTA** | Falta de guardrails no render do agente | `apps/agents/src/nodes/format-response.ts:31-48` + `apps/web/src/routes/chat/+page.svelte:180-260` | Componentes vindos do LLM não têm allowlist de tipo nem schema de props; props (labels, ações, urls) chegam ao render sem validação |
| 7 | **MÉDIA** | Mass assignment potencial | `items_controller.ex:52-58`, `children_controller.ex:60-74`, `notifications_controller.ex:60-84` | `conn.body_params` inteiro vai para o changeset; se o changeset `cast`ar campos privilegiados (`status`, `is_seller`, `user_id`), o cliente sobrescreve |
| 8 | **MÉDIA** | Respostas autenticadas sem `no-store` | toda resposta JSON do `apps/api` | Sem `Cache-Control` em respostas com PII → risco de cache compartilhado/CDN servir dado de um usuário para outro |

> Os itens 2, 3, 7, 8 são **código pré-existente** (fora do diff atual), mas entram no escopo porque você pediu a análise do projeto. O item 1 e 5 também são pré-existentes. O item 6 é o ponto que você destacou (agente = maior superfície futura).

---

## 2. Detalhamento e correções

### Vuln 1 — Segredos com default de desenvolvimento usados em produção (CRÍTICA)

- **Local:** `apps/api/config/runtime.exs:17-22`
- **Categoria:** `crypto/secrets` · **Confiança:** alta

```elixir
config :api,
  jwt_secret: System.get_env("JWT_SECRET", "dev-secret-change-in-prod"),
  internal_jwt_secret: System.get_env("INTERNAL_JWT_SECRET", "dev-secret-change-in-production"),
  ...
  internal_api_key: System.get_env("INTERNAL_API_KEY", "dev-internal-key"),
```

- **Por quê:** o bloco roda para todo `config_env() != :test`, ou seja **também em `:prod`**. Se qualquer variável não estiver setada no deploy, o segredo de assinatura HS256 do JWT passa a ser uma string pública deste repositório.
- **Exploit:** atacante assina um JWT `{"sub":"1","typ":"access","exp":<futuro>}` com `"dev-secret-change-in-production"` e se autentica como qualquer usuário (`Api.Auth.verify_token/2` valida contra esse mesmo segredo). Auth bypass total, incluindo virar qualquer `sub`.
- **Correção:** falhar rápido em produção se o segredo for ausente ou for o default. Nunca embutir default forte.

```elixir
# runtime.exs
defp fetch_secret!(name) do
  case System.get_env(name) do
    nil -> raise "#{name} is required in production"
    "" -> raise "#{name} is required in production"
    "dev-" <> _ -> raise "#{name} still uses a dev default — refusing to boot"
    value when byte_size(value) < 32 -> raise "#{name} must be >= 32 bytes"
    value -> value
  end
end

if config_env() == :prod do
  config :api,
    jwt_secret: fetch_secret!("JWT_SECRET"),
    internal_jwt_secret: fetch_secret!("INTERNAL_JWT_SECRET"),
    internal_api_key: fetch_secret!("INTERNAL_API_KEY"),
    google_client_id: System.fetch_env!("GOOGLE_CLIENT_ID"),
    # ... demais
else
  # defaults de dev só fora de prod
end
```

- **Guardrail (impede regressão):** teste/CI que boota em `MIX_ENV=prod` sem os envs e espera falha; e um smoke test que rejeita `alg: none` e segredo default.

---

### Vuln 2 — IDOR expondo PII de crianças (ALTA)

- **Local:** `apps/api/lib/api/controllers/children_controller.ex:39-51` (`show`) e `:144-150` (`list_measurements`)
- **Categoria:** `broken_access_control` · **Confiança:** alta

```elixir
def show(conn, id) do
  case Children.get_child(id) do        # <-- sem Auth.call, sem Guard.require_owner
    {:ok, child} -> ... child_json(child) ...
```

`child_json/1` serializa `name`, `document`, `birth_date`, `birth_weight_g`, `birth_height_cm` (`children_controller.ex:280-297`). `list_measurements` também não tem `Auth.call`.

- **Exploit:** `GET /children/1`, `GET /children/2`, … itera IDs sequenciais e coleta nome + documento + nascimento de todas as crianças cadastradas. Ids são inteiros incrementais → enumeração trivial.
- **Correção:** exigir auth e posse, no mesmo padrão de `update`/`delete` deste controller.

```elixir
def show(conn, id) do
  conn = Auth.call(conn, [])
  if conn.halted do
    conn
  else
    case Children.get_child(id) do
      {:ok, child} ->
        conn = Guard.require_owner(conn, child.user_id)
        if conn.halted, do: conn, else: send_child(conn, child)
      {:error, :not_found} -> send_not_found(conn)
    end
  end
end

def list_measurements(conn, child_id) do
  conn = Auth.call(conn, [])
  if conn.halted do
    conn
  else
    case Children.get_child(child_id) do
      {:ok, child} ->
        conn = Guard.require_owner(conn, child.user_id)
        if conn.halted, do: conn, else: send_measurements(conn, Children.list_measurements(child_id))
      {:error, :not_found} -> send_not_found(conn)
    end
  end
end
```

- **Nota de contraste:** `items` são um marketplace público (ok expor `GET /items/:id`), **mas children não são**. Faça essa distinção explícita ao classificar rotas (ver §4).
- **Guardrail:** teste de controller que faz `GET /children/:id` (a) sem token → 401, (b) com token de outro usuário → 403.

---

### Vuln 3 — `/agent/chat` não valida o JWT (ALTA)

- **Local:** `apps/api/lib/api/controllers/agent_controller.ex:13-33` e `extract_bearer_token/1:60-68`
- **Categoria:** `auth_bypass` · **Confiança:** alta

```elixir
defp extract_bearer_token(conn) do
  case get_req_header(conn, "authorization") do
    ["Bearer " <> token] when token != "" -> {:ok, token}   # <-- só "não-vazio"
    _ -> {:error, :missing_authorization}
  end
end
```

O token é **repassado** ao serviço de agents sem nunca passar por `Api.Auth.verify_token/2`. E `user_id`/`child_id`/`context` vêm do corpo (`agents_payload` faz `Map.take(["message","child_id","context"])`, mas o serviço agents também recebe `user_id` na versão HTTP — ver Vuln 4).

- **Exploit:** `POST /agent/chat` com `Authorization: Bearer x` e `{"message":"...","child_id":"<qualquer>","context":{...}}` aciona o LLM sem sessão válida (custo/abuso) e injeta contexto arbitrário de criança no agente.
- **Correção:** autenticar como nos demais controllers e derivar identidade do token, não do corpo.

```elixir
def chat(conn) do
  conn = Api.Plugs.Auth.call(conn, [])
  if conn.halted do
    conn
  else
    user_id = conn.assigns.current_user_id
    with {:ok, _message} <- extract_message(conn) do
      # inclua user_id derivado do token no payload; ignore user_id do corpo
      stream_to_agents(conn, user_id)
    else
      {:error, reason} -> send_error(conn, reason)
    end
  end
end
```

Além disso, ao chamar o agents, **assine com o INTERNAL_API_KEY** (ver Vuln 4), não com o access token do usuário.

- **Guardrail:** teste que `POST /agent/chat` com Bearer inválido → 401.

---

### Vuln 4 — Serviço de agents sem autenticação e CORS aberto (ALTA)

- **Local:** `apps/agents/src/http-server.ts:54-59` (SSE headers com `Access-Control-Allow-Origin: *`), `:104-134` (server sem checagem de auth)
- **Categoria:** `broken_access_control` · **Confiança:** alta

`handleChat` confia integralmente em `body.user_id`, `body.child_id` e `body.context` (incl. `context.history` com medidas). Não há verificação de chave interna nem de origem de rede.

- **Exploit:** se `:50052` estiver acessível (mesma rede Docker, container comprometido, port-forward acidental), qualquer um dirige o LLM com histórico/contexto forjado e consome cota da Anthropic. `ACAO: *` permite que qualquer site no navegador de um usuário faça requests.
- **Correção (defesa em profundidade):**
  1. **Chave interna obrigatória** — o API assina com `x-internal-key` (padrão já existente em `Api.Plugs.InternalKey`), o agents valida:

```ts
function requireInternalKey(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected || req.headers['x-internal-key'] !== expected) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'forbidden' }));
    return false;
  }
  return true;
}
```
  2. **Sem CORS aberto** — o agents é serviço interno; remova `Access-Control-Allow-Origin: *`. O navegador nunca fala direto com o agents (fala com `apps/web` → `apps/api`).
  3. **Bind em interface interna** — `server.listen(port, '127.0.0.1'|rede docker)`, nunca `0.0.0.0` público.
  4. **Nunca confie em `user_id` do corpo** — o API passa a identidade autenticada; o agents usa só o que a API mandar.
- **Guardrail:** compose/infra que não publica `50052` externamente; teste que request sem `x-internal-key` → 403.

---

### Vuln 5 — Bypass global de auth por flag de mock (ALTA em prod)

- **Local:** `apps/web/src/hooks.server.ts:48-52`
- **Categoria:** `auth_bypass` · **Confiança:** alta (condicional a config)

```ts
if (import.meta.env.PUBLIC_MOCK_DATA === 'true') {
  event.locals.session = mockSession;   // sessão fabricada, sem token
  return resolve(event);
}
```

- **Exploit:** se `PUBLIC_MOCK_DATA=true` vazar para o build/deploy de produção, **todo** visitante recebe `mockSession` (`isSeller: true`) e o guard de rota nunca redireciona para login. Como é `PUBLIC_*`, ainda é embutido no bundle.
- **Correção:** travar mock só para dev, e falhar o build se ligado em prod.

```ts
import { dev } from '$app/environment';
const mockEnabled = dev && import.meta.env.PUBLIC_MOCK_DATA === 'true';
if (mockEnabled) { event.locals.session = mockSession; return resolve(event); }
```
E no `vite.config`/CI: `if (!dev && process.env.PUBLIC_MOCK_DATA === 'true') throw new Error('mock em prod')`.
- **Reforço:** lembre-se que isso é só UX/defesa dupla — mesmo com o mock, o `apps/api` continua exigindo token real. O perigo é o front *parecer* autenticado e chamar rotas que o backend rejeita, mas nada de PII real vaza sem token válido. Ainda assim, ligue o fail-fast.

---

### Vuln 6 — Guardrails do agente: render de componentes sem allowlist/schema (o ponto central)

Você destacou que o agente será o maior ponto de interação e de renderização de componentes. Hoje o caminho é:

```
usuário → mensagem → LLM (interpret-intent) → LLM (format-response) → texto + "componentes" (JSON)
      → API (SSE proxy) → SseChatRepository → chat/+page.svelte renderiza
```

Problemas concretos:

1. **Sem allowlist de tipo de componente.** `format-response.ts:31-48` (`extractComponents`) aceita qualquer bloco ```json com `type` e `data`. Não há lista fechada de componentes permitidos.
2. **Sem schema de props.** As props do componente (labels, `primaryAction`/`secondaryAction`, urls, ids de item) fluem do LLM até o render sem validação. O front (`chat/+page.svelte:237-256`) repassa `component.primaryAction`, `component.description`, `component.sizes` direto ao `GrowthChart`.
3. **Prompt injection molda a saída.** O texto do usuário entra em `RESPONSE_PROMPT` (`format-response.ts:66-72`) sem delimitação forte; o usuário pode induzir o LLM a emitir componentes/labels/ações arbitrárias.
4. **Ids de item não verificados.** O agente pode referenciar `item.id` que não pertence ao catálogo real; o front usa para navegar (`goto(/catalog/${item.id})`).

Por que ainda **não** é XSS clássico: o Svelte escapa interpolação `{...}` por padrão, então texto malicioso vira texto inerte. **Mas** o risco real é: (a) **phishing/UI enganosa** dirigida por prompt injection (botão "Confirme seu pagamento" com URL controlada); (b) **`javascript:`/URLs externas** em props de ação se algum componente renderizar `href`/`onclick` a partir de props; (c) navegação para ids inexistentes; (d) abuso de custo do LLM.

**Guardrails a implementar (fronteira = a API, não o front):**

**G1. Allowlist + validação de schema no lado do agente (zod), antes de emitir.**

```ts
// apps/agents/src/manifest.ts (ou um novo guardrails.ts)
import { z } from 'zod';

const safeText = z.string().max(280);           // sem HTML; texto puro
const httpsUrl = z.string().url().refine(u => u.startsWith('https://'), 'https only');

const action = z.object({ label: safeText, href: httpsUrl }).strict();

export const COMPONENT_SCHEMAS = {
  Carousel: z.object({
    label: safeText.optional(),
    items: z.array(z.object({ id: z.string().uuid().or(z.string().regex(/^\d+$/)) })).max(12),
  }).strict(),
  ItemList: z.object({
    label: safeText.optional(),
    items: z.array(z.object({ id: z.string() })).max(20),
  }).strict(),
  GrowthAlert: z.object({
    currentSize: safeText, nextSize: safeText,
    daysUntil: z.number().int().nonnegative(),
    progress: z.number().min(0).max(100),
    description: safeText.optional(),
    primaryAction: action.optional(),
    secondaryAction: action.optional(),
  }).strict(),
} as const;

export type AllowedComponent = keyof typeof COMPONENT_SCHEMAS;

export function validateComponent(type: string, props: unknown):
  | { ok: true; type: AllowedComponent; props: unknown }
  | { ok: false } {
  if (!(type in COMPONENT_SCHEMAS)) return { ok: false };          // allowlist
  const schema = COMPONENT_SCHEMAS[type as AllowedComponent];
  const parsed = schema.safeParse(props);
  return parsed.success ? { ok: true, type: type as AllowedComponent, props: parsed.data } : { ok: false };
}
```

Em `extractComponents`, descarte tudo que não passar em `validateComponent`. Componentes inválidos **nunca** chegam ao stream.

**G2. Re-hidrate itens a partir do banco, não do LLM.** Ao emitir `Carousel`/`ItemList`, o agente deve mandar só `id`s; a API/agents resolve os dados reais do catálogo (título, preço, foto) do banco. Assim o LLM não consegue inventar preços/títulos nem referenciar itens de outro vendedor. Verifique também que o `id` existe e está `status: active`.

**G3. Segunda camada de allowlist no front (defense in depth).** Mesmo com G1, o `chat/+page.svelte` deve renderizar só uma lista fechada de `component.type` (já faz if/else — bom) e **nunca** renderizar `href` de ação sem checar `startsWith('https://')`. Nunca use `{@html ...}` com conteúdo do agente. Para ações:

```svelte
{#if isSafeHref(component.primaryAction?.href)}
  <a href={component.primaryAction.href} rel="noopener noreferrer">{component.primaryAction.label}</a>
{/if}
```
```ts
const isSafeHref = (h?: string) => !!h && /^https:\/\//.test(h);  // bloqueia javascript:, data:
```

**G4. Delimitar entrada do usuário no prompt** e instruir o LLM a tratar o texto como não confiável. Não elimina injection, mas reduz. O que **de fato** protege é G1/G2/G3 (validação determinística fora do LLM).

**G5. Limites de saída.** `maxTokens` já existe; adicione teto de nº de componentes por resposta (ex.: ≤ 3) e de tamanho de labels (schema `max`).

**G6. Autenticação do canal** (Vuln 3 e 4) — sem isso, os guardrails de conteúdo são inúteis porque qualquer um chama o agente.

- **Guardrail de regressão:** testes de unidade do agente com saídas maliciosas do LLM simuladas: `{"type":"Script",...}` → descartado; `primaryAction.href:"javascript:alert(1)"` → rejeitado pelo schema; `items` com 999 itens → truncado.

---

### Vuln 7 — Mass assignment via `conn.body_params` (MÉDIA)

- **Local:** `items_controller.ex:52-58`, `children_controller.ex:60-74`, `notifications_controller.ex:60-84`
- **Categoria:** `mass_assignment` · **Confiança:** média (depende do `cast` de cada changeset)

Padrão repetido: `Map.put(conn.body_params, "campo_dono", id_do_token)` e passa o mapa inteiro ao changeset. É **seguro apenas se** o changeset `cast/3` listar somente campos não privilegiados.

- **Ação (verificar, não presumir):** abra cada schema e confira a lista de `cast`:
  - `Api.Items.Item` — o `cast` inclui `status`? `seller_id`? Se `seller_id` estiver em `cast` e o controller também fizer `Map.put(..., "seller_id", claims["sub"])`, o `Map.put` vence (bom). Mas se `status` estiver em `cast`, o cliente pode criar item já `sold`/`active` fora de fluxo.
  - `Api.Children.Child` — `user_id` no `cast`? O controller injeta `user_id` do token via `Map.put` (bom), mas confirme que um `user_id` no corpo não sobrescreve **depois** do put (a ordem do `Map.put` garante que o valor do token prevalece — ok).
  - `Api.Notifications.Notification` — idem para `user_id`/`read_at`.
- **Correção geral:** cada changeset deve ter uma allowlist mínima de campos "de cliente"; campos de sistema (`status` inicial, `is_seller`, `user_id`, `seller_id`, `read_at`) só via lógica de contexto, nunca via `cast` do corpo.
- **Guardrail:** teste que envia `{"status":"sold"}`/`{"is_seller":true}`/`{"user_id":<outro>}` no create e verifica que foi ignorado.

---

### Vuln 8 — Respostas autenticadas sem `Cache-Control: no-store` (MÉDIA)

- **Local:** todas as respostas JSON de `apps/api` (nenhuma seta `cache-control`, exceto SSE que seta `no-cache` corretamente).
- **Categoria:** `data_exposure` · **Confiança:** média

- **Por quê:** respostas com PII (usuário, children, notifications) sem `Cache-Control` podem ser cacheadas por proxies/CDN compartilhados e servidas a outro usuário. Ver §5 para a estratégia completa de cache.
- **Correção:** um plug que seta `cache-control: private, no-store` por padrão em respostas autenticadas, e cache explícito só onde for público (catálogo).

---

## 3. Fronteira de autorização — mapa de rotas da API

Classifique cada rota como **pública**, **autenticada** ou **autenticada+dona**. Estado atual e alvo:

| Rota | Hoje | Alvo | Ação |
|---|---|---|---|
| `GET /catalog`, `GET /items`, `GET /items/:id`, `GET /items/:id/photos` | público | **público** (marketplace) | ok — cacheável |
| `POST/PATCH/DELETE /items*` | auth+dono | auth+dono | ok |
| `GET /children/:id` | **público** ❌ | **auth+dono** | **Vuln 2** |
| `GET /children/:child_id/measurements` | **público** ❌ | **auth+dono** | **Vuln 2** |
| `POST/PATCH/DELETE /children*`, `/measurements*` | auth+dono | auth+dono | ok |
| `GET/POST/PATCH/DELETE /users/:id/notifications*` | auth+dono | auth+dono | ok |
| `POST /agent/chat` | **Bearer não-vazio** ❌ | **auth** | **Vuln 3** |
| `GET /sse/notifications` | auth (verify) | auth | ok |
| `/auth/*` | conforme fluxo | ok | `dev-login` gated por flag ✅ |
| `/feature-flags*` | **sem auth** ⚠️ | auth+admin (revisar) | fora do diff; verificar se deveria ser interno |

> **Nota:** `feature_flags_controller` expõe `POST/PATCH/DELETE /feature-flags` — confirme se essas mutações deveriam exigir auth/admin. Não confirmei exploit; sinalizado para revisão.

---

## 4. Auth guards nas rotas (front + server) — alvo

O front **não é fronteira de segurança**, mas precisa de guards por UX e defesa em profundidade. O padrão correto no SvelteKit:

### 4.1 Server (fonte da verdade no front-server)

`hooks.server.ts` já centraliza (bom):
- valida cookie contra `GET /auth/session` da API;
- redireciona anônimo → `/login`;
- (novo) redireciona sessão sem `type` → `/register`.

Ajustes:
1. **Fail-fast do mock** (Vuln 5).
2. **`/register` fora de `publicRoutes`** (já está) — sem sessão cai em `/login` antes do guard de registro. ✅
3. **Cada `+page.server.ts` de rota protegida** deve reconfirmar `locals.session` no `load` (defesa em profundidade caso o hook mude), como `/register` já faz:

```ts
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) throw redirect(303, '/login');
  if (!locals.session.type) throw redirect(303, '/register');
  return { /* dados */ };
};
```

4. **Nunca** buscar dados de outro usuário no `load` sem passar pelo token; use sempre o proxy `/api` que anexa o cookie e deixa a API autorizar.

### 4.2 Client

- Guards de cliente (`onMount` que checa `session`) são só UX; mantenha, mas nunca dependa deles para proteger dados.
- Evite renderizar PII no cliente antes do `load` server validar a sessão.

---

## 5. Estratégia de cache (front + server) — com foco em segurança

Cache é onde vazamento cross-user acontece silenciosamente. Regras por classe de dado:

| Classe | Exemplo | `Cache-Control` | Onde |
|---|---|---|---|
| Público imutável | assets, build | `public, max-age=31536000, immutable` | CDN |
| Público volátil | `GET /catalog`, `GET /items` | `public, max-age=60, stale-while-revalidate=300` | CDN + browser |
| Autenticado | usuário, children, notifications | **`private, no-store`** | nunca em cache compartilhado |
| Streaming | SSE `/agent/chat`, `/sse/notifications` | `no-cache` (já setado) | — |

### 5.1 Server (apps/api) — plug de cache seguro por padrão

```elixir
defmodule Api.Plugs.CacheControl do
  @moduledoc "Default-deny cache: autenticado = no-store; público explícito é opt-in."
  import Plug.Conn
  def init(opts), do: opts
  def call(conn, _opts) do
    register_before_send(conn, fn conn ->
      case get_resp_header(conn, "cache-control") do
        [] -> put_resp_header(conn, "cache-control", "private, no-store")  # default seguro
        _ -> conn
      end
    end)
  end
end
```

No `CatalogController.index`, opt-in explícito para público:

```elixir
conn
|> put_resp_header("cache-control", "public, max-age=60, stale-while-revalidate=300")
|> send_resp(200, ...)
```

### 5.2 Front (SvelteKit)

- **`+layout.server.ts`** retorna a sessão a cada navegação. Marque como não cacheável e não vaze o token (só o objeto de sessão, sem tokens — já é o caso). Não use `cache: 'force-cache'` em fetches autenticados.
- **Catálogo público:** pode usar `setHeaders({ 'cache-control': 'public, max-age=60' })` no `load` do catálogo.
- **Dados autenticados no `load`:** use `setHeaders({ 'cache-control': 'private, no-store' })`.
- **Cache de dados no cliente:** para reduzir chamadas, prefira `depends()`/`invalidate()` do SvelteKit em vez de guardar PII em `localStorage`. Nunca coloque documento/CPF em `localStorage`/`sessionStorage`.

### 5.3 Cache do proxy `/api/[...path]`

`apps/web/src/routes/api/[...path]/+server.ts` hoje repassa o corpo e o content-type, mas **não** repassa `cache-control` da API. Repasse-o (ou force `private, no-store` para respostas autenticadas) para não deixar o browser cachear resposta autenticada.

```ts
const cacheControl = res.headers.get('cache-control') ?? 'private, no-store';
return new Response(res.body, {
  status: res.status,
  headers: { 'content-type': res.headers.get('content-type') ?? 'application/json', 'cache-control': cacheControl },
});
```

---

## 6. Checklist "pronto para produção" (guardrails que impedem novas vulns)

Marque tudo antes de qualquer deploy de prod. Cada item vira idealmente um teste/gate de CI.

**Segredos & config**
- [ ] `runtime.exs` faz `fetch_env!`/`fetch_secret!` em `:prod`; boot falha sem `JWT_SECRET`/`INTERNAL_JWT_SECRET`/`INTERNAL_API_KEY`/`GOOGLE_CLIENT_ID` (Vuln 1).
- [ ] Segredos ≥ 32 bytes, aleatórios, nunca prefixo `dev-`.
- [ ] `PUBLIC_MOCK_DATA` **não** pode ser `true` em build de prod; CI falha se for (Vuln 5).
- [ ] `.env`/secrets fora do git; rotação documentada.

**AuthN/AuthZ**
- [ ] Toda rota da API classificada (público/auth/auth+dono) — §3 — e testada (401 sem token, 403 de terceiro).
- [ ] `/children/:id` e `/measurements` com auth+dono (Vuln 2).
- [ ] `/agent/chat` valida JWT e deriva identidade do token (Vuln 3).
- [ ] Agents `:50052` exige `x-internal-key`, sem CORS `*`, bind interno (Vuln 4).
- [ ] JWT: algoritmo fixado (`HS256`), `exp` verificado, `typ` verificado — já ok em `Api.Auth.verify_token/2`; manter teste anti-`alg:none`.

**Entrada & dados**
- [ ] Changesets com allowlist mínima; campos de sistema nunca via `cast` do corpo (Vuln 7).
- [ ] Ecto sempre via query builder (sem SQL string) — já é o caso; manter regra.
- [ ] Nenhum log de CPF/CNPJ/token/senha (`RULES.md` já proíbe; adicionar teste/grep no CI).

**Agente (guardrails)**
- [ ] Allowlist fechada de componentes + schema zod por componente (G1).
- [ ] Itens re-hidratados do banco por id, nunca dados inventados pelo LLM (G2).
- [ ] Front renderiza só tipos conhecidos, sem `{@html}`, com `isSafeHref` em ações (G3).
- [ ] Teto de nº de componentes e tamanho de labels por resposta (G5).
- [ ] Canal autenticado (G6 ⇒ Vuln 3/4).

**Cache & headers**
- [ ] Plug default `private, no-store`; público é opt-in (§5.1).
- [ ] Proxy `/api` repassa/força `cache-control` (§5.3).
- [ ] Headers de segurança em prod: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`/CSP `frame-ancestors`, `Content-Security-Policy` (bloquear inline/`unsafe-eval`; permitir só origens necessárias — Google GSI, S3 de imagens).
- [ ] CORS da API continua allowlist (não `*`); a lista de origens vem de env em prod, não hardcoded de localhost.

**Transporte & rede**
- [ ] TLS em tudo; cookies `Secure` (já: `secure: !dev`), `HttpOnly` (já), `SameSite=Lax` (já).
- [ ] `:50052` (agents) e `:4000` (API) não publicados diretamente na internet além do necessário.
- [ ] Rate limiting em `/auth/*` e `/agent/chat` (fora do escopo desta análise, mas exigido por `RULES.md`).

**Processo**
- [ ] Rodar `/security-review` (esta skill) em cada PR que toca auth, agente, controllers ou config.
- [ ] `mix credo`, `svelte-check`, testes verdes como gate.

---

## 7. Como um modelo mais simples deve usar este documento

1. Trate cada Vuln (§2) e cada guardrail do agente (§6) como uma tarefa isolada; comece pela severidade CRÍTICA → ALTA.
2. Para cada tarefa: localize o `arquivo:linha`, aplique a correção mostrada, adicione o teste de regressão indicado ("Guardrail"), rode `yarn test:api`/`yarn test:web`/`yarn test:agents` e `yarn check` conforme a área.
3. **Regra que nunca pode ser violada:** autorização e validação de entrada vivem no `apps/api` (e no agents para o canal interno). Correções no `apps/web` são só UX/defesa dupla e não substituem as do backend.
4. Não presuma — quando o texto disser "verificar" (ex.: Vuln 7), abra o schema real e confirme a lista de `cast` antes de editar.
5. Um item por commit, mensagem semântica (`fix(api): ...`, `fix(security): ...`).
