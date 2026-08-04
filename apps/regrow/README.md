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

## Known gaps (tracked, not blocking)

### Deployment and infrastructure
- **No `.dockerignore` in `apps/regrow`**: The Dockerfile's `COPY . .` could pick up host `node_modules/.git` if present on the build machine. Should be added before multi-layer production builds.
- **`infra/*.tf` never applied**: Infrastructure-as-Code is written but not deployed. No real VPS, domain, or DNS exists yet. Remote-exec provisioner in `main.tf` has a shell-injection risk (interpolates `var.db_password` into a shell-quoted string) and hardcodes `~/.ssh/id_rsa` path — both should be hardened before any `terraform apply`.

### Content and pages
- **Footer contact email and Instagram handle are placeholders**: `contato@regrow.com.br` and `instagram.com/regrowapp` are temporary values. Replace with real values before launch (marked in `Footer.svelte:12,14` and `Footer.test.ts:23,31`).
- **App Preview section reuses screenshot**: Uses the same asset as How It Works section; no dedicated app screenshot yet.
- **OG images missing**: `og-image-pt.jpg` and `og-image-en.jpg` referenced in meta tags don't exist yet. Social share previews will 404 until added to `public/`.
- **Privacy Policy and Terms pages linked but not built**: Footer links to `/privacy` and `/terms` which don't exist yet (`Footer.svelte:10-11`).

### Component implementation notes
- **`HowItWorks.svelte` subtitle wrapping**: Two-line subtitle wraps each line in a `<span>` rather than plain text with `<br/>`. This is required for Testing Library's text matcher to work correctly (only reads direct text-node children), not a bug. See component for inline comment.
- **`AppPreview.svelte` alt text duplication**: Image `alt` text duplicates the visible caption; screen readers hear it twice. Low priority; could use a distinct alt key in a later pass.
- **`WaitlistCta` missing `disabled` prop**: The waitlist form's "submitting..." state relabels the button but doesn't structurally block double-click double-submission. Database's unique email constraint backstops this, but better UX would disable the button during submission.

### Testing
- **One Playwright e2e test skipped**: `shows a friendly error without JavaScript (SSR form fallback)` is `test.skip()`-ed. App behavior was verified via direct HTTP POST (curl), but automating it in Playwright (via `javaScriptEnabled: false` + native form-submit-via-click) never produced detectable navigation in this environment across multiple repro attempts. Worth revisiting with a different automation approach (e.g., testing via a real HTTP client instead of a browser context).
