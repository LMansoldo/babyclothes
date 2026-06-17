# apps/api — Elixir REST API

## Tech Stack

- **Elixir ~> 1.17** with **OTP**
- **Plug + Bandit** (HTTP server, port 4000)
- **Ecto + Postgrex** (PostgreSQL)
- **Oban** (background jobs)
- **gRPC** (client to agents service)
- **JOSE** (JWT authentication)
- **Finch** (HTTP client)
- **ExAWS + ExAWS.S3** (S3 file storage)

## Commands

```bash
cd apps/api
mix deps.get              # Install dependencies
mix ecto.create           # Create database
mix ecto.migrate          # Run migrations
mix phx.server            # Start dev server (port 4000)
mix test                  # Run tests
mix credo                 # Lint
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

## Conventions

- Standard Phoenix-style structure (without full Phoenix dep)
- Ecto schemas for data modeling
- Context modules for business logic
- Plug pipelines for request processing
- Test with ExMachina factories

## Environment Variables

See root `.env.example` for:
- `DATABASE_URL` — PostgreSQL connection
- `SECRET_KEY_BASE` — JWT signing
- `AWS_*` — S3 credentials
- `GOOGLE_CLIENT_ID` — OAuth
