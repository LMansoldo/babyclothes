# DS Foundations 04 — Grid & breakpoints (sistema espacial)

> Data: 2026-07-20 · Parte de: doc-mãe §7 · Depende de: **00** (arquitetura de tokens). Independente de cor/dark/tipografia.

## Objetivo

Definir o sistema espacial responsivo em 4 tiers **mobile-first**: mobile / medium / large / ultra, com container e grid de colunas.

## Escopo

- **Novo** `packages/design-system/src/tokens/layout.css` (tokens + utilitários `.container`/`.grid`), `@import` no `tokens.css`.
- **Normalizar** a query legada `@media (...76.8rem)` (≈1229px) para `large` (`64rem`) onde aparecer.
- **Piloto**: aplicar `.container` a **1** tela para ganhar `max-width` no desktop (recomendado: uma tela hoje full-width, ex.: catálogo ou perfil).

### Breakpoints (⚠️ em `@media`, `rem` = 16px, não 20px)

| Tier | `@media` | px |
|------|----------|-----|
| mobile | — (default) | < 640 |
| medium | `min-width: 40rem` | ≥ 640 |
| large | `min-width: 64rem` | ≥ 1024 |
| ultra | `min-width: 90rem` | ≥ 1440 |

> Custom property **não** funciona dentro da condição `@media` → usar valor literal (`40rem`/`64rem`/`90rem`). Tokens `--bp-*` são só documentação/JS.

### Container (código normal → `rem` = 20px)

```css
:root {
  --container-medium: 36rem; /* 720px */
  --container-large:  48rem; /* 960px */
  --container-ultra:  60rem; /* 1200px */
  --gutter-mobile: 1rem; --gutter-medium: 1.5rem; --gutter-large: 2rem;
}
.container {
  width: 100%; margin-inline: auto; padding-inline: var(--gutter-mobile);
}
@media (min-width: 40rem) { .container { max-width: var(--container-medium); padding-inline: var(--gutter-medium); } }
@media (min-width: 64rem) { .container { max-width: var(--container-large);  padding-inline: var(--gutter-large);  } }
@media (min-width: 90rem) { .container { max-width: var(--container-ultra); } }
```

### Grid de colunas

| Tier | Colunas | Gap |
|------|---------|-----|
| mobile | 4 | `--space-4` |
| medium | 8 | `--space-5` |
| large/ultra | 12 | `--space-6` |

```css
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
@media (min-width: 40rem) { .grid { grid-template-columns: repeat(8, 1fr);  gap: var(--space-5); } }
@media (min-width: 64rem) { .grid { grid-template-columns: repeat(12, 1fr); gap: var(--space-6); } }
```
Span via `grid-column: span N` (utilitários `.col-span-{n}` opcionais).

## Não-objetivos

- **Não** adicionar `postcss-custom-media` nem framework CSS.
- **Não** refatorar todos os layouts (só o piloto).

## Definition of Done

- `layout.css` presente e importado; `.container`/`.grid` funcionam.
- Piloto: a tela ganha `max-width` centrado no desktop e continua full-width no mobile (checar em ~390px, ~800px, ~1200px, ~1500px).
- Query `76.8rem` legada normalizada.
- `check` verde; Svelte MCP autofixer limpo no `.svelte` do piloto.
