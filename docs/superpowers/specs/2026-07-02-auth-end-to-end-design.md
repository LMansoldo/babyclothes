# Autenticação End-to-End — Design

> **Goal:** Fazer a autenticação funcionar de ponta a ponta: Google Sign-In → JWT com expiração/refresh → cookie httpOnly gerenciado server-side → route guards com ownership na API. Corrigir o descasamento localStorage vs cookie e proteger as rotas hoje abertas.

**Status atual:** Auth ~40% implementada. Backend tem Google OAuth + JWT interno funcionando, mas: (1) token salvo em localStorage e lido via cookie no SSR → login loop; (2) JWT sem expiração; (3) plugs de auth existem mas não são aplicados; (4) rotas de children/measurements/notifications abertas sem auth.

**Tech stack:** Elixir 1.17 (Plug/Bandit, JOSE, Ecto) + SvelteKit 2/Svelte 5.

**Decisões tomadas:**
- Escopo: **full stack** (frontend flow + API guards + ownership)
- Token flow: **server action + httpOnly cookie** (token nunca exposto ao JS client)
- JWT: **access token (1h) + refresh token (30d)** com refresh automático no SSR hook
- Guards: **Opção A** — cada action chama `Api.Plugs.Auth.call/2` inline (consistente com `InternalKey` no `InternalRouter`)
- Ownership: **completo** — user só mexe nos próprios recursos (403 caso contrário)
- Client-side fetch: **proxy via SvelteKit** — chamadas passam por `+page.server.ts` / rotas `/api` que anexam o cookie server-side
- Google OAuth: Client ID ainda **não configurado** — spec assume env vars; setup documentado como passo manual

---

## Sumário de Work Items

| # | Grupo | Work Item | Tipo |
|---|-------|-----------|------|
| 1 | API | JWT com expiração + refresh token | Reescrita `auth.ex` |
| 2 | API | Endpoints `/auth/refresh` e `/auth/logout` | Novo controller action |
| 3 | API | `Auth` plug + ownership helper | Revisão + novo helper |
| 4 | API | Aplicar guards + ownership nas rotas | MOD controllers |
| 5 | Web | Server actions de login/register/logout | Novo `+page.server.ts` |
| 6 | Web | Fix `hooks.server.ts` com refresh flow | MOD |
| 7 | Web | Proxy de API calls via SvelteKit | Novo `/api` proxy |
| 8 | Web | Refatorar `HttpAuthRepository` (remover localStorage token) | MOD |
| 9 | Config | Env vars + doc de setup Google OAuth | MOD + docs |
| 10 | Test | Testes API + frontend | Novo |

---

## WI-1: JWT com Expiração + Refresh Token

**Arquivo:** `apps/api/lib/api/auth.ex`

### Problema

`generate_internal_token/1` gera um JWT HS256 sem claim `exp`. `verify_internal_token/1` não valida expiração. Não há refresh token.

### Spec

**Access token** — curta duração para chamadas autenticadas:

```elixir
@access_ttl 3600         # 1 hora

def generate_access_token(%User{} = user) do
  now = System.system_time(:second)
  claims = %{
    "sub" => to_string(user.id),
    "email" => user.email,
    "name" => user.name,
    "typ" => "access",
    "iat" => now,
    "exp" => now + @access_ttl
  }
  sign(claims)
end
```

**Refresh token** — longa duração, usado só para emitir novos access tokens:

```elixir
@refresh_ttl 2_592_000   # 30 dias

def generate_refresh_token(%User{} = user) do
  now = System.system_time(:second)
  claims = %{
    "sub" => to_string(user.id),
    "typ" => "refresh",
    "iat" => now,
    "exp" => now + @refresh_ttl
  }
  sign(claims)
end
```

**Verificação** — valida assinatura, expiração e tipo do claim:

```elixir
@spec verify_token(String.t(), String.t()) ::
        {:ok, map()} | {:error, :invalid_token | :token_expired | :wrong_type}
def verify_token(token, expected_typ) do
  secret = Application.get_env(:api, :internal_jwt_secret)
  jwk = JOSE.JWK.from_oct(secret)

  case JOSE.JWT.verify_strict(jwk, ["HS256"], token) do
    {true, jwt, _} ->
      claims = JOSE.JWT.to_map(jwt) |> elem(1)
      now = System.system_time(:second)

      cond do
        claims["exp"] && claims["exp"] < now -> {:error, :token_expired}
        claims["typ"] != expected_typ -> {:error, :wrong_type}
        true -> {:ok, claims}
      end

    _ ->
      {:error, :invalid_token}
  end
end
```

**Compatibilidade:** `generate_internal_token/1` e `verify_internal_token/1` mantidos como wrappers finos (`generate_access_token/1` e `verify_token(token, "access")`) para não quebrar os controllers existentes que já os usam (`ItemsController.authenticate/1`, `SseController`, `AuthController`).

### Mudanças

- Extrair helper privado `sign/1` (JWS HS256 compact) reutilizado por access e refresh
- `AuthController.google_login/1` passa a retornar **access token + refresh token** no response body

### Testes

- `generate_access_token/1` gera token com `exp` = iat + 3600 e `typ: "access"`
- `verify_token/2` rejeita token expirado → `{:error, :token_expired}`
- `verify_token/2` rejeita refresh token quando espera access → `{:error, :wrong_type}`
- `generate_refresh_token/1` gera token válido por 30 dias

---

## WI-2: Endpoints `/auth/refresh` e `/auth/logout`

**Arquivos:** `apps/api/lib/api/controllers/auth_controller.ex`, `apps/api/lib/api/router.ex`

### POST /auth/refresh

Recebe refresh token, emite novo par access/refresh (rotação de refresh token).

**Request body:**

```json
{ "refresh_token": "eyJ..." }
```

**Fluxo:**
1. `Api.Auth.verify_token(refresh_token, "refresh")`
2. Se `{:error, _}` → 401 `{"error": "invalid_refresh_token"}`
3. Busca user por `claims["sub"]` → 401 se não existe
4. Gera novo access + refresh token
5. Response 200:

```json
{
  "token": "eyJ...(access)",
  "refresh_token": "eyJ...(refresh)",
  "user": { "id": 1, "email": "...", "name": "...", "avatar_url": "...", "type": "pf", "is_seller": false }
}
```

### POST /auth/logout

Endpoint simbólico. A invalidação real acontece no cliente (SvelteKit deleta os cookies). Como os JWTs são stateless, não há blacklist server-side neste escopo.

**Fluxo:** retorna 200 `{"ok": true}`. (Sem body obrigatório.)

> **Nota de escopo:** invalidação server-side de refresh tokens (blacklist/rotação com armazenamento) fica fora deste spec. Com rotação de refresh a cada uso, um refresh roubado tem janela limitada, aceitável para o estágio atual.

### Router

```
POST /auth/refresh → AuthController.refresh/1
POST /auth/logout  → AuthController.logout/1
```

### Testes

- `/auth/refresh` com refresh válido → 200 com novo par de tokens
- `/auth/refresh` com refresh expirado → 401
- `/auth/refresh` com access token (typ errado) → 401
- `/auth/logout` → 200

---

## WI-3: Auth Plug + Ownership Helper

**Arquivos:** `apps/api/lib/api/plugs/auth.ex` (revisar), `apps/api/lib/api/plugs/require_auth.ex` (deprecar), `apps/api/lib/api/auth/guard.ex` (novo helper)

### Estado atual

O projeto já tem **dois** plugs, mas nenhum é usado no router:
- `Api.Plugs.Auth` — verifica o token via `verify_internal_token/1`, seta `conn.assigns.current_user_id = claims["sub"]` (string), halta 401 se ausente/inválido
- `Api.Plugs.RequireAuth` — só checa se `current_user_id` está no assign, halta 401 se não

Como o `Auth` já halta em falha, o `RequireAuth` é redundante. **Decisão:** usar só `Api.Plugs.Auth` como o guard inline (Opção A) e remover `RequireAuth`.

### Api.Plugs.Auth (revisado)

Ajustar para: usar `verify_token(token, "access")` (WI-1) e normalizar `current_user_id` para **integer** (hoje é string, o que quebra comparação de ownership com `child.user_id`):

```elixir
def call(conn, _opts) do
  case get_req_header(conn, "authorization") do
    ["Bearer " <> token] ->
      case Api.Auth.verify_token(token, "access") do
        {:ok, claims} ->
          assign(conn, :current_user_id, String.to_integer(claims["sub"]))

        {:error, _} ->
          unauthorized(conn)
      end

    _ ->
      unauthorized(conn)
  end
end

defp unauthorized(conn) do
  conn
  |> put_resp_content_type("application/json")
  |> send_resp(401, Jason.encode!(%{error: "unauthorized"}))
  |> halt()
end
```

### Ownership Helper

**Módulo novo:** `Api.Auth.Guard`

```elixir
@doc """
Verifica se o current_user é dono do recurso. Retorna conn (segue) ou
conn halted com 403.
"""
def require_owner(conn, resource_user_id) do
  if conn.assigns[:current_user_id] == resource_user_id do
    conn
  else
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(403, Jason.encode!(%{error: "forbidden"}))
    |> halt()
  end
end
```

### Padrão de uso nos controllers (Opção A)

Igual ao `InternalKey` no `InternalRouter` — o controller chama o plug e checa `halted`:

```elixir
def create(conn) do
  conn = Api.Plugs.Auth.call(conn, [])

  if conn.halted do
    conn
  else
    # ... lógica autenticada, usa conn.assigns.current_user_id
  end
end
```

Para ownership, após carregar o recurso:

```elixir
conn = Api.Auth.Guard.require_owner(conn, child.user_id)
if conn.halted, do: conn, else: # ... prossegue
```

### Testes

- `Auth` sem header → 401
- `Auth` com token expirado → 401
- `Auth` com token válido → assign `current_user_id` (integer)
- `Guard.require_owner` com dono correto → segue
- `Guard.require_owner` com user errado → 403 halted

---

## WI-4: Aplicar Guards + Ownership nas Rotas

**Arquivos:** `children_controller.ex`, `notifications_controller.ex`, `items_controller.ex`

### Matriz de proteção

| Rota | Auth | Ownership check |
|------|------|-----------------|
| `POST /children` | ✅ | `body_params["user_id"] == current_user_id` |
| `PATCH /children/:id` | ✅ | `child.user_id == current_user_id` |
| `DELETE /children/:id` | ✅ | `child.user_id == current_user_id` |
| `GET /users/:user_id/children` | ✅ | `user_id == current_user_id` |
| `POST /children/:child_id/measurements` | ✅ | `child.user_id == current_user_id` |
| `PATCH /measurements/:id` | ✅ | measurement→child→`user_id` |
| `DELETE /measurements/:id` | ✅ | measurement→child→`user_id` |
| `POST /users/:user_id/notifications` | ✅ | `user_id == current_user_id` |
| `PATCH /notifications/:id/read` | ✅ | notification→`user_id` |
| `PATCH /users/:user_id/notifications/read-all` | ✅ | `user_id == current_user_id` |
| `DELETE /notifications/:id` | ✅ | notification→`user_id` |
| `PATCH /items/:id` | ✅ | `item.seller_id == current_user_id` |
| `DELETE /items/:id` | ✅ | `item.seller_id == current_user_id` |

**Rotas de leitura pública mantidas abertas:** `GET /catalog`, `GET /items`, `GET /items/:id`, `GET /feature-flags`, `GET /health`.

**Rotas internas (agents):** já protegidas por `InternalKey`, sem mudança.

### Regra de segurança em `POST /children`

Hoje o `create/1` aceita `user_id` do body. Passar a **ignorar** `user_id` do body e usar `conn.assigns.current_user_id` como fonte de verdade (previne criar filho para outro user).

### Testes

- Cada rota protegida: sem token → 401
- Cada rota protegida: token de outro user → 403
- Cada rota protegida: dono correto → sucesso
- `POST /children` ignora `user_id` do body, usa o do token

---

## WI-5: Server Actions de Login/Register/Logout

**Arquivo novo:** `apps/web/src/routes/login/+page.server.ts`

### Actions

**`login`** — recebe o credential do Google:

```ts
export const actions = {
  login: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const credential = form.get('credential') as string;

    // Backend espera a chave "token" (o Google ID token/credential do GSI).
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: credential })
    });

    if (!res.ok) return fail(401, { error: 'login_failed' });

    const { token, refresh_token, user } = await res.json();
    setAuthCookies(cookies, token, refresh_token);

    return { session: mapUser(user) };
  },
  // register, logout ...
};
```

**Cookies (helper `setAuthCookies`):**

```ts
cookies.set('babyclothes_token', accessToken, {
  path: '/', httpOnly: true, secure: !dev, sameSite: 'lax', maxAge: 60 * 60          // 1h
});
cookies.set('babyclothes_refresh', refreshToken, {
  path: '/', httpOnly: true, secure: !dev, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 // 30d
});
```

**`register`** — completa perfil PF/PJ:
- Lê `babyclothes_token` cookie, chama `PATCH /auth/me`
- Retorna session atualizada

**`logout`** — deleta ambos cookies, `redirect(303, '/login')`.

### `login/+page.svelte`

- Substituir chamadas diretas do `HttpAuthRepository` por `<form method="POST" action="?/login" use:enhance>`
- O `handleGoogleCredential` global preenche um hidden input `credential` e submete o form
- Fluxo de step (`login → register → redirecting`) preservado, dirigido pelo retorno das actions
- Em sucesso com `session.type` truthy → `goto('/catalog')`; se `type == null` → step `register`

### Testes

- Action `login` com credential válido → seta cookies, retorna session
- Action `login` com credential inválido → `fail(401)`
- Action `register` → chama `/auth/me`, retorna session
- Action `logout` → deleta cookies, redirect

---

## WI-6: Fix `hooks.server.ts` com Refresh Flow

**Arquivo:** `apps/web/src/hooks.server.ts`

### Fluxo atualizado

```
1. mock mode (PUBLIC_MOCK_DATA=true) → injeta mockSession, skip
2. lê cookie babyclothes_token
3. GET /auth/session com Bearer
   ├─ 200 → popula locals.session
   ├─ 401 + existe babyclothes_refresh:
   │    POST /auth/refresh { refresh_token }
   │    ├─ 200 → seta novos cookies, popula locals.session
   │    └─ !200 → deleta cookies, locals.session = undefined
   └─ 401 sem refresh → deleta cookie, undefined
4. guard: !session && !public → redirect(303, '/login')
```

**Rotas públicas:** `['/login']` (mantido).

**Detalhe:** ao dar refresh dentro do hook, os novos cookies são setados via `event.cookies.set(...)` e o `locals.session` é populado a partir do user retornado pelo refresh — sem segunda chamada a `/auth/session`.

### Testes

- Sem cookie + rota privada → redirect `/login`
- Cookie válido → popula session
- Access expirado + refresh válido → renova cookies, popula session
- Access + refresh expirados → deleta cookies, redirect

---

## WI-7: Proxy de API Calls via SvelteKit

**Problema:** com token httpOnly, as repos client-side (`HttpChildRepository`, `HttpCatalogRepository`, `HttpItemRepository`, `HttpNotificationRepository`) não conseguem ler o token para anexar `Authorization: Bearer`.

**Solução:** rotear chamadas autenticadas através do servidor SvelteKit, que anexa o cookie.

### Abordagem: `+page.server.ts` load functions (preferida para leitura)

Para páginas que carregam dados autenticados (child, notifications, sell/my-items), mover a busca para `load` no `+page.server.ts`, que roda no servidor com acesso ao cookie:

```ts
export const load: PageServerLoad = async ({ locals, fetch, cookies }) => {
  const token = cookies.get('babyclothes_token');
  const res = await fetch(`${API_URL}/users/${locals.session.userId}/children`, {
    headers: { authorization: `Bearer ${token}` }
  });
  return { children: await res.json() };
};
```

### Abordagem: rota proxy `/api/[...path]` (para mutations client-side)

Para ações client-side (criar filho, adicionar measurement, marcar notificação lida) sem full page reload, criar um proxy genérico:

**Arquivo novo:** `apps/web/src/routes/api/[...path]/+server.ts`

```ts
// Encaminha qualquer método para a API Elixir, anexando o Bearer do cookie.
export const GET/POST/PATCH/DELETE: RequestHandler = async ({ params, request, cookies, fetch }) => {
  const token = cookies.get('babyclothes_token');
  const res = await fetch(`${API_URL}/${params.path}`, {
    method: request.method,
    headers: {
      'content-type': 'application/json',
      ...(token && { authorization: `Bearer ${token}` })
    },
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text()
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
};
```

As repos client-side passam a apontar para `/api/...` (mesma origem) em vez de `PUBLIC_API_URL` direto. O proxy injeta o token server-side.

> **Escopo:** o proxy `/api/[...path]` **não** faz refresh automático em 401 (diferente do hook). Se o access expirar durante uma sessão ativa, a próxima navegação SSR renova via hook. Mutations client-side que baterem 401 devem tratar redirecionando para reload da página. Refresh dentro do proxy pode ser adicionado depois se necessário.

### Testes

- Proxy anexa Bearer do cookie e encaminha para a API
- Proxy sem cookie encaminha sem Authorization (API responde 401)
- `load` function server-side retorna dados autenticados

---

## WI-8: Refatorar HttpAuthRepository

**Arquivo:** `apps/web/src/lib/infrastructure/http/HttpAuthRepository.ts`

### Mudanças

- **Remover** `localStorage.setItem('babyclothes_token', ...)` — token agora é cookie httpOnly gerenciado pelas server actions
- `getAuthToken()` fica **obsoleto** para chamadas client-side (token não é mais acessível). Remover exportação e ajustar as repos que o importam para usar o proxy `/api/...`
- Manter `getUserId()` client-side? **Não** — o `userId` vem da session (context do layout). Remover `USER_ID_KEY` do localStorage; usar `session.userId` do context store.
- `loginWithGoogle`, `getSession`, `updateProfile`, `logout` do repository passam a ser usados só onde faça sentido server-side, ou removidos em favor das server actions (WI-5)

> **Nota:** parte da lógica do `HttpAuthRepository` migra para as server actions. O repository pode ser reduzido a mapeamento de tipos (`mapUser → Session`) compartilhado entre server actions e hook.

### Testes

- Atualizar `LoginWithGoogle.test.ts` / `Logout.test.ts` para o novo fluxo (ou remover se substituídos por testes de server action)
- Garantir que nenhuma repo importa mais `getAuthToken` do localStorage

---

## WI-9: Env Vars + Setup Google OAuth

**Arquivos:** `.env` (raiz), `apps/web/.env`, docs

### Env vars

**`apps/web/.env`:**
```
PUBLIC_API_URL=http://localhost:4000
PUBLIC_MOCK_DATA=false
PUBLIC_GOOGLE_CLIENT_ID=<seu-client-id>.apps.googleusercontent.com
```

**`.env` (raiz) — API:**
```
GOOGLE_CLIENT_ID=<seu-client-id>.apps.googleusercontent.com
INTERNAL_JWT_SECRET=<secret-forte-32+-chars>
```

O `GOOGLE_CLIENT_ID` da API precisa ser **o mesmo** do frontend — a API valida o claim `aud` do Google ID token contra esse valor.

### Doc de setup (novo: `docs/setup/google-oauth.md`)

Passo a passo:
1. Google Cloud Console → criar projeto
2. APIs & Services → OAuth consent screen → External, preencher app name/support email
3. Credentials → Create OAuth client ID → Web application
4. Authorized JavaScript origins: `http://localhost:5173` (dev), domínio de prod
5. Copiar Client ID → colar nas env vars acima
6. Nenhum Client Secret necessário (fluxo usa ID token via GSI, não authorization code)

### Testes

- N/A (config). Validação manual: login real funciona com Client ID configurado.

---

## WI-10: Testes

### API (`apps/api/test`)

- `auth_test.exs` — expiração, refresh, wrong_type (WI-1)
- `auth_controller_test.exs` — `/auth/refresh`, `/auth/logout` (WI-2)
- `plugs/auth_test.exs` — 401 sem/expirado, assign integer (WI-3)
- `auth/guard_test.exs` — ownership 403 (WI-3)
- Ownership por rota nos controller tests existentes (WI-4)

### Frontend (`apps/web`)

- Server actions login/register/logout (WI-5)
- Hook refresh flow (WI-6)
- Proxy `/api/[...path]` (WI-7)

### Smoke test (API)

Atualizar `smoke_test.exs`: gerar access token via `generate_access_token`, garantir que rotas protegidas aceitam o token e rejeitam sem ele.

---

## Dependências e Ordem de Implementação

```
WI-1 (JWT exp/refresh) ──→ WI-2 (/auth/refresh, /auth/logout)
                       └──→ WI-3 (Auth plug usa verify_token)

WI-3 (guards + ownership) ──→ WI-4 (aplicar nas rotas)

WI-5 (server actions) ──depende──→ WI-2 (usa /auth/refresh no hook)
WI-6 (hook refresh)   ──depende──→ WI-2
WI-7 (proxy)          ──depende──→ WI-6 (cookie setado)
WI-8 (refactor repo)  ──depende──→ WI-5, WI-7

WI-9 (env/docs) ── independente (mas necessário p/ teste manual)
WI-10 (testes) ── acompanha cada WI
```

**Ordem sugerida:**

1. **WI-1** JWT exp/refresh (base de tudo no backend)
2. **WI-2** endpoints refresh/logout
3. **WI-3** Auth plug + Guard
4. **WI-4** aplicar guards + ownership nas rotas
5. **WI-5** server actions de login
6. **WI-6** hook refresh flow
7. **WI-7** proxy de API calls
8. **WI-8** refatorar HttpAuthRepository
9. **WI-9** env vars + doc (pode ser feito em paralelo)
10. **WI-10** testes (acompanha cada WI via TDD)

---

## File Map — Arquivos Novos e Modificados

```
apps/api/
├── lib/api/
│   ├── auth.ex                                  # MOD: exp, refresh, verify_token
│   ├── auth/
│   │   └── guard.ex                             # NEW: require_owner ownership helper
│   ├── plugs/
│   │   ├── auth.ex                              # MOD: verify_token access, assign current_user_id (integer)
│   │   └── require_auth.ex                      # DEL: redundante (Auth já halta)
│   ├── router.ex                                # MOD: /auth/refresh, /auth/logout
│   └── controllers/
│       ├── auth_controller.ex                   # MOD: refresh/1, logout/1, google_login retorna par
│       ├── children_controller.ex               # MOD: Auth plug + ownership
│       ├── notifications_controller.ex          # MOD: Auth plug + ownership
│       └── items_controller.ex                  # MOD: ownership em update/delete
└── test/api/
    ├── auth_test.exs                            # MOD
    ├── controllers/auth_controller_test.exs     # NEW/MOD
    ├── plugs/auth_test.exs                      # NEW
    ├── auth/guard_test.exs                      # NEW
    └── smoke_test.exs                           # MOD

apps/web/
├── .env                                         # MOD: PUBLIC_GOOGLE_CLIENT_ID
├── src/
│   ├── hooks.server.ts                          # MOD: refresh flow
│   ├── routes/
│   │   ├── login/
│   │   │   ├── +page.server.ts                  # NEW: login/register/logout actions
│   │   │   └── +page.svelte                     # MOD: use:enhance forms
│   │   └── api/
│   │       └── [...path]/+server.ts             # NEW: proxy autenticado
│   └── lib/infrastructure/http/
│       └── HttpAuthRepository.ts                # MOD: remove localStorage token

.env                                             # MOD: GOOGLE_CLIENT_ID, INTERNAL_JWT_SECRET
docs/setup/
└── google-oauth.md                              # NEW: passo a passo Google Cloud
```
