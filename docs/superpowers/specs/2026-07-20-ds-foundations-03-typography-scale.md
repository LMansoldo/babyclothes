# DS Foundations 03 — Escala tipográfica

> Data: 2026-07-20 · Parte de: doc-mãe §4 · Depende de: **00** (arquitetura de tokens). Independente de cor/dark.

## Objetivo

Consolidar os `font-size` mágicos espalhados (0.6–1.7rem) numa **escala role-based** de tokens. Base **1rem = 20px** (de-facto; ver doc-mãe §10).

## Escopo

- **Novo** `packages/design-system/src/tokens/typography.css` com os 8 papéis abaixo (`--text-<role>-size/line/weight`, + `-tracking` onde indicado), e `@import` no `tokens.css`.
- **Piloto**: aplicar aos títulos/labels de **1** componente (recomendado: `OnboardingHero` — título `display`, ou um card com `subheading`/`label`). Sem mudança visual.

### Escala (base 20px)

| Papel | size (rem / px) | line | weight | tracking |
|-------|-----------------|------|--------|----------|
| `display` | 1.7 / 34 | 1.15 | 300 | — |
| `title` | 1.4 / 28 | 1.2 | 700 | — |
| `heading` | 1.1 / 22 | 1.25 | 700 | — |
| `subheading` | 0.95 / 19 | 1.3 | 700 | — |
| `body` | 0.85 / 17 | 1.55 | 400 | — |
| `body-sm` | 0.78 / 15.6 | 1.5 | 400 | — |
| `label` | 0.72 / 14.4 | 1.3 | 700 | — |
| `caption` | 0.62 / 12.4 | 1.4 | 500 | 0.05em |

Exemplo:
```css
:root {
  --text-title-size: 1.4rem; --text-title-line: 1.2; --text-title-weight: 700;
  /* ...8 papéis... */
}
```

- **Opcional**: utilitários `.text-<role>` no DS aplicando o trio. Decidir na implementação; API primária = custom properties.

## Não-objetivos

- **Não** trocar famílias de fonte (`--font-lato` etc.) — famílias/display fonts são outra spec.
- **Não** migrar todos os componentes (só o piloto).

## Definition of Done

- `typography.css` presente e importado; tokens resolvem.
- Piloto usa `var(--text-<role>-*)` no lugar dos `font-size`/`line-height`/`font-weight` soltos; visual idêntico.
- Storybook: tabela da escala tipográfica.
- `check` verde; Svelte MCP autofixer limpo no `.svelte` do piloto.
