# ReGrow — Landing Page

Standalone SvelteKit project for the ReGrow waitlist landing page. Isolated
from the `babyclothes` monorepo (own `package.json`, own Docker Compose stack,
own Postgres instance on port 5433).

## Local development

```bash
cp .env.example .env
docker compose up
docker compose exec app npm run prisma:migrate
```

App runs at http://localhost:5180 (`/pt` or `/en`).

See `RULES.md` for coding conventions and `docs/` (in the parent monorepo,
`docs/superpowers/specs/2026-08-03-regrow-landing-page-design.md` and
`docs/superpowers/plans/2026-08-03-regrow-landing-page.md`) for the design and
implementation plan this project was built from.
