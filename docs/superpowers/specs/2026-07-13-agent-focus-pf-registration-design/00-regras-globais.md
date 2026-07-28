# Spec detalhada — Modo Agente: feature flag + registro PF-only

> Data: 2026-07-13 · Destino: `docs/superpowers/specs/`
> Formato: **work packages (WP0–WP11)** autocontidos para delegação a subagentes.
> Emenda 2026-07-13: e-mail/senha na API (WP9), campos de perfil no registro (WP3 reescrito), `Select` no DS (WP10) e login por e-mail (WP11) — design em `docs/superpowers/specs/2026-07-13-email-auth-profile-fields-design.md`.
> Cada WP tem: arquivos, código completo ou diff, regras, e Definition of Done (DoD).
> Base visual: `BabyClothes Chat Mocks.dc.html` (telas 01–12). Base de código: monorepo `babyclothes`.

## Regras globais (valem para TODOS os WPs)

1. **Svelte 5 runes**: `$props()`, `$state()`, `$derived()`, `$effect()`, `$bindable()`, `Snippet`. Nunca `export let`.
2. **Sem emojis** em código, strings ou stories. Ícones somente de `lucide-svelte`.
3. **CSS**: custom properties de `@babyclothes/design-system/tokens.css`; BEM `.block__element--modifier`; `<style>` scoped no componente.
4. **Não editar** estes arquivos (somente ler): `RegisterScreen.svelte`, `LoginCard.svelte`, componentes existentes do design system, rotas de catálogo/sell.
5. **Nada é deletado.** Marketplace fica no código, oculto por flag.
6. Componentes **nunca** leem `import.meta.env` ou `PUBLIC_APP_MODE` diretamente — sempre via `flags` (WP1).
7. Todo componente novo do design system tem: `NomeDoComponente.svelte` + `index.ts` + `NomeDoComponente.stories.ts` + `NomeDoComponente.test.ts`, e export em `packages/design-system/src/index.ts`.
8. Rodar ao final de cada WP: `yarn workspace @babyclothes/web check && yarn workspace @babyclothes/web test` (e o equivalente do design-system quando aplicável).
9. Textos via i18n: `$t('chave')` — chaves definidas no WP7. Nunca hardcodar português no componente.

Tokens de referência (de `tokens.css` / mock):
`--color-pk #FF3CAC` · `--color-pk-soft #FFE8F5` · `--color-pk-mid #FF85CC` · `--color-pk-purple #B03EFF` · `--bk #111111` · `--of #F8F5F2` · borda neutra `#EDE9E4` · borda input `#D1D5DB` · texto secundário `#6B7280` · texto terciário `#9CA3AF` · sucesso `#22C55E` · erro `var(--color-error)` / `#EF4444` · fontes `--font-lato`, `--sr` (Cormorant), `--font-londrina`.

Ordem de execução e dependências:

```
WP9 (API e-mail/senha) ──► WP3 (registro PF) e WP11 (login e-mail)
WP10 (DS Select) ──► WP3
WP1 (flags) ──► WP2 (shell/guards) ──► WP8 (QA)
WP1 ──► WP3 (registro PF) e WP11 (login e-mail)
WP4 (DS components) ──► WP5 (onboarding) e WP6 (agente)
WP1 + WP4 ──► WP5, WP6
WP7 (i18n) pode rodar em paralelo; WP3/5/6/11 dependem das chaves
```
