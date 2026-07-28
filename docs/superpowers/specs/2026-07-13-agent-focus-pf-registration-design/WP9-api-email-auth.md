## WP9 — API: registro e login por e-mail/senha + campos de perfil

Local: `apps/api` (Elixir). Comandos sempre via Docker: `yarn test:api`, `yarn api:migrate`, `yarn api:credo`. Regras do repo: lógica de negócio no contexto (`Api.Users`), controller só delega, `{:ok, _}/{:error, _}`, `@moduledoc`/`@doc`/`@spec` em módulos e funções públicas, credo limpo, migrations aplicadas são imutáveis (criar novas).

Documentos com checksum válido para testes: CPFs `52998224725`, `11144477735`, `76523910083`; inválido `12345678900`.

### 9.1 Dependência — editar `apps/api/mix.exs`

Acrescentar em `deps`:

```elixir
{:bcrypt_elixir, "~> 3.0"},
```

Rodar `mix deps.get` dentro do container da api. (`bcrypt_elixir` compila NIF em C — se a imagem Docker não tiver toolchain, adicionar `build-base`/`gcc make` ao Dockerfile da api.)

### 9.2 Migration nova `apps/api/priv/repo/migrations/20260713000001_add_email_auth_and_profile_to_users.exs`

```elixir
defmodule Api.Repo.Migrations.AddEmailAuthAndProfileToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :password_hash, :string
      add :phone, :string
      add :nationality, :string
      add :cep, :string
      add :address_line, :string
      add :city, :string
      add :state, :string
    end

    execute(
      "ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL",
      "ALTER TABLE users ALTER COLUMN google_id SET NOT NULL"
    )
  end
end
```

(Colunas nullable de propósito: usuários Google existentes ainda não têm perfil. `google_id` vira nullable para contas de e-mail/senha existirem; o unique index continua válido — Postgres ignora NULLs em unique.)

Run: `yarn api:migrate` → `AddEmailAuthAndProfileToUsers: migrated`.

### 9.3 Schema — editar `apps/api/lib/api/users/user.ex`

1. Campos novos no `schema "users"`:

```elixir
field :password, :string, virtual: true, redact: true
field :password_hash, :string, redact: true
field :phone, :string
field :nationality, :string
field :cep, :string
field :address_line, :string
field :city, :string
field :state, :string
```

2. Atributos de módulo:

```elixir
@ufs ~w(AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO)
@profile_fields [:phone, :nationality, :cep, :address_line, :city, :state]
```

3. Changeset novo (signup e-mail/senha, conta já registrada como PF):

```elixir
@doc "Changeset for e-mail/password signup: account + password + PF document + full profile."
def signup_changeset(user, attrs) do
  user
  |> cast(attrs, [:email, :name, :password, :cpf] ++ @profile_fields)
  |> validate_required([:email, :name, :password, :cpf] ++ @profile_fields)
  |> validate_format(:email, ~r/@/)
  |> validate_length(:password, min: 8, max: 72)
  |> put_change(:type, "pf")
  |> validate_change(:cpf, &cpf_checksum/2)
  |> validate_profile()
  |> hash_password()
  |> unique_constraint(:email)
  |> unique_constraint(:cpf)
end

defp validate_profile(changeset) do
  changeset
  |> validate_format(:phone, ~r/^\d{10,11}$/, message: "must have 10 or 11 digits")
  |> validate_format(:cep, ~r/^\d{8}$/, message: "must have 8 digits")
  |> validate_inclusion(:state, @ufs)
  |> validate_length(:name, max: 120)
  |> validate_length(:nationality, max: 60)
  |> validate_length(:address_line, max: 160)
  |> validate_length(:city, max: 80)
end

defp hash_password(%Ecto.Changeset{valid?: true} = changeset) do
  case get_change(changeset, :password) do
    nil ->
      changeset

    password ->
      changeset
      |> put_change(:password_hash, Bcrypt.hash_pwd_salt(password))
      |> delete_change(:password)
  end
end

defp hash_password(changeset), do: changeset
```

4. `registration_changeset/2` (fluxo Google, uma vez) passa a **aceitar** o perfil sem exigi-lo — trocar o `cast` por `cast(attrs, [:type, :cpf, :cnpj] ++ @profile_fields)` e encadear `|> validate_profile()` depois de `validate_document_for_type()`. (`validate_format`/`validate_inclusion`/`validate_length` só rodam quando o campo veio nos attrs — nada vira obrigatório no fluxo Google, e o `RegisterScreen` do modo full continua funcionando sem mudanças.)

5. `changeset/2` (perfil Google) fica **intacto** — continua exigindo `google_id`.

### 9.4 Contexto — editar `apps/api/lib/api/users/users.ex`

```elixir
@doc "Creates a fully-registered PF account from e-mail/password signup attrs."
@spec signup(map()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
def signup(attrs) do
  %User{}
  |> User.signup_changeset(attrs)
  |> Repo.insert()
end

@doc "Authenticates by e-mail and password. Constant-time on unknown e-mail."
@spec authenticate(String.t(), String.t()) :: {:ok, User.t()} | {:error, :invalid_credentials}
def authenticate(email, password) when is_binary(email) and is_binary(password) do
  user = Repo.get_by(User, email: email)

  cond do
    user && user.password_hash && Bcrypt.verify_pass(password, user.password_hash) ->
      {:ok, user}

    user && user.password_hash ->
      {:error, :invalid_credentials}

    true ->
      Bcrypt.no_user_verify()
      {:error, :invalid_credentials}
  end
end
```

(Usuário só-Google, sem `password_hash`, cai no ramo `no_user_verify` → `invalid_credentials`, sem vazar que a conta existe.)

### 9.5 Rotas — editar `apps/api/lib/api/router.ex`

Junto das rotas `/auth` existentes:

```elixir
post "/auth/signup" do
  Api.Controllers.AuthController.signup(conn)
end

post "/auth/login" do
  Api.Controllers.AuthController.login(conn)
end
```

### 9.6 Controller — editar `apps/api/lib/api/controllers/auth_controller.ex`

```elixir
@doc """
POST /auth/signup
Creates a fully-registered PF account with e-mail/password and returns tokens.
"""
def signup(conn) do
  case Users.signup(conn.body_params) do
    {:ok, user} ->
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(201, Jason.encode!(%{
        token: Auth.generate_access_token(user),
        refresh_token: Auth.generate_refresh_token(user),
        user: user_json(user)
      }))

    {:error, %Ecto.Changeset{} = changeset} ->
      register_error(conn, 422, %{error: "validation_failed", details: changeset_errors(changeset)})
  end
end

@doc """
POST /auth/login
Authenticates by e-mail/password and returns tokens.
"""
def login(conn) do
  with %{"email" => email, "password" => password}
       when is_binary(email) and is_binary(password) <- conn.body_params,
       {:ok, user} <- Users.authenticate(email, password) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{
      token: Auth.generate_access_token(user),
      refresh_token: Auth.generate_refresh_token(user),
      user: user_json(user)
    }))
  else
    {:error, :invalid_credentials} -> register_error(conn, 401, %{error: "invalid_credentials"})
    _ -> register_error(conn, 400, %{error: "missing_credentials"})
  end
end
```

E estender `user_json/1` com os campos de perfil (**nunca** `password_hash`):

```elixir
defp user_json(user) do
  %{
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    type: user.type,
    cpf: user.cpf,
    cnpj: user.cnpj,
    is_seller: user.is_seller,
    phone: user.phone,
    nationality: user.nationality,
    cep: user.cep,
    address_line: user.address_line,
    city: user.city,
    state: user.state
  }
end
```

`GET /auth/session` monta o JSON do usuário manualmente hoje — trocar pelo `user_json/1` para eliminar a duplicação e já expor o perfil.

### 9.7 Testes

Attrs válidos de referência:

```elixir
@signup_attrs %{
  "email" => "maria@example.com",
  "name" => "Maria Clara",
  "password" => "senha-forte-123",
  "cpf" => "52998224725",
  "phone" => "11987654321",
  "nationality" => "Brasileira",
  "cep" => "01310100",
  "address_line" => "Av. Paulista, 1000, ap 12",
  "city" => "São Paulo",
  "state" => "SP"
}
```

- `test/api/users/user_test.exs`, describe `signup_changeset/2`: válido completo (`type == "pf"`, `password_hash` preenchido, `:password` ausente de `changes`); cada campo obrigatório ausente → erro naquele campo; senha 7 chars; telefone 9 dígitos; CEP 7 dígitos; `state: "XX"`; CPF `12345678900` (checksum).
- `test/api/users_test.exs`: `signup/1` ok; e-mail duplicado → `{:error, changeset}` com erro em `:email`; `authenticate/2` ok; senha errada; e-mail inexistente; usuário Google (sem `password_hash`) → `invalid_credentials` nos três últimos.
- `test/api/controllers/auth_controller_test.exs`: `POST /auth/signup` → 201 com `token`, `refresh_token` e `user` completo; 422 com `details` por campo; 422 e-mail duplicado. `POST /auth/login` → 200 com tokens; 401 senha errada; 400 body sem campos. `GET /auth/session` de usuário criado via signup → campos de perfil presentes, sem `password_hash` no JSON.

**DoD**: `yarn test:api` e `yarn api:credo` verdes; `yarn api:migrate` aplica a migration; nenhuma resposta HTTP contém `password_hash`; senha nunca aparece em log/inspect. Fora de escopo (não implementar): rate limiting, recuperação de senha, verificação de e-mail — ver `docs/superpowers/specs/2026-07-13-email-auth-profile-fields-design.md`.
