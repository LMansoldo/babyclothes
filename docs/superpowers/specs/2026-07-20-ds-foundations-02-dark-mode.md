# DS Foundations 02 — Dark mode (`[data-theme]`)

> Data: 2026-07-20 · Parte de: doc-mãe §5 e §6 · Depende de: **01** (tokens semânticos claros).

## Objetivo

Habilitar tema escuro re-declarando os **mesmos** tokens semânticos num escopo `[data-theme="dark"]`. Mecanismo único: aplicar no `<html>` = tema global (futuro toggle); aplicar numa `<section>` = **ilha escura** (onboarding). Default continua claro.

## Escopo

- **Novo** `packages/design-system/src/tokens/themes.css` com `[data-theme="dark"] { … }` re-declarando **todos** os semânticos da spec 01, e `@import` no `tokens.css`.
- **Migrar as superfícies já-escuras** (prova do conceito): `apps/web/src/routes/onboarding/+page.svelte` + `packages/design-system/src/patterns/OnboardingHero/OnboardingHero.svelte` — trocar `rgba(...)`/hex hardcoded por tokens semânticos e envolver a tela com `data-theme="dark"`.
- **Storybook**: decorator que mostra componentes em `light` vs `data-theme="dark"` lado a lado.

### Valores (tema escuro) — `[data-theme="dark"]`

| Token | Escuro |
|-------|--------|
| `--surface-base` | `#140A12` |
| `--surface-raised` | `rgba(255,255,255,.08)` |
| `--surface-sunken` | `rgba(255,255,255,.04)` |
| `--surface-inverse` | `#FFFFFF` |
| `--surface-overlay` | `rgba(0,0,0,.6)` |
| `--text-primary` | `#FFFFFF` |
| `--text-secondary` | `rgba(255,255,255,.7)` |
| `--text-tertiary` | `rgba(255,255,255,.4)` |
| `--text-inverse` | `#111111` |
| `--text-disabled` | `rgba(255,255,255,.3)` |
| `--border-subtle` | `rgba(255,255,255,.08)` |
| `--border-default` | `rgba(255,255,255,.12)` |
| `--border-strong` | `rgba(255,255,255,.2)` |
| `--brand` / `--brand-hover` / `--on-brand` | iguais ao claro (marca constante) |
| `--brand-subtle` | `rgba(255,60,172,.14)` |
| feedback `-subtle`/`-text` | versões escuras (tinta translúcida + texto claro) |

## Não-objetivos

- **Não** construir a UI do toggle no perfil (a arquitetura habilita; fica p/ spec futura).
- **Não** migrar telas claras (só as já-escuras, como prova).

## Definition of Done (TDD)

- **Teste de paridade** (`packages/design-system/src/tokens/tokens.test.ts`): lê `semantic.css` + `themes.css` e afirma que **todo** token do `:root` tem correspondente em `[data-theme="dark"]` (RED se faltar algum). Escrever o teste **antes** de completar `themes.css`.
- Onboarding renderiza via `data-theme="dark"` + tokens, **sem `rgba` hardcoded**, e **idêntico ao mock** (screenshot Playwright ~390px).
- `check` + testes verdes; Svelte MCP autofixer limpo nos `.svelte` migrados.
- Storybook light/dark funcionando.
