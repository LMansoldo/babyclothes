# Storybook do Design System com identidade BabyClothes — Design

> Data: 2026-07-09
> Status: aprovado em brainstorm
> Referência visual: `BabyClothes architecture diagrams/BabyClothes Design System.dc.html` (DS v1.0)

## Objetivo

Transformar a documentação de design tokens do Storybook (`packages/design-system`) — hoje tabelas markdown geradas por autodocs — em páginas visuais fiéis ao spec `BabyClothes Design System.dc.html`, e tematizar o shell do Storybook inteiro (sidebar, toolbar, docs) com a identidade da marca.

## Decisões (fechadas no brainstorm)

1. **Escopo**: páginas de Fundamentos (Marca, Cores, Tipografia, Espaçamento, Efeitos) reescritas como páginas visuais + tema do Storybook inteiro (manager + docs). As stories dos ~35 componentes NÃO são reescritas — herdam o visual via `docs.theme`.
2. **Nomenclatura**: os cards exibem os nomes REAIS do `tokens.css` (`--color-pink`, `--pk`, `--color-bg`, `--space-4`...), não os nomes do HTML de referência (`--color-pk`, `--color-of`) que não existem no código. Fidelidade é visual, não de rótulos.
3. **Abordagem**: componentes Svelte de documentação (opção A) — sem MDX, sem iframe do HTML.
4. **Fonte da verdade**: swatches e espécimes pintam com `var(--token)` real; se o `tokens.css` mudar, o doc reflete automaticamente. Metadados (valor exibido, uso) vivem em um manifest TS único.

## Arquitetura

### Novos blocos de documentação — `packages/design-system/src/tokens/docs/`

Cada bloco tem uma responsabilidade, BEM com prefixo `bc-doc`, unidades rem, sem emojis (SVG inline quando precisar de ícone):

> **Base rem**: o preview do Storybook NÃO carrega o `app.postcss` do web (root 125%); o root é 16px. Conversões abaixo usam 1rem = 16px.

| Componente | Responsabilidade | Props (contrato) |
|---|---|---|
| `DocPage.svelte` | Wrapper de página: fundo (`#F8F5F2` \| branco \| dark), conteúdo `max-width: 58.75rem` (940px), padding `3rem 3.5rem` | `background?: 'off' \| 'white' \| 'dark'`, `children: Snippet` |
| `DocSection.svelte` | Cabeçalho de seção: eyebrow uppercase rosa (`FUNDAMENTOS`), título Cormorant Garamond `2.25rem/300`, descrição cinza `#6B7280` max-width `28.75rem` (460px) | `eyebrow?: string`, `title: string`, `description?: string`, `children?: Snippet` |
| `ColorGrid.svelte` | Grid `auto-fill minmax(10.3rem, 1fr)` (165px) de swatches: bloco `4.5rem` (72px) de altura, radius `0.75rem`, sombra colorida opcional, `<code>` com nome do token, linha hex · uso | `label: string` (categoria), `swatches: TokenSwatch[]` |
| `TypeSpecimen.svelte` | Card com borda `#EDE9E4`: badge de papel (LOGO ONLY etc.), chips `<code>` do token e do nome da fonte, espécime renderizado na própria fonte | `role: string`, `token: string`, `fontName: string`, `sample: string`, `sampleClass?: string` |
| `SpacingScale.svelte` | Card branco com barras rosa proporcionais (largura = valor do token), nome monospace + `0.25rem · 4px` | `steps: SpacingStep[]` |
| `EffectShowcase.svelte` | Painel com gradiente da marca contendo cards glass reais (blur aplicado) + grid de sombras/radius | `children: Snippet` (slots compostos pela página) |
| `BrandHero.svelte` | Hero escuro (gradiente `140deg #0F0F0F → #1A0814 → #0A0A1A`) com glows radiais rosa/roxo, logo gota SVG + wordmark Londrina, título Cormorant `4rem` "Design System v1.0", subtítulo | `title?: string`, `version?: string`, `subtitle?: string` |

### Páginas — `packages/design-system/src/tokens/docs/pages/`

Uma composição por fundamento: `BrandPage.svelte`, `ColorsPage.svelte`, `TypographyPage.svelte`, `SpacingPage.svelte`, `EffectsPage.svelte`. Cada página monta os blocos acima na ordem/agrupamento do HTML de referência (ex.: Cores = Rosa · Principal → Superfícies → Neutros → Semânticas → Glass).

### Dados — `packages/design-system/src/tokens/docs/tokenManifest.ts`

Manifest único, tipado, com os nomes reais do `tokens.css`:

```ts
export type TokenSwatch = {
  token: string      // ex.: '--color-pink' (nome real)
  value: string      // ex.: '#FF3CAC' (exibido como legenda)
  usage: string      // ex.: 'Ação primária, links, badges'
  border?: boolean   // swatches claros ganham borda
  glow?: boolean     // sombra colorida no bloco (rosa/roxo)
}

export type SpacingStep = { token: string; rem: string; px: string }
```

Categorias exportadas: `pinkSwatches`, `surfaceSwatches`, `neutralSwatches`, `semanticSwatches`, `glassSwatches`, `spacingSteps`, `radiusSteps`, `fontFamilies`, `shadowTokens`. Conteúdo de uso em pt-BR, portado das tabelas markdown atuais (`Colors.stories.ts` etc.) e do HTML de referência.

### Stories reescritas — `packages/design-system/src/tokens/*.stories.ts`

As 5 stories existentes (`Brand`, `Colors`, `Typography`, `Spacing`, `Effects`) passam a renderizar as páginas com `parameters: { layout: 'fullscreen' }`. As tabelas markdown em `docs.description.story` são removidas. `TokenDocs.stories.ts` (página-índice "Design Tokens") e `TokenDocs.svelte` são **removidos** — a navegação por Fundamentos na sidebar já cumpre o papel de índice.

### Tema do shell — `packages/design-system/.storybook/`

| Arquivo | Conteúdo |
|---|---|
| `babyclothes-theme.ts` (novo) | `create({ base: 'light' })` com: `brandTitle: 'BabyClothes DS'`, `brandImage` (SVG data-URI: gota rosa + wordmark Londrina), `colorPrimary/colorSecondary: '#FF3CAC'`, `appBg: '#F8F5F2'`, `appContentBg: '#FFFFFF'`, `barSelectedColor: '#FF3CAC'`, `fontBase: "'Lato', sans-serif"`, `textColor: '#111111'`, bordas `#EDE9E4` |
| `manager.ts` (novo) | `addons.setConfig({ theme })` importando o tema |
| `manager-head.html` (novo) | `<link>` Google Fonts: Lato, Londrina Solid, Cormorant Garamond |
| `preview-head.html` (novo) | Mesmas fonts para o canvas/docs (Cormorant e Londrina não estão no `app.postcss` do pacote) |
| `preview.ts` (editar) | `parameters.docs.theme` = mesmo tema; background `off-white` corrigido para `#F8F5F2` (hoje `#F4F3F0`, valor que não existe nos tokens); `options.storySort` fixando Fundamentos → Marca, Cores, Tipografia, Espaçamento, Efeitos → Primitives → Composites → Patterns |

**Dependências novas** (explícitas por causa do Yarn PnP): `@storybook/theming` e `@storybook/manager-api` em `devDependencies` do pacote, mesma faixa `^8.3.0`.

## Testes

- `DocSection.test.ts` — renderiza eyebrow, título e descrição.
- `ColorGrid.test.ts` — renderiza um card por swatch com nome do token e valor; categoria visível.
- `SpacingScale.test.ts` — renderiza uma barra por step com o nome monospace.
- Blocos puramente decorativos (`BrandHero`, `EffectShowcase`, `DocPage`) não ganham testes próprios (sem lógica).
- Gates: `yarn test:ds`, `yarn check:ds`, `yarn stylelint:ds`, `yarn lint:ds` verdes; nota: `check:ds` tem 80 erros pré-existentes em stories antigas — o critério é não adicionar NENHUM erro novo.

## Validação visual

`yarn storybook:ds` local (porta 6007), comparando lado a lado com o HTML de referência aberto no browser: hero da marca, grids de cores, espécimes tipográficos, escala de espaçamento, painel de efeitos, e o shell (logo na sidebar, cores, fontes).

## Fora de escopo

- Reescrever stories/docs dos componentes individuais.
- Renomear tokens no `tokens.css` ou alterar valores de token.
- Publicação do Storybook (deploy) — continua local.
- O Storybook do `apps/web` (`storybook:web`).
