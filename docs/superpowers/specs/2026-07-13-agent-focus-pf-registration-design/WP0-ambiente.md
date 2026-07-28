## WP0 — Ambiente

**Arquivo novo** `apps/web/.env.agent`:

```bash
PUBLIC_API_URL=http://localhost:4000
PUBLIC_MOCK_DATA=false
PUBLIC_GOOGLE_CLIENT_ID=350255803527-o0hj99i1tnmj82lsb20hokj9lhn2prsf.apps.googleusercontent.com
PUBLIC_APP_MODE=agent
```

**Editar** `apps/web/.env` — acrescentar linha:

```bash
PUBLIC_APP_MODE=full
```

**Editar** `apps/web/package.json` — script novo:

```json
"dev:agent": "dotenv -e .env.agent -- vite dev"
```

(Se `dotenv-cli` não estiver no workspace, adicionar como devDependency.)

**DoD**: `yarn workspace @babyclothes/web dev` sobe em modo full; `dev:agent` sobe em modo agent.
