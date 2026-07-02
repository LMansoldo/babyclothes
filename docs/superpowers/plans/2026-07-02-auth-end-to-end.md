# Autenticação End-to-End Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a autenticação funcionar de ponta a ponta — Google Sign-In → JWT access/refresh → cookie httpOnly gerenciado server-side → route guards com ownership na API.

**Architecture:** Backend Elixir emite access token (1h) + refresh token (30d) HS256. Frontend SvelteKit troca o Google credential por tokens via server action, guarda em cookies httpOnly, e faz refresh automático no SSR hook. Chamadas autenticadas do client passam por um proxy same-origin que injeta o Bearer a partir do cookie. Rotas de escrita na API exigem auth + ownership.

**Tech Stack:** Elixir 1.17 (Plug/Bandit, JOSE, Ecto), SvelteKit 2 / Svelte 5, Vitest, ExUnit.

## Global Constraints

- Todos os comandos Elixir rodam no container com `MIX_ENV=test`: `docker compose exec -e MIX_ENV=test api mix test`
- JWT HS256 assinado com `Application.get_env(:api, :internal_jwt_secret)`
- Access token TTL: `3600` segundos (1h). Refresh token TTL: `2_592_000` segundos (30 dias)
- Cookies: `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `secure` só fora de dev
- Nome dos cookies: `babyclothes_token` (access), `babyclothes_refresh` (refresh)
- Backend `POST /auth/google` espera body `{"token": <google_id_token>}` — a chave é `token`, não `credential` nem `code`
- `current_user_id` no `conn.assigns` deve ser **integer** (não string)
- Sem emojis na UI. Commits semânticos: `feat(scope):`, `fix(scope):`, etc.
- Rotas de leitura pública permanecem abertas: `GET /health`, `GET /catalog`, `GET /items`, `GET /items/:id`, `GET /feature-flags`

---

# Phase 1 — API (Elixir)

### Task 1: JWT access/refresh + verify_token

**Files:**
- Modify: `apps/api/lib/api/auth.ex`
- Test: `apps/api/test/api/auth_test.exs`

**Interfaces:**
- Produces:
  - `Api.Auth.generate_access_token(%User{}) :: String.t()`
  - `Api.Auth.generate_refresh_token(%User{}) :: String.t()`
  - `Api.Auth.verify_token(String.t(), String.t()) :: {:ok, map()} | {:error, :invalid_token | :token_expired | :wrong_type}`
  - `Api.Auth.generate_internal_token/1` e `verify_internal_token/1` mantidos como wrappers (compat)

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `apps/api/test/api/auth_test.exs`:

```elixir
defmodule Api.AuthTest do
  use Api.DataCase, async: true

  alias Api.Auth

  describe "generate_access_token/1 + verify_token/2" do
    test "generates an access token with exp and typ=access" do
      user = insert(:user)
      token = Auth.generate_access_token(user)

      assert {:ok, claims} = Auth.verify_token(token, "access")
      assert claims["sub"] == to_string(user.id)
      assert claims["email"] == user.email
      assert claims["typ"] == "access"
      assert is_integer(claims["exp"])
      assert claims["exp"] == claims["iat"] + 3600
    end

    test "rejects an access token when expecting refresh" do
      user = insert(:user)
      token = Auth.generate_access_token(user)

      assert {:error, :wrong_type} = Auth.verify_token(token, "refresh")
    end

    test "rejects a garbage token" do
      assert {:error, :invalid_token} = Auth.verify_token("not.a.jwt", "access")
    end
  end

  describe "generate_refresh_token/1" do
    test "generates a refresh token valid for 30 days" do
      user = insert(:user)
      token = Auth.generate_refresh_token(user)

      assert {:ok, claims} = Auth.verify_token(token, "refresh")
      assert claims["typ"] == "refresh"
      assert claims["exp"] == claims["iat"] + 2_592_000
    end
  end

  describe "verify_token/2 expiration" do
    test "rejects an expired token" do
      user = insert(:user)
      # Craft a token whose exp is already in the past.
      secret = Application.get_env(:api, :internal_jwt_secret)
      jwk = JOSE.JWK.from_oct(secret)
      past = System.system_time(:second) - 10

      claims = %{"sub" => to_string(user.id), "typ" => "access", "iat" => past - 3600, "exp" => past}
      jwt = JOSE.JWT.from_map(claims)
      jws = JOSE.JWS.from_map(%{"alg" => "HS256"})
      token = JOSE.JWT.sign(jwk, jws, jwt) |> JOSE.JWS.compact() |> elem(1)

      assert {:error, :token_expired} = Auth.verify_token(token, "access")
    end
  end

  describe "compat wrappers" do
    test "verify_internal_token accepts a token from generate_internal_token" do
      user = insert(:user)
      token = Auth.generate_internal_token(user)

      assert {:ok, claims} = Auth.verify_internal_token(token)
      assert claims["sub"] == to_string(user.id)
    end
  end
end
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/auth_test.exs`
Expected: FAIL — `function Api.Auth.generate_access_token/1 is undefined`

- [ ] **Step 3: Implement the new functions**

In `apps/api/lib/api/auth.ex`, replace the two functions `verify_internal_token/1` and `generate_internal_token/1` with the block below (keep everything else — `verify_google_token`, `verify_google_jwt`, `fetch_google_jwks`, `find_or_create_user` — untouched):

```elixir
  @access_ttl 3_600
  @refresh_ttl 2_592_000

  @doc """
  Generate a short-lived access token (1h) for a user.
  """
  def generate_access_token(%User{} = user) do
    now = System.system_time(:second)

    sign(%{
      "sub" => to_string(user.id),
      "email" => user.email,
      "name" => user.name,
      "typ" => "access",
      "iat" => now,
      "exp" => now + @access_ttl
    })
  end

  @doc """
  Generate a long-lived refresh token (30d) for a user.
  """
  def generate_refresh_token(%User{} = user) do
    now = System.system_time(:second)

    sign(%{
      "sub" => to_string(user.id),
      "typ" => "refresh",
      "iat" => now,
      "exp" => now + @refresh_ttl
    })
  end

  @doc """
  Verify an HS256 token, checking signature, expiration and the `typ` claim.
  """
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
          is_integer(claims["exp"]) and claims["exp"] < now -> {:error, :token_expired}
          claims["typ"] != expected_typ -> {:error, :wrong_type}
          true -> {:ok, claims}
        end

      _ ->
        {:error, :invalid_token}
    end
  end

  @doc """
  Compat wrapper — issues an access token. Kept for existing callers.
  """
  def generate_internal_token(%User{} = user), do: generate_access_token(user)

  @doc """
  Compat wrapper — verifies an access token. Kept for existing callers.
  """
  def verify_internal_token(token), do: verify_token(token, "access")

  defp sign(claims) do
    secret = Application.get_env(:api, :internal_jwt_secret)
    jwk = JOSE.JWK.from_oct(secret)
    jwt = JOSE.JWT.from_map(claims)
    jws = JOSE.JWS.from_map(%{"alg" => "HS256"})
    JOSE.JWT.sign(jwk, jws, jwt) |> JOSE.JWS.compact() |> elem(1)
  end
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/auth_test.exs`
Expected: PASS (6 tests)

- [ ] **Step 5: Run the full suite to catch compat regressions**

Run: `docker compose exec -e MIX_ENV=test api mix test`
Expected: PASS — the existing `auth_controller_test.exs`, `items_controller_test.exs`, `sse_controller_test.exs` still pass because `generate_internal_token`/`verify_internal_token` behave the same for a freshly-issued token.

- [ ] **Step 6: Commit**

```bash
git add apps/api/lib/api/auth.ex apps/api/test/api/auth_test.exs
git commit -m "feat(api): add JWT access/refresh tokens with expiration and typ claim"
```

---

### Task 2: /auth/refresh + /auth/logout endpoints

**Files:**
- Modify: `apps/api/lib/api/controllers/auth_controller.ex`
- Modify: `apps/api/lib/api/router.ex:26` (after the `patch "/auth/me"` block)
- Test: `apps/api/test/api/controllers/auth_controller_test.exs`

**Interfaces:**
- Consumes: `Api.Auth.verify_token/2`, `Api.Auth.generate_access_token/1`, `Api.Auth.generate_refresh_token/1` (Task 1)
- Produces:
  - `POST /auth/refresh` — body `{"refresh_token": "..."}` → 200 `{token, refresh_token, user}` | 401
  - `POST /auth/logout` → 200 `{"ok": true}`
  - `AuthController.google_login/1` now also returns `refresh_token` in the body

- [ ] **Step 1: Write the failing tests**

Append these describe blocks to `apps/api/test/api/controllers/auth_controller_test.exs` (inside the existing module, before the final `end`):

```elixir
  describe "POST /auth/refresh" do
    test "issues a new token pair for a valid refresh token" do
      user = insert(:user)
      refresh = Api.Auth.generate_refresh_token(user)

      conn =
        conn(:post, "/auth/refresh", %{"refresh_token" => refresh})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert is_binary(body["token"])
      assert is_binary(body["refresh_token"])
      assert body["user"]["id"] == user.id
    end

    test "rejects an access token used as refresh" do
      user = insert(:user)
      access = Api.Auth.generate_access_token(user)

      conn =
        conn(:post, "/auth/refresh", %{"refresh_token" => access})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end

    test "rejects a missing refresh token" do
      conn =
        conn(:post, "/auth/refresh", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end
  end

  describe "POST /auth/logout" do
    test "returns 200" do
      conn =
        conn(:post, "/auth/logout", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      assert Jason.decode!(conn.resp_body)["ok"] == true
    end
  end
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/auth_controller_test.exs`
Expected: FAIL — routes return 404 (not defined yet)

- [ ] **Step 3: Add controller actions**

In `apps/api/lib/api/controllers/auth_controller.ex`, add these two functions after `google_login/1` (before the `defp authenticate` helpers). Also add a shared `user_json/1` helper and use it:

```elixir
  @doc """
  POST /auth/refresh
  Exchanges a valid refresh token for a fresh access + refresh token pair.
  """
  def refresh(conn) do
    with %{"refresh_token" => refresh_token} when is_binary(refresh_token) <- conn.body_params,
         {:ok, claims} <- Api.Auth.verify_token(refresh_token, "refresh"),
         %User{} = user <- Repo.get(User, claims["sub"]) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{
        token: Api.Auth.generate_access_token(user),
        refresh_token: Api.Auth.generate_refresh_token(user),
        user: user_json(user)
      }))
    else
      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "invalid_refresh_token"}))
    end
  end

  @doc """
  POST /auth/logout
  Stateless logout — the client discards its cookies. Returns 200.
  """
  def logout(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{ok: true}))
  end

  defp user_json(user) do
    %{
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      type: user.type,
      cpf: user.cpf,
      cnpj: user.cnpj,
      is_seller: user.is_seller
    }
  end
```

Then update `google_login/1` to also return the refresh token. Find the `send_resp(200, Jason.encode!(%{ token: internal_token, user: %{...} }))` block and replace it with:

```elixir
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(200, Jason.encode!(%{
              token: Api.Auth.generate_access_token(user),
              refresh_token: Api.Auth.generate_refresh_token(user),
              user: user_json(user)
            }))
```

(Remove the now-unused `internal_token = Api.Auth.generate_internal_token(user)` line above it.)

- [ ] **Step 4: Register the routes**

In `apps/api/lib/api/router.ex`, after the `patch "/auth/me"` block (line ~28), add:

```elixir
  post "/auth/refresh" do
    Api.Controllers.AuthController.refresh(conn)
  end

  post "/auth/logout" do
    Api.Controllers.AuthController.logout(conn)
  end
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/auth_controller_test.exs`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/lib/api/controllers/auth_controller.ex apps/api/lib/api/router.ex apps/api/test/api/controllers/auth_controller_test.exs
git commit -m "feat(api): add /auth/refresh and /auth/logout endpoints"
```

---

### Task 3: Revise Api.Plugs.Auth, remove RequireAuth

**Files:**
- Modify: `apps/api/lib/api/plugs/auth.ex`
- Delete: `apps/api/lib/api/plugs/require_auth.ex`
- Test: `apps/api/test/api/plugs/auth_test.exs` (new)

**Interfaces:**
- Consumes: `Api.Auth.verify_token/2` (Task 1)
- Produces: `Api.Plugs.Auth.call(conn, [])` — on success assigns `conn.assigns.current_user_id` as **integer** and returns conn; on failure sends 401 and halts.

- [ ] **Step 1: Write the failing test**

Create `apps/api/test/api/plugs/auth_test.exs`:

```elixir
defmodule Api.Plugs.AuthTest do
  use Api.ConnCase, async: true

  alias Api.Plugs.Auth

  test "assigns current_user_id as integer for a valid access token" do
    user = insert(:user)
    token = Api.Auth.generate_access_token(user)

    conn =
      conn(:get, "/")
      |> put_req_header("authorization", "Bearer #{token}")
      |> Auth.call([])

    refute conn.halted
    assert conn.assigns.current_user_id == user.id
    assert is_integer(conn.assigns.current_user_id)
  end

  test "halts with 401 when authorization header is missing" do
    conn = conn(:get, "/") |> Auth.call([])

    assert conn.halted
    assert conn.status == 401
  end

  test "halts with 401 for an expired token" do
    user = insert(:user)
    secret = Application.get_env(:api, :internal_jwt_secret)
    jwk = JOSE.JWK.from_oct(secret)
    past = System.system_time(:second) - 10

    claims = %{"sub" => to_string(user.id), "typ" => "access", "iat" => past - 3600, "exp" => past}
    jwt = JOSE.JWT.from_map(claims)
    jws = JOSE.JWS.from_map(%{"alg" => "HS256"})
    token = JOSE.JWT.sign(jwk, jws, jwt) |> JOSE.JWS.compact() |> elem(1)

    conn =
      conn(:get, "/")
      |> put_req_header("authorization", "Bearer #{token}")
      |> Auth.call([])

    assert conn.halted
    assert conn.status == 401
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/plugs/auth_test.exs`
Expected: FAIL — `current_user_id` is a string (`claims["sub"]`), so `is_integer` assertion fails.

- [ ] **Step 3: Rewrite the plug**

Replace the entire contents of `apps/api/lib/api/plugs/auth.ex`:

```elixir
defmodule Api.Plugs.Auth do
  @moduledoc """
  Verifies the Bearer access token and assigns `current_user_id` (integer).
  Halts with 401 if the token is missing, invalid, expired, or of the wrong type.

  Used inline in controller actions (Plug.Router has no pipe_through):

      def create(conn) do
        conn = Api.Plugs.Auth.call(conn, [])
        if conn.halted, do: conn, else: # ... authenticated logic
      end
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] ->
        case Api.Auth.verify_token(token, "access") do
          {:ok, claims} -> assign(conn, :current_user_id, String.to_integer(claims["sub"]))
          {:error, _} -> unauthorized(conn)
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
end
```

- [ ] **Step 4: Delete the redundant RequireAuth plug**

```bash
git rm apps/api/lib/api/plugs/require_auth.ex
```

Confirm nothing references it:

Run: `grep -rn "RequireAuth" apps/api/lib apps/api/test`
Expected: no output.

- [ ] **Step 5: Run tests to verify they pass**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/plugs/auth_test.exs`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/api/lib/api/plugs/auth.ex apps/api/test/api/plugs/auth_test.exs
git commit -m "feat(api): verify access token in Auth plug, assign integer user id, drop RequireAuth"
```

---

### Task 4: Api.Auth.Guard ownership helper

**Files:**
- Create: `apps/api/lib/api/auth/guard.ex`
- Test: `apps/api/test/api/auth/guard_test.exs`

**Interfaces:**
- Consumes: `conn.assigns.current_user_id` (integer, set by `Api.Plugs.Auth`)
- Produces: `Api.Auth.Guard.require_owner(conn, resource_user_id :: integer()) :: Plug.Conn.t()` — returns conn if owner, else sends 403 and halts.

- [ ] **Step 1: Write the failing test**

Create `apps/api/test/api/auth/guard_test.exs`:

```elixir
defmodule Api.Auth.GuardTest do
  use Api.ConnCase, async: true

  alias Api.Auth.Guard

  test "returns conn unchanged when current_user owns the resource" do
    conn = conn(:get, "/") |> Plug.Conn.assign(:current_user_id, 42)
    result = Guard.require_owner(conn, 42)

    refute result.halted
  end

  test "halts with 403 when current_user does not own the resource" do
    conn = conn(:get, "/") |> Plug.Conn.assign(:current_user_id, 42)
    result = Guard.require_owner(conn, 99)

    assert result.halted
    assert result.status == 403
    assert Jason.decode!(result.resp_body)["error"] == "forbidden"
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/auth/guard_test.exs`
Expected: FAIL — `Api.Auth.Guard` is undefined

- [ ] **Step 3: Implement the guard**

Create `apps/api/lib/api/auth/guard.ex`:

```elixir
defmodule Api.Auth.Guard do
  @moduledoc """
  Ownership checks for authenticated requests. Compares `current_user_id`
  (set by `Api.Plugs.Auth`) against the resource's owner id.
  """

  import Plug.Conn

  @doc """
  Returns the conn if the current user owns the resource, otherwise
  sends 403 and halts.
  """
  @spec require_owner(Plug.Conn.t(), integer()) :: Plug.Conn.t()
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
end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/auth/guard_test.exs`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/api/lib/api/auth/guard.ex apps/api/test/api/auth/guard_test.exs
git commit -m "feat(api): add ownership guard helper"
```

---

### Task 5: Guards + ownership on ChildrenController

**Files:**
- Modify: `apps/api/lib/api/controllers/children_controller.ex`
- Test: `apps/api/test/api/controllers/children_controller_test.exs`

**Interfaces:**
- Consumes: `Api.Plugs.Auth.call/2`, `Api.Auth.Guard.require_owner/2`, `conn.assigns.current_user_id`
- Behavior: `index`, `create`, `update`, `delete`, `add_measurement`, `update_measurement`, `delete_measurement` require auth; write ops enforce ownership. `create` uses `current_user_id` as the child's `user_id` (ignores body `user_id`).

- [ ] **Step 1: Write the failing tests**

Add a helper at the top of `apps/api/test/api/controllers/children_controller_test.exs` (inside the module, after `use Api.ConnCase`):

```elixir
  defp auth(conn, user), do: put_req_header(conn, "authorization", "Bearer #{Api.Auth.generate_access_token(user)}")
```

Add this describe block before the final `end`:

```elixir
  describe "authorization" do
    test "POST /children requires auth" do
      user = insert(:user)

      conn =
        conn(:post, "/children", %{"name" => "Pedro", "birth_date" => "2023-05-20", "user_id" => user.id})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end

    test "POST /children uses token user id, ignoring body user_id" do
      owner = insert(:user)
      other = insert(:user)

      conn =
        conn(:post, "/children", %{"name" => "Pedro", "birth_date" => "2023-05-20", "user_id" => other.id})
        |> put_req_header("content-type", "application/json")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 201
      assert Jason.decode!(conn.resp_body)["child"]["user_id"] == owner.id
    end

    test "DELETE /children/:id forbids non-owner" do
      owner = insert(:user)
      other = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:delete, "/children/#{child.id}")
        |> auth(other)
        |> Api.Router.call([])

      assert conn.status == 403
    end

    test "DELETE /children/:id allows owner" do
      owner = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:delete, "/children/#{child.id}")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 204
    end

    test "POST /children/:child_id/measurements forbids non-owner" do
      owner = insert(:user)
      other = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:post, "/children/#{child.id}/measurements", %{
          "weight_g" => 5000, "height_cm" => 60, "clothing_size" => "P",
          "recorded_at" => DateTime.to_iso8601(DateTime.utc_now())
        })
        |> put_req_header("content-type", "application/json")
        |> auth(other)
        |> Api.Router.call([])

      assert conn.status == 403
    end
  end
```

Also update the **existing** passing tests that hit these routes without auth — they will now 401. Add `|> auth(user)` to the existing `POST /children`, `PATCH /children/:id`, `DELETE /children/:id`, measurement create/update/delete, and `GET /users/:user_id/children` tests, using the `user`/`owner` that owns the resource. For `GET /users/:user_id/children`, the `user_id` in the path must equal the token user.

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/children_controller_test.exs`
Expected: FAIL — routes still unauthenticated / new ownership tests fail.

- [ ] **Step 3: Add auth + ownership to the controller**

In `apps/api/lib/api/controllers/children_controller.ex`, add aliases at the top after `alias Api.Children`:

```elixir
  alias Api.Plugs.Auth
  alias Api.Auth.Guard
```

Rewrite `index/2` to require the path `user_id` to match the token:

```elixir
  def index(conn, user_id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      conn = Guard.require_owner(conn, String.to_integer(user_id))

      if conn.halted do
        conn
      else
        children = Children.list_children(user_id)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{children: Enum.map(children, &child_json/1)}))
      end
    end
  end
```

Rewrite `create/1` to use the token user id:

```elixir
  def create(conn) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      attrs = Map.put(conn.body_params, "user_id", conn.assigns.current_user_id)

      case Children.create_child(attrs) do
        {:ok, child} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(201, Jason.encode!(%{child: child_json(child)}))

        {:error, changeset} ->
          send_changeset_error(conn, changeset)
      end
    end
  end
```

Rewrite `update/2` and `delete/2` to load the child, then enforce ownership. For `update/2`:

```elixir
  def update(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, child} <- Children.get_child(id),
         conn <- Guard.require_owner(conn, child.user_id),
         false <- conn.halted do
      case Children.update_child(id, conn.body_params) do
        {:ok, child} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(200, Jason.encode!(%{child: child_json(child)}))

        {:error, changeset} ->
          send_changeset_error(conn, changeset)
      end
    else
      true ->
        conn

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))

      %Plug.Conn{halted: true} = halted_conn ->
        halted_conn
    end
  end
```

For `delete/2`:

```elixir
  def delete(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, child} <- Children.get_child(id),
         conn <- Guard.require_owner(conn, child.user_id),
         false <- conn.halted do
      {:ok, _child} = Children.delete_child(id)
      send_resp(conn, 204, "")
    else
      true ->
        conn

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))

      %Plug.Conn{halted: true} = halted_conn ->
        halted_conn
    end
  end
```

Rewrite `add_measurement/2` to check ownership via the child:

```elixir
  def add_measurement(conn, child_id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, child} <- Children.get_child(child_id),
         conn <- Guard.require_owner(conn, child.user_id),
         false <- conn.halted do
      attrs = Map.put(conn.body_params, "child_id", child_id)

      case Children.add_measurement(attrs) do
        {:ok, measurement} ->
          Api.Workers.GrowthCheckWorker.schedule(child_id)

          conn
          |> put_resp_content_type("application/json")
          |> send_resp(201, Jason.encode!(%{measurement: measurement_json(measurement)}))

        {:error, changeset} ->
          send_changeset_error(conn, changeset)
      end
    else
      true ->
        conn

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))

      %Plug.Conn{halted: true} = halted_conn ->
        halted_conn
    end
  end
```

Rewrite `update_measurement/2` and `delete_measurement/2` to load the measurement, preload its child, and enforce ownership. Add a private helper and rewrite both:

```elixir
  def update_measurement(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, measurement} <- Children.get_measurement(id),
         owner_id <- measurement_owner_id(measurement),
         conn <- Guard.require_owner(conn, owner_id),
         false <- conn.halted do
      case Children.update_measurement(id, conn.body_params) do
        {:ok, measurement} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(200, Jason.encode!(%{measurement: measurement_json(measurement)}))

        {:error, changeset} ->
          send_changeset_error(conn, changeset)
      end
    else
      true -> conn
      {:error, :not_found} -> send_not_found(conn)
      %Plug.Conn{halted: true} = halted_conn -> halted_conn
    end
  end

  def delete_measurement(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, measurement} <- Children.get_measurement(id),
         owner_id <- measurement_owner_id(measurement),
         conn <- Guard.require_owner(conn, owner_id),
         false <- conn.halted do
      {:ok, _measurement} = Children.delete_measurement(id)
      send_resp(conn, 204, "")
    else
      true -> conn
      {:error, :not_found} -> send_not_found(conn)
      %Plug.Conn{halted: true} = halted_conn -> halted_conn
    end
  end

  defp measurement_owner_id(measurement) do
    measurement = Api.Repo.preload(measurement, :child)
    measurement.child.user_id
  end

  defp send_not_found(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Jason.encode!(%{error: "not found"}))
  end

  defp send_changeset_error(conn, changeset) do
    errors =
      Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
        Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
          opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
        end)
      end)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(422, Jason.encode!(%{errors: errors}))
  end
```

Remove the now-duplicated inline changeset-error blocks in the functions you rewrote (they now call `send_changeset_error/2`). Leave `show/2`, `list_measurements/2` (read) unauthenticated per the spec — actually per the ownership matrix these are reads; keep them open. Add `import Ecto.Query` is not needed.

> **Note:** `Api.Repo` alias — add `alias Api.Repo` at the top if not present (it isn't in this controller). Use `Api.Repo.preload` as written, or add the alias and use `Repo.preload`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/children_controller_test.exs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/lib/api/controllers/children_controller.ex apps/api/test/api/controllers/children_controller_test.exs
git commit -m "feat(api): require auth and ownership on children and measurements write routes"
```

---

### Task 6: Guards + ownership on NotificationsController

**Files:**
- Modify: `apps/api/lib/api/controllers/notifications_controller.ex`
- Test: `apps/api/test/api/controllers/notifications_controller_test.exs`

**Interfaces:**
- Consumes: `Api.Plugs.Auth.call/2`, `Api.Auth.Guard.require_owner/2`
- Behavior: `index`, `unread_count`, `create`, `mark_as_read`, `mark_all_as_read`, `delete` require auth; ownership enforced against the notification's / path's `user_id`.

- [ ] **Step 1: Write the failing tests**

Add the `auth/2` helper (as in Task 5) to `apps/api/test/api/controllers/notifications_controller_test.exs`, then add:

```elixir
  describe "authorization" do
    test "GET /users/:user_id/notifications requires auth" do
      user = insert(:user)
      conn = conn(:get, "/users/#{user.id}/notifications") |> Api.Router.call([])
      assert conn.status == 401
    end

    test "GET /users/:user_id/notifications forbids other users" do
      user = insert(:user)
      other = insert(:user)

      conn =
        conn(:get, "/users/#{user.id}/notifications")
        |> auth(other)
        |> Api.Router.call([])

      assert conn.status == 403
    end

    test "PATCH /notifications/:id/read forbids non-owner" do
      user = insert(:user)
      other = insert(:user)
      notification = insert(:notification, user: user)

      conn =
        conn(:patch, "/notifications/#{notification.id}/read")
        |> auth(other)
        |> Api.Router.call([])

      assert conn.status == 403
    end

    test "PATCH /notifications/:id/read allows owner" do
      user = insert(:user)
      notification = insert(:notification, user: user)

      conn =
        conn(:patch, "/notifications/#{notification.id}/read")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 200
    end
  end
```

Update existing tests in this file that hit these routes to add `|> auth(user)` with the owning user.

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/notifications_controller_test.exs`
Expected: FAIL

- [ ] **Step 3: Add auth + ownership to the controller**

In `apps/api/lib/api/controllers/notifications_controller.ex`, add aliases:

```elixir
  alias Api.Plugs.Auth
  alias Api.Auth.Guard
```

Wrap `index/2`, `unread_count/2`, `create/2`, `mark_all_as_read/2` (all keyed by path `user_id`) with auth + `Guard.require_owner(conn, String.to_integer(user_id))`. Example for `index/2`:

```elixir
  def index(conn, user_id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         conn <- Guard.require_owner(conn, String.to_integer(user_id)),
         false <- conn.halted do
      notifications = Notifications.list_notifications(user_id)

      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{notifications: Enum.map(notifications, &notification_json/1)}))
    else
      true -> conn
      %Plug.Conn{halted: true} = halted_conn -> halted_conn
    end
  end
```

Apply the same wrapper to `unread_count/2`, `create/2`, `mark_all_as_read/2` (each uses `String.to_integer(user_id)` for ownership). In `create/2`, set `user_id` from the path (already does) — no change to the attrs logic beyond the guard.

For `mark_as_read/2` and `delete/2` (keyed by notification `id`), load the notification first:

```elixir
  def mark_as_read(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, notification} <- Notifications.get_notification(id),
         conn <- Guard.require_owner(conn, notification.user_id),
         false <- conn.halted do
      {:ok, notification} = Notifications.mark_as_read(id)

      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{notification: notification_json(notification)}))
    else
      true -> conn
      {:error, :not_found} -> send_not_found(conn)
      %Plug.Conn{halted: true} = halted_conn -> halted_conn
    end
  end

  def delete(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, notification} <- Notifications.get_notification(id),
         conn <- Guard.require_owner(conn, notification.user_id),
         false <- conn.halted do
      {:ok, _} = Notifications.delete_notification(id)
      send_resp(conn, 204, "")
    else
      true -> conn
      {:error, :not_found} -> send_not_found(conn)
      %Plug.Conn{halted: true} = halted_conn -> halted_conn
    end
  end

  defp send_not_found(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Jason.encode!(%{error: "not found"}))
  end
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/notifications_controller_test.exs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/lib/api/controllers/notifications_controller.ex apps/api/test/api/controllers/notifications_controller_test.exs
git commit -m "feat(api): require auth and ownership on notification write routes"
```

---

### Task 7: Ownership on ItemsController update/delete

**Files:**
- Modify: `apps/api/lib/api/controllers/items_controller.ex`
- Test: `apps/api/test/api/controllers/items_controller_test.exs`

**Interfaces:**
- Consumes: `Api.Plugs.Auth.call/2`, `Api.Auth.Guard.require_owner/2`, `Items.get_item/1`
- Behavior: `update/2` and `delete/2` require auth + `item.seller_id == current_user_id`. `create/2` already authenticates (keep). Reads stay open.

- [ ] **Step 1: Write the failing tests**

Add the `auth/2` helper to `apps/api/test/api/controllers/items_controller_test.exs`, then add:

```elixir
  describe "ownership" do
    test "PATCH /items/:id forbids non-owner" do
      owner = insert(:user)
      other = insert(:user)
      item = insert(:item, seller: owner)

      conn =
        conn(:patch, "/items/#{item.id}", %{"title" => "Hacked"})
        |> put_req_header("content-type", "application/json")
        |> auth(other)
        |> Api.Router.call([])

      assert conn.status == 403
    end

    test "DELETE /items/:id allows owner" do
      owner = insert(:user)
      item = insert(:item, seller: owner)

      conn =
        conn(:delete, "/items/#{item.id}")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 204
    end

    test "PATCH /items/:id requires auth" do
      item = insert(:item)

      conn =
        conn(:patch, "/items/#{item.id}", %{"title" => "X"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end
  end
```

The existing `PATCH /items/:id` and `DELETE /items/:id` tests (lines ~89-124) currently call without auth and expect 200/204/404. Update them: add `|> auth(owner)` where `owner` owns the item (use `insert(:item, seller: owner)`), and for the 404 tests add auth with any user.

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/items_controller_test.exs`
Expected: FAIL

- [ ] **Step 3: Add auth + ownership**

In `apps/api/lib/api/controllers/items_controller.ex`, add aliases near the top:

```elixir
  alias Api.Plugs.Auth
  alias Api.Auth.Guard
```

Rewrite `update/2`:

```elixir
  def update(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, item} <- Items.get_item(id),
         conn <- Guard.require_owner(conn, item.seller_id),
         false <- conn.halted do
      case Items.update_item(id, conn.body_params) do
        {:ok, item} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(200, Jason.encode!(item_json(item)))

        {:error, changeset} ->
          errors = format_changeset_errors(changeset)

          conn
          |> put_resp_content_type("application/json")
          |> send_resp(422, Jason.encode!(%{errors: errors}))
      end
    else
      true -> conn
      {:error, :not_found} -> item_not_found(conn)
      %Plug.Conn{halted: true} = halted_conn -> halted_conn
    end
  end
```

Rewrite `delete/2`:

```elixir
  def delete(conn, id) do
    conn = Auth.call(conn, [])

    with false <- conn.halted,
         {:ok, item} <- Items.get_item(id),
         conn <- Guard.require_owner(conn, item.seller_id),
         false <- conn.halted do
      {:ok, _item} = Items.delete_item(id)
      send_resp(conn, 204, "")
    else
      true -> conn
      {:error, :not_found} -> item_not_found(conn)
      %Plug.Conn{halted: true} = halted_conn -> halted_conn
    end
  end

  defp item_not_found(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Jason.encode!(%{error: "item_not_found"}))
  end
```

> **Note:** `Items.get_item/1` returns `{:ok, item}` where `item` has `seller_id`. Confirm the item struct is not preloaded-only — `seller_id` is a column, always present.

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker compose exec -e MIX_ENV=test api mix test test/api/controllers/items_controller_test.exs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/lib/api/controllers/items_controller.ex apps/api/test/api/controllers/items_controller_test.exs
git commit -m "feat(api): enforce seller ownership on item update and delete"
```

---

### Task 8: Update smoke test + full suite green

**Files:**
- Modify: `apps/api/test/api/smoke_test.exs`
- Test: entire API suite

**Interfaces:**
- Consumes: everything from Tasks 1-7.

- [ ] **Step 1: Update the smoke test for the new auth contract**

In `apps/api/test/api/smoke_test.exs`, the flow already generates a token via `Api.Auth.generate_internal_token(user)` and creates an item with it. Now that children/notifications routes require auth, add the auth header to those steps:

- Step 3 (`POST /children`): add `|> put_req_header("authorization", "Bearer #{token}")` and drop `"user_id" => user.id` from the body (the controller uses the token's user id now).
- Step 4 (`POST /children/:id/measurements`): add the auth header.
- Step 8 (`GET /users/:user_id/notifications`): add the auth header (must be `user.id` == token user).
- Step 11 (`PATCH /notifications/:id/read`): add the auth header.
- Step 12 (`DELETE /items/:id`): add the auth header.

Concretely, Step 3 becomes:

```elixir
      conn =
        conn(:post, "/children", %{
          "name" => "Sofia",
          "birth_date" => "2023-01-15",
          "birth_weight_g" => 3200,
          "birth_height_cm" => 50
        })
        |> put_req_header("content-type", "application/json")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])
```

Apply the analogous `put_req_header("authorization", "Bearer #{token}")` addition to steps 4, 8, 11, 12.

- [ ] **Step 2: Run the smoke test**

Run: `docker compose exec -e MIX_ENV=test api mix test --only smoke`
Expected: PASS

- [ ] **Step 3: Run the entire API suite**

Run: `docker compose exec -e MIX_ENV=test api mix test`
Expected: PASS — 0 failures. If any controller test that touches a now-protected route still fails, add the auth header / correct owner to that test.

- [ ] **Step 4: Commit**

```bash
git add apps/api/test/api/smoke_test.exs
git commit -m "test(api): update smoke test for authenticated write routes"
```

---

# Phase 2 — Web (SvelteKit)

### Task 9: Env vars + Google OAuth setup doc

**Files:**
- Modify: `apps/web/.env`
- Modify: `.env` (root)
- Create: `docs/setup/google-oauth.md`

**Interfaces:**
- Produces: `PUBLIC_GOOGLE_CLIENT_ID` (web), `GOOGLE_CLIENT_ID` + `INTERNAL_JWT_SECRET` (api). No test.

- [ ] **Step 1: Add env vars**

In `apps/web/.env`, add (leave the value as the placeholder for the user to fill):

```
PUBLIC_GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

In the root `.env`, ensure these exist (the API validates the Google token `aud` against `GOOGLE_CLIENT_ID`, and must match the web value):

```
GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID.apps.googleusercontent.com
INTERNAL_JWT_SECRET=REPLACE_WITH_STRONG_SECRET_32_CHARS_MIN
```

- [ ] **Step 2: Write the setup doc**

Create `docs/setup/google-oauth.md`:

```markdown
# Google OAuth Setup

O login usa Google Identity Services (GSI) com ID token. Não precisa de Client Secret.

## Passos

1. Acesse [Google Cloud Console](https://console.cloud.google.com) → crie um projeto (ou selecione um existente).
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - Preencha App name, User support email, Developer contact email
   - Salve (pode deixar em "Testing")
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (dev)
     - domínio de produção quando houver
   - Não é necessário Authorized redirect URI (o fluxo GSI usa ID token, não authorization code)
4. Copie o **Client ID** gerado.
5. Cole o mesmo valor em:
   - `apps/web/.env` → `PUBLIC_GOOGLE_CLIENT_ID`
   - `.env` (raiz) → `GOOGLE_CLIENT_ID`
6. Gere um `INTERNAL_JWT_SECRET` forte (32+ chars) no `.env` raiz.
7. Reinicie os containers: `yarn dev:down && yarn dev`.

## Validação

- Abra `http://localhost:5173/login`
- O botão do Google deve renderizar
- Ao logar, você deve cair em `/catalog` (ou no formulário de registro PF/PJ na primeira vez)
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/.env .env docs/setup/google-oauth.md
git commit -m "docs(auth): add Google OAuth env vars and setup guide"
```

---

### Task 10: Login server actions

**Files:**
- Create: `apps/web/src/routes/login/+page.server.ts`
- Test: `apps/web/src/routes/login/page.server.test.ts`

**Interfaces:**
- Produces SvelteKit actions `login`, `register`, `logout` on `/login`.
  - `login`: form field `credential` → POST `/auth/google {token}` → set cookies → `{ session }` or `fail(401)`
  - `register`: form fields `type`, `document` → PATCH `/auth/me` with cookie token → `{ session }`
  - `logout`: delete cookies → `redirect(303, '/login')`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/routes/login/page.server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';

const API = 'http://localhost:4000';

function makeCookies() {
  const store = new Map<string, string>();
  return {
    set: vi.fn((k: string, v: string) => store.set(k, v)),
    get: vi.fn((k: string) => store.get(k)),
    delete: vi.fn((k: string) => store.delete(k)),
    _store: store,
  };
}

describe('login action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('PUBLIC_API_URL', API);
  });

  it('sets auth cookies and returns session on success', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 'access-tok',
          refresh_token: 'refresh-tok',
          user: { id: '1', email: 'a@b.com', name: 'Ana', avatar_url: '', type: 'pf', is_seller: false },
        }),
        { status: 200 },
      ),
    );
    const cookies = makeCookies();
    const request = new Request('http://x', {
      method: 'POST',
      body: new URLSearchParams({ credential: 'google-jwt' }),
    });

    const result = await actions.login({ request, cookies, fetch } as never);

    expect(fetch).toHaveBeenCalledWith(
      `${API}/auth/google`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(cookies.set).toHaveBeenCalledWith('babyclothes_token', 'access-tok', expect.any(Object));
    expect(cookies.set).toHaveBeenCalledWith('babyclothes_refresh', 'refresh-tok', expect.any(Object));
    expect((result as { session: { userId: string } }).session.userId).toBe('1');
  });

  it('returns fail(401) when the API rejects', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 401 }));
    const cookies = makeCookies();
    const request = new Request('http://x', {
      method: 'POST',
      body: new URLSearchParams({ credential: 'bad' }),
    });

    const result = await actions.login({ request, cookies, fetch } as never);
    expect((result as { status: number }).status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && yarn vitest run src/routes/login/page.server.test.ts`
Expected: FAIL — `./+page.server` has no `actions` export.

- [ ] **Step 3: Implement the server actions**

Create `apps/web/src/routes/login/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { PUBLIC_API_URL } from '$lib/env';
import type { Actions } from './$types';

const ACCESS_COOKIE = 'babyclothes_token';
const REFRESH_COOKIE = 'babyclothes_refresh';

type ApiUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  type: string | null;
  cpf?: string;
  cnpj?: string;
  is_seller: boolean;
};

function cookieOpts(maxAge: number) {
  return { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' as const, maxAge };
}

function setAuthCookies(cookies: App.Cookies, accessToken: string, refreshToken: string) {
  cookies.set(ACCESS_COOKIE, accessToken, cookieOpts(60 * 60)); // 1h
  cookies.set(REFRESH_COOKIE, refreshToken, cookieOpts(60 * 60 * 24 * 30)); // 30d
}

function mapUser(user: ApiUser) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    type: user.type as 'pf' | 'pj' | null,
    cpf: user.cpf,
    cnpj: user.cnpj,
    isSeller: user.is_seller,
  };
}

export const actions: Actions = {
  login: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const credential = form.get('credential');

    if (typeof credential !== 'string' || !credential) {
      return fail(400, { error: 'missing_credential' });
    }

    const res = await fetch(`${PUBLIC_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: credential }),
    });

    if (!res.ok) {
      return fail(401, { error: 'login_failed' });
    }

    const { token, refresh_token, user } = (await res.json()) as {
      token: string;
      refresh_token: string;
      user: ApiUser;
    };

    setAuthCookies(cookies, token, refresh_token);
    return { session: mapUser(user) };
  },

  register: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const type = form.get('type');
    const document = form.get('document');
    const token = cookies.get(ACCESS_COOKIE);

    if (!token) return fail(401, { error: 'not_authenticated' });
    if (type !== 'pf' && type !== 'pj') return fail(400, { error: 'invalid_type' });

    const body =
      type === 'pf'
        ? { type, cpf: String(document ?? '') }
        : { type, cnpj: String(document ?? '') };

    const res = await fetch(`${PUBLIC_API_URL}/auth/me`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) return fail(422, { error: 'update_failed' });

    const { user } = (await res.json()) as { user: ApiUser };
    return { session: mapUser(user) };
  },

  logout: async ({ cookies }) => {
    cookies.delete(ACCESS_COOKIE, { path: '/' });
    cookies.delete(REFRESH_COOKIE, { path: '/' });
    throw redirect(303, '/login');
  },
};
```

> **Note on `App.Cookies`:** SvelteKit's cookie type is `import('@sveltejs/kit').Cookies`. If `App.Cookies` is not a known type, replace the `setAuthCookies` signature type with `import('@sveltejs/kit').Cookies`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && yarn vitest run src/routes/login/page.server.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/login/+page.server.ts apps/web/src/routes/login/page.server.test.ts
git commit -m "feat(web): add login/register/logout server actions with httpOnly cookies"
```

---

### Task 11: Wire login page to server actions

**Files:**
- Modify: `apps/web/src/routes/login/+page.svelte`

**Interfaces:**
- Consumes: `actions.login`, `actions.register` (Task 10). Uses `use:enhance` and a hidden `credential` input.

- [ ] **Step 1: Update the login page**

Replace the `<script>` block of `apps/web/src/routes/login/+page.svelte` with a version that submits the Google credential through the `login` action via a hidden form, and drives `step` from the action result:

```svelte
<script lang="ts">
  import { goto } from '$app/navigation'
  import { enhance } from '$app/forms'
  import AuthScreen from '$lib/presentation/components/AuthScreen.svelte'
  import RegistrationForm from '$lib/presentation/components/RegistrationForm.svelte'

  type Step = 'login' | 'register' | 'redirecting'

  let step = $state<Step>('login')
  let loading = $state(false)
  let error = $state('')

  let loginForm = $state<HTMLFormElement | undefined>(undefined)
  let credentialInput = $state<HTMLInputElement | undefined>(undefined)
  let registerForm = $state<HTMLFormElement | undefined>(undefined)
  let registerType = $state<'pf' | 'pj'>('pf')
  let registerDocument = $state('')

  // Called by Google GSI (via window bridge). Fills the hidden field and submits the login action.
  function handleGoogleCredential(response: { credential: string }) {
    if (credentialInput && loginForm) {
      credentialInput.value = response.credential
      loginForm.requestSubmit()
    }
  }

  if (typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).handleGoogleCredential = handleGoogleCredential
  }

  function onLoginResult(session: { type: string | null } | undefined) {
    loading = false
    if (!session) {
      error = 'login_failed'
      return
    }
    if (!session.type) {
      step = 'register'
    } else {
      step = 'redirecting'
      goto('/catalog')
    }
  }

  function handleRegistrationComplete(data: { type: 'pf' | 'pj'; cpf?: string; cnpj?: string }) {
    registerType = data.type
    registerDocument = data.cpf ?? data.cnpj ?? ''
    registerForm?.requestSubmit()
  }
</script>

<svelte:head>
  <title>Login | BabyClothes</title>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<div class="login-page" class:login-page--register={step === 'register'}>
  <!-- Hidden login form driven by the Google credential -->
  <form
    method="POST"
    action="?/login"
    bind:this={loginForm}
    use:enhance={() => {
      loading = true
      error = ''
      return async ({ result }) => {
        if (result.type === 'success') {
          onLoginResult(result.data?.session as { type: string | null } | undefined)
        } else {
          loading = false
          error = 'login_failed'
        }
      }
    }}
    hidden
  >
    <input type="hidden" name="credential" bind:this={credentialInput} />
  </form>

  <!-- Hidden register form -->
  <form
    method="POST"
    action="?/register"
    bind:this={registerForm}
    use:enhance={() => {
      loading = true
      error = ''
      return async ({ result }) => {
        loading = false
        if (result.type === 'success') {
          step = 'redirecting'
          goto('/catalog')
        } else {
          error = 'update_failed'
        }
      }
    }}
    hidden
  >
    <input type="hidden" name="type" value={registerType} />
    <input type="hidden" name="document" value={registerDocument} />
  </form>

  {#if step === 'login'}
    <AuthScreen onGoogleLogin={() => {}} onDevLogin={() => {}} {loading} />
  {:else if step === 'register'}
    <RegistrationForm onComplete={handleRegistrationComplete} {loading} />
  {:else if step === 'redirecting'}
    <div class="login-page__redirecting">
      <span class="login-page__spinner"></span>
      <p class="login-page__redirect-text">{loading ? 'Redirecting...' : ''}</p>
    </div>
  {/if}

  {#if error}
    <p class="login-page__error">{error}</p>
  {/if}
</div>
```

Keep the existing `<style>` block unchanged (it stays below the markup).

- [ ] **Step 2: Type-check**

Run: `cd apps/web && yarn check`
Expected: no new type errors in `login/+page.svelte`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/login/+page.svelte
git commit -m "feat(web): drive login/register through server actions via use:enhance"
```

---

### Task 12: hooks.server.ts refresh flow

**Files:**
- Modify: `apps/web/src/hooks.server.ts`
- Test: `apps/web/src/hooks.server.test.ts`

**Interfaces:**
- Consumes: `/auth/session`, `/auth/refresh` (Tasks 1-2), cookies `babyclothes_token` / `babyclothes_refresh`.
- Behavior: valid access → session. Expired access + valid refresh → new cookies + session. Both invalid → delete cookies + redirect. Preserves mock mode.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/hooks.server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const userPayload = {
  user: { id: '1', email: 'a@b.com', name: 'Ana', avatar_url: '', type: 'pf', is_seller: false },
};

function makeEvent(cookieStore: Record<string, string>, pathname = '/catalog') {
  const cookies = {
    get: (k: string) => cookieStore[k],
    set: vi.fn((k: string, v: string) => (cookieStore[k] = v)),
    delete: vi.fn((k: string) => delete cookieStore[k]),
  };
  return {
    cookies,
    url: new URL(`http://localhost${pathname}`),
    locals: {} as Record<string, unknown>,
  };
}

describe('handle', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PUBLIC_MOCK_DATA', 'false');
    vi.stubEnv('PUBLIC_API_URL', 'http://localhost:4000');
  });

  it('populates session when access token is valid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(userPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' });
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);
    expect((event.locals as { session?: { userId: string } }).session?.userId).toBe('1');
  });

  it('refreshes when access is expired but refresh is valid', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 })) // /auth/session
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'new-a', refresh_token: 'new-r', ...userPayload }), { status: 200 }),
      ); // /auth/refresh
    vi.stubGlobal('fetch', fetch);
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'expired', babyclothes_refresh: 'valid' });
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);

    expect(event.cookies.set).toHaveBeenCalledWith('babyclothes_token', 'new-a', expect.any(Object));
    expect((event.locals as { session?: { userId: string } }).session?.userId).toBe('1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && yarn vitest run src/hooks.server.test.ts`
Expected: FAIL — current hook has no refresh branch (second test fails).

- [ ] **Step 3: Rewrite the hook**

Replace `apps/web/src/hooks.server.ts`:

```ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

const ACCESS_COOKIE = 'babyclothes_token';
const REFRESH_COOKIE = 'babyclothes_refresh';
const publicRoutes = ['/login'];

const mockSession = {
  userId: 'mock-user-1',
  email: 'mock@babyclothes.app',
  name: 'Dev User',
  avatarUrl: '',
  type: 'pf' as const,
  cpf: undefined,
  cnpj: undefined,
  isSeller: true,
};

type ApiUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  type: string | null;
  cpf?: string;
  cnpj?: string;
  is_seller: boolean;
};

function mapUser(user: ApiUser) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    type: user.type as 'pf' | 'pj' | null,
    cpf: user.cpf,
    cnpj: user.cnpj,
    isSeller: user.is_seller,
  };
}

function cookieOpts(maxAge: number) {
  return { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' as const, maxAge };
}

export const handle: Handle = async ({ event, resolve }) => {
  if (import.meta.env.PUBLIC_MOCK_DATA === 'true') {
    event.locals.session = mockSession;
    return resolve(event);
  }

  const apiUrl = import.meta.env.PUBLIC_API_URL ?? '';
  const accessToken = event.cookies.get(ACCESS_COOKIE);

  event.locals.session = undefined;

  if (accessToken) {
    try {
      const res = await fetch(`${apiUrl}/auth/session`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const { user } = (await res.json()) as { user: ApiUser };
        event.locals.session = mapUser(user);
      } else {
        await tryRefresh(event, apiUrl);
      }
    } catch (err) {
      console.error('Auth session validation failed:', err);
    }
  } else {
    await tryRefresh(event, apiUrl);
  }

  const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));
  if (!event.locals.session && !isPublicRoute) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};

async function tryRefresh(event: Parameters<Handle>[0]['event'], apiUrl: string) {
  const refreshToken = event.cookies.get(REFRESH_COOKIE);
  if (!refreshToken) {
    event.cookies.delete(ACCESS_COOKIE, { path: '/' });
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const { token, refresh_token, user } = (await res.json()) as {
        token: string;
        refresh_token: string;
        user: ApiUser;
      };
      event.cookies.set(ACCESS_COOKIE, token, cookieOpts(60 * 60));
      event.cookies.set(REFRESH_COOKIE, refresh_token, cookieOpts(60 * 60 * 24 * 30));
      event.locals.session = mapUser(user);
    } else {
      event.cookies.delete(ACCESS_COOKIE, { path: '/' });
      event.cookies.delete(REFRESH_COOKIE, { path: '/' });
    }
  } catch (err) {
    console.error('Auth refresh failed:', err);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && yarn vitest run src/hooks.server.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/hooks.server.ts apps/web/src/hooks.server.test.ts
git commit -m "feat(web): add automatic token refresh in SSR auth hook"
```

---

### Task 13: Authenticated API proxy

**Files:**
- Create: `apps/web/src/routes/api/[...path]/+server.ts`
- Test: `apps/web/src/routes/api/[...path]/server.test.ts`

**Interfaces:**
- Produces a same-origin proxy: `/api/<path>` forwards to `${PUBLIC_API_URL}/<path>`, injecting `Authorization: Bearer <access cookie>` and preserving method, query, and body.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/routes/api/[...path]/server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './+server';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubEnv('PUBLIC_API_URL', 'http://localhost:4000');
});

it('forwards GET with the Bearer token from the cookie', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
  const cookies = { get: vi.fn().mockReturnValue('tok-123') };
  const request = new Request('http://localhost/api/children?x=1', { method: 'GET' });

  await GET({ params: { path: 'children' }, url: new URL('http://localhost/api/children?x=1'), request, cookies, fetch } as never);

  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:4000/children?x=1',
    expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({ authorization: 'Bearer tok-123' }),
    }),
  );
});

it('forwards POST body', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
  const cookies = { get: vi.fn().mockReturnValue('tok') };
  const request = new Request('http://localhost/api/children', {
    method: 'POST',
    body: JSON.stringify({ name: 'X' }),
  });

  await POST({ params: { path: 'children' }, url: new URL('http://localhost/api/children'), request, cookies, fetch } as never);

  const call = fetch.mock.calls[0][1] as RequestInit;
  expect(call.method).toBe('POST');
  expect(call.body).toBe(JSON.stringify({ name: 'X' }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && yarn vitest run src/routes/api/[...path]/server.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the proxy**

Create `apps/web/src/routes/api/[...path]/+server.ts`:

```ts
import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$lib/env';

const ACCESS_COOKIE = 'babyclothes_token';

const proxy: RequestHandler = async ({ params, url, request, cookies, fetch }) => {
  const token = cookies.get(ACCESS_COOKIE);
  const target = `${PUBLIC_API_URL}/${params.path}${url.search}`;

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const method = request.method;
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();

  const res = await fetch(target, { method, headers, body });

  return new Response(res.body, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
};

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && yarn vitest run src/routes/api/[...path]/server.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/api apps/web/src/routes/api/[...path]/server.test.ts
git commit -m "feat(web): add authenticated same-origin API proxy"
```

---

### Task 14: Point client repos at the proxy, drop localStorage token

**Files:**
- Modify: `apps/web/src/lib/infrastructure/http/HttpAuthRepository.ts`
- Modify: `apps/web/src/lib/infrastructure/http/HttpChildRepository.ts`
- Modify: `apps/web/src/lib/infrastructure/http/HttpCatalogRepository.ts`
- Modify: `apps/web/src/lib/infrastructure/http/HttpItemRepository.ts`
- Modify: `apps/web/src/lib/infrastructure/http/HttpNotificationRepository.ts`
- Modify: `apps/web/src/lib/infrastructure/sse/SseNotificationRepository.ts`
- Modify: `apps/web/src/lib/infrastructure/sse/SseChatRepository.ts`

**Interfaces:**
- Consumes: the `/api` proxy (Task 13) and the layout `session` context for `userId`.
- Behavior: client repos call `/api/<path>` (same origin) with no Authorization header; the proxy injects it. `getAuthToken`/`getUserId` localStorage helpers removed.

- [ ] **Step 1: Repoint each HTTP repo base URL to the proxy**

In each of `HttpChildRepository.ts`, `HttpCatalogRepository.ts`, `HttpItemRepository.ts`, `HttpNotificationRepository.ts`:

- Change the constructor `this.baseUrl = PUBLIC_API_URL;` to `this.baseUrl = '/api';`
- Remove `import { getAuthToken, getUserId } from './HttpAuthRepository';`
- Remove the `authHeaders()` method's token logic — replace with plain JSON headers:

```ts
  private authHeaders(): Record<string, string> {
    return { 'Content-Type': 'application/json' };
  }
```

- For any use of `getUserId()` (e.g. `HttpChildRepository.findAll`), replace with a `userId` passed into the method or read from a `session` argument. Minimal change: add a `userId: string` parameter to `findAll(userId: string)` and update its caller. If the caller is a `+page.server.ts` load, prefer fetching there instead (see Step 3).

- [ ] **Step 2: Simplify HttpAuthRepository**

In `apps/web/src/lib/infrastructure/http/HttpAuthRepository.ts`:
- Remove `localStorage.setItem`/`getItem`/`removeItem` calls from `loginWithGoogle`, `getSession`, `updateProfile`, `logout`.
- Remove the exported `getAuthToken` and `getUserId` functions.
- Point requests at `/api/...` (same origin) so the cookie is used, OR delete the methods now superseded by the server actions. Minimal safe change: keep the class but have methods target `/api/auth/...` and rely on the proxy/cookie.

Since login now flows through server actions (Task 10/11), the repository's `loginWithGoogle`/`updateProfile` are no longer called by the login page. Delete `HttpAuthRepository.ts` if nothing imports it:

Run: `cd apps/web && grep -rn "HttpAuthRepository" src`
- If only the (now-updated) repos and its own test reference the deleted helpers, remove those imports.
- If truly unused, `git rm apps/web/src/lib/infrastructure/http/HttpAuthRepository.ts` and its test files.

- [ ] **Step 3: Move authenticated reads to server load where present**

For pages that previously called `HttpChildRepository.findAll()` client-side using `getUserId()` (e.g. `src/routes/child/+page.svelte`), add a `+page.server.ts` that fetches via the API using the cookie:

```ts
import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$lib/env';

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
  if (!locals.session) return { children: [] };
  const token = cookies.get('babyclothes_token');
  const res = await fetch(`${PUBLIC_API_URL}/users/${locals.session.userId}/children`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const data = res.ok ? await res.json() : { children: [] };
  return { children: data.children ?? [] };
};
```

Wire the page to consume `data.children` instead of calling the repo in `onMount`. Apply the same pattern only where a page currently relies on `getUserId()`; leave other pages untouched.

- [ ] **Step 4: Update SSE repos**

`SseNotificationRepository.ts` and `SseChatRepository.ts` use `getAuthToken()` and `EventSource`. `EventSource` cannot set headers. Point them at the proxy path with the cookie automatically sent by the browser (same-origin):

- Change their base URL to `/api/...` (same origin — the browser attaches the httpOnly cookie automatically to `EventSource` requests).
- Remove `getAuthToken` usage and any `?token=` query param.
- The proxy (Task 13) does not stream SSE; add a note/TODO: SSE streaming through the proxy is out of scope for this task. If the app currently opens these connections on load, guard them behind a feature flag or leave them pointing at the direct API with the token passed as a query param **only if** the API supports it. Minimal action: remove the `getAuthToken` import to unbreak the build, and leave a `// TODO: authenticated SSE via cookie` comment.

- [ ] **Step 5: Type-check and run the web test suite**

Run: `cd apps/web && yarn check && yarn vitest run`
Expected: no type errors; all tests pass. Fix any remaining references to the removed `getAuthToken`/`getUserId`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src
git commit -m "refactor(web): route client API calls through authenticated proxy, drop localStorage token"
```

---

## Verification (end of plan)

- [ ] **Full API suite green**

Run: `docker compose exec -e MIX_ENV=test api mix test`
Expected: 0 failures.

- [ ] **Web suite + type check green**

Run: `cd apps/web && yarn check && yarn vitest run`
Expected: 0 failures.

- [ ] **Manual end-to-end (requires Google Client ID from Task 9)**

1. Fill `PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` with a real Client ID.
2. `yarn dev:down && yarn dev`
3. Visit `http://localhost:5173/login`, sign in with Google.
4. First-time user → registration form (PF/PJ) → `/catalog`.
5. Reload `/catalog` → stays authenticated (cookie + SSR hook).
6. Confirm a protected write (create a child) succeeds, and that it is owned by the logged-in user.
```
