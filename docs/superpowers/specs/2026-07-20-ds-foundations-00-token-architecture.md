# DS Foundations 00 — Reestruturação da arquitetura de tokens

> Data: 2026-07-20 · Parte de: `2026-07-20-semantic-tokens-typography-darkmode-design.md` (doc-mãe §3)
> **Pré-requisito de todas as outras specs de foundations (01–04).** Depende de: nada.

## Objetivo

Preparar o terreno: dividir o `tokens.css` atual em arquivos por responsabilidade e transformar `tokens.css` num **agregador** que faz `@import`. **Sem nenhuma mudança visual** — puro rearranjo, para que as specs 01–04 apenas acrescentem seus arquivos.

## Escopo

`packages/design-system/src/tokens/`:
- **Novo** `primitives.css` — recebe **todo** o conteúdo atual do `tokens.css`: `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--transition-*`, os **aliases** (`--pk`, `--bk`, `--of`, `--sr`…), os aliases de fonte e os `@keyframes`.
- `tokens.css` passa a ser só:
  ```css
  @import './primitives.css';
  /* specs 01–04 acrescentam aqui:
     @import './semantic.css';
     @import './typography.css';
     @import './themes.css';
     @import './layout.css'; */
  ```
- **Não tocar** em `brand.css` nem nos aliases (ficam theme-invariantes, ver doc-mãe §3).

## Não-objetivos

- Não adicionar nenhum token novo (isso é 01–04).
- Não mexer em componentes.

## Definition of Done

- `@babyclothes/design-system/tokens.css` continua exportando **exatamente** os mesmos custom properties de antes (diff de tokens = zero).
- Build do DS ok; `yarn workspace @babyclothes/web check` sem novos erros.
- Storybook e app **visualmente idênticos** (o import externo resolve igual).
- `git grep` confirma que nenhuma var some: comparar a lista de `--nome:` antes/depois é igual.

## Teste

- Smoke visual: abrir Storybook e 1–2 telas do app — sem diferença.
- (Opcional) script que extrai `^\s*--[\w-]+:` de `primitives.css` e confere que bate com o `tokens.css` original.
