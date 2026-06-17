# apps/api — Elixir REST API

> **Before writing any code, read `RULES.md` at the project root.**

## Tech Stack

- **Elixir ~> 1.17** with **OTP**
- **Plug + Bandit** (HTTP server, port 4000)
- **Ecto + Postgrex** (PostgreSQL)
- **Oban** (background jobs)
- **gRPC** (client to agents service)
- **JOSE** (JWT authentication)
- **Finch** (HTTP client)
- **ExAWS + ExAWS.S3** (S3 file storage)

## Commands (Docker First)

All commands run inside Docker containers. See root `RULES.md` for full list.

```bash
yarn api:migrate     # mix ecto.migrate (inside container)
yarn api:credo       # mix credo (inside container)
yarn test:api        # mix test (inside container)
```

## Directory Structure

```
lib/
├── api/
│   ├── application.ex    # OTP Application
│   ├── router.ex         # Plug router
│   ├── endpoint.ex       # Plug endpoint
│   ├── repo.ex           # Ecto repo
│   └── ...               # Contexts, schemas, controllers
config/
├── config.exs            # Base config
├── dev.exs               # Dev config
├── test.exs              # Test config
├── prod.exs              # Prod config
└── runtime.exs           # Runtime config (env vars)
test/
├── test_helper.exs
└── support/              # Test factories (ex_machina)
```

## Dependencies

| Dep | Purpose |
|-----|---------|
| `plug` | HTTP middleware |
| `bandit` | HTTP server |
| `ecto_sql` + `postgrex` | Database |
| `oban` | Background jobs |
| `grpc` + `protobuf` | gRPC client to agents |
| `jose` | JWT auth |
| `finch` | HTTP client |
| `ex_aws` + `ex_aws_s3` | S3 storage |
| `jason` | JSON encoding |
| `credo` | Linting (dev/test) |
| `ex_machina` | Test factories |

## Architecture: DDD + Contexts

Follow Domain-Driven Design. Business logic lives in **context modules** (`lib/api/context_name/`), not in controllers or schemas.

```
lib/api/
├── accounts/          # Context: user management
│   ├── user.ex        # Ecto schema
│   ├── accounts.ex    # Context module (public API)
│   └── ...            # Value objects, changesets
├── catalog/           # Context: items/listings
│   ├── item.ex
│   └── catalog.ex
├── messaging/         # Context: chat/notifications
│   └── ...
└── growth/            # Context: AI growth prediction
    └── ...
```

### Context Rules

- Each context has one public module (e.g., `Api.Accounts`) exposing the API
- Contexts do NOT call each other's Repo queries directly — use the public API
- Controllers only delegate to contexts — no business logic in controllers
- Schemas define structure, changesets validate, contexts orchestrate

## Processes & Concurrency

- **GenServer** only for mutable state (caches, counters, connection pools) — never for trivial operations
- **Supervisors** for fault tolerance — use `let it crash` philosophy
- **Task / Task.Supervisor** for fire-and-forget async work
- **Named processes** via `Registry` when dynamic processes need lookup
- **Oban** for reliable background jobs (email, S3 cleanup, AI predictions)
- **cast** (async) when response not needed; **call** (sync) when it is

## Pattern Matching & Errors

- Prefer pattern matching over `if/else`
- Return `{:ok, value}` / `{:error, reason}` tuples
- Use `with` for chaining fallible operations
- No excessive `rescue` — prefer functional error handling

```elixir
# Good
def get_user(id) do
  case Repo.get(User, id) do
    nil -> {:error, :not_found}
    user -> {:ok, user}
  end
end

# Good — chaining with `with`
def register_user(attrs) do
  with {:ok, user} <- Accounts.create_user(attrs),
       {:ok, _token} <- Tokens.generate(user) do
    {:ok, user}
  end
end
```

## Database (Ecto)

- **Always use changesets** for validation before persisting
- **No N+1 queries** — use `preload` or explicit joins
- **Repo.transaction** for operations that must be atomic
- **Migrations are immutable** — never modify an applied migration
- **No business logic in changesets** — changesets validate, contexts orchestrate

```elixir
# Good — changeset with validation
def changeset(user, attrs) do
  user
  |> cast(attrs, [:name, :email])
  |> validate_required([:name, :email])
  |> validate_format(:email, ~r/@/)
  |> unique_constraint(:email)
end
```

## Performance

- `Stream` for large collections; `Enum` for small/medium
- `cast` (async) when response not needed; `call` when it is
- `ETS` for high-performance in-memory cache
- No blocking calls in critical processes
- Use `Repo.all` with pagination — never load unbounded result sets

## Tests

- **ExUnit** with high coverage
- **Mox** for behaviour-based mocks (no global mocks)
- **ExMachina** factories for test data
- Integration tests with real DB via `Ecto.Adapters.SQL.Sandbox`
- Test contexts (not controllers) for business logic coverage

```elixir
# Factory example
def insert_user(attrs \\ %{}) do
  :user
  |> build(attrs)
  |> Repo.insert!()
end
```

## Code Quality

- **Credo** must pass (no warnings) — run `yarn api:credo`
- **Dialyxir** typespec check passes
- `@moduledoc` on all public modules
- `@doc` on all public functions
- `@spec` on all public functions

```elixir
defmodule Api.Accounts do
  @moduledoc "Context for user account management."

  @spec get_user(integer()) :: {:ok, User.t()} | {:error, :not_found}
  def get_user(id) do
    # ...
  end
end
```

## Security

- **No sensitive data in logs** (passwords, tokens, CPF)
- **JWT via JOSE/Joken** for authentication
- **External input always validated** and sanitized (never trust client)
- **Rate limiting** on critical routes (login, register, password reset)
- **CORS** configured for web origin only
- **SQL injection prevention** — always use Ecto query syntax, never raw SQL strings

## API Documentation

- **Swagger/OpenAPI spec** updated for every new/changed endpoint
- Request/response schemas documented
- Error responses documented with status codes

## Environment Variables

See root `.env.example` for:
- `DATABASE_URL` — PostgreSQL connection
- `SECRET_KEY_BASE` — JWT signing
- `AWS_*` — S3 credentials
- `GOOGLE_CLIENT_ID` — OAuth
