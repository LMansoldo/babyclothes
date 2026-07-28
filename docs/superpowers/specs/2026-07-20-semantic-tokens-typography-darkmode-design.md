# Design — Tokens semânticos + escala tipográfica + dark mode

> Data: 2026-07-20 · Status: aprovado (brainstorming) · **Este doc é o overview**; a implementação está quebrada nas specs granulares abaixo.
> Pacote: `packages/design-system` (tokens CSS custom properties). Consumidores: `apps/web` (~50 componentes).

## Decomposição em specs granulares

Cada uma é implementável e testável sozinha (spec → plano → implementação). Ordem por dependência:

| # | Spec | Depende de | Bloqueia |
|---|------|-----------|----------|
| 00 | [Arquitetura de tokens](2026-07-20-ds-foundations-00-token-architecture.md) — split `tokens.css` em agregador | — | 01, 03, 04 |
| 01 | [Tokens semânticos de cor (claro)](2026-07-20-ds-foundations-01-semantic-color-tokens.md) | 00 | 02 |
| 02 | [Dark mode `[data-theme]`](2026-07-20-ds-foundations-02-dark-mode.md) | 01 | — |
| 03 | [Escala tipográfica](2026-07-20-ds-foundations-03-typography-scale.md) | 00 | — |
| 04 | [Grid & breakpoints](2026-07-20-ds-foundations-04-grid-breakpoints.md) | 00 | — |

Grafo: `00 → {01 → 02, 03, 04}`. Depois de `00`, as specs `01/03/04` podem correr em paralelo; `02` espera `01`.

As seções abaixo (§1–§12) são o design completo/rationale; os números/valores foram destilados nas specs granulares acima.

## 1. Objetivo

Elevar a fundação do design system, resolvendo os maiores furos do audit (Design Systems 102):
1. **Camada de tokens semânticos** (`surface/text/border/brand/feedback`) sobre os primitivos existentes.
2. **Escala tipográfica** (tokens de tamanho/linha/peso por papel) para eliminar os `font-size` mágicos espalhados.
3. **Dark mode** via mecanismo único `[data-theme]` — serve tanto **superfície-escura-por-escopo** (onboarding) quanto um **toggle global** futuro.
4. **Sistema de grid/breakpoints** (mobile / medium / large / ultra) — o "sistema espacial" que hoje não existe documentado.

### Não-objetivos (YAGNI)

- **Não** construir a UI do toggle claro/escuro no perfil agora (a arquitetura habilita; a UI é opcional futura).
- **Não** migrar a base de `rem` de 20px → 10px (ver §10 dívida técnica — spec separado).
- **Não** carregar as display fonts reais (Londrina/Sriracha/Vidaloka hoje aliased para Lato) — é foundation de *família* tipográfica, spec à parte. Aqui tratamos só de **escala** (tamanho/linha/peso).
- **Não** adicionar framework de CSS nem `postcss-custom-media` (breakpoints ficam como constantes documentadas + `@media` literais — ver §7).
- **Não** migrar os ~50 componentes de uma vez — adoção **oportunista** (ver §8).

## 2. Decisões (do brainstorming)

| Tema | Decisão |
|------|---------|
| Base do `rem` | **20px = 1rem** (de-facto; `html{font-size:125%}`). Migração p/ 10px = spec separado |
| Arquitetura | **3 camadas**: primitivos (existem) → **semânticos (novo)** → componentes. Aliases legados ficam como estão |
| Dark mode | Mecanismo único **`[data-theme="dark"]`**, aplicável em qualquer escopo (root = global; section = ilha escura). Default **claro** |
| Escala tipográfica | **Role-based** (`display…caption`), tokens size+line+weight, valores consolidados dos já usados |
| Grid/breakpoints | **4 tiers** mobile-first: mobile (base) / medium `40rem` / large `64rem` / ultra `90rem`. `rem` de MQ = 16px |
| Migração | Aditiva; nada quebra; componentes viram dark-aware conforme migram para semânticos |

## 3. Arquitetura de tokens (3 camadas)

```
Camada 1 — PRIMITIVOS (já existem, não mexer)
  --color-pink #FF3CAC · --color-bg #F8F5F2 · --color-black-2 #111 · ...
        │  (referenciados por)
Camada 2 — SEMÂNTICOS (NOVO, tema-áveis)
  --surface-* · --text-* · --border-* · --brand-* · --feedback-*
  --text-<role>-size/line/weight
        │  :root = claro   |   [data-theme="dark"] = escuro
        │  (consumidos por)
Camada 3 — COMPONENTES
  usam SEMÂNTICOS (novos/migrados) — nunca hex cru
```

**Aliases legados** (`--pk`, `--bk`, `--of`…) **permanecem apontando para primitivos** e **theme-invariantes**. Motivo: hoje são usados de forma ambígua (ora fg, ora bg — ex.: `--bk` é cor de texto E fundo de avatar preto). Reapontá-los para semânticos tema-áveis causaria flips errados no dark. Então **não** viram shim de semântico; ficam como estão e são substituídos por semânticos na migração por componente.

**Organização de arquivos** (split para manutenção; um só ponto de import continua sendo `tokens.css`):
```
packages/design-system/src/tokens/
├── primitives.css     (extraído do tokens.css atual: --color-*, --space-*, --radius-*, --shadow-*)
├── semantic.css       (NOVO: --surface/text/border/brand/feedback, tema claro em :root)
├── typography.css     (NOVO: escala --text-<role>-*)
├── themes.css         (NOVO: [data-theme="dark"] { ...re-declara semânticos... })
└── tokens.css         (passa a @import os quatro acima — mantém o import externo estável)
```
> O `@import` externo (`@babyclothes/design-system/tokens.css`) e o `brand.css` continuam funcionando. Aliases legados ficam em `primitives.css`.

## 4. Escala tipográfica (base 1rem = 20px)

Consolidação dos `font-size` já usados (0.6–1.7rem) em 8 papéis. Cada papel expõe `--text-<role>-size`, `--text-<role>-line`, `--text-<role>-weight` (e `-tracking` onde relevante).

| Papel | size (rem / px@20) | line-height | weight | tracking | Uso |
|-------|--------------------|-------------|--------|----------|-----|
| `display` | 1.7 / 34 | 1.15 | 300 | — | Hero (onboarding) |
| `title` | 1.4 / 28 | 1.2 | 700 | — | Título de tela |
| `heading` | 1.1 / 22 | 1.25 | 700 | — | Seção |
| `subheading` | 0.95 / 19 | 1.3 | 700 | — | Título de card |
| `body` | 0.85 / 17 | 1.55 | 400 | — | Parágrafo padrão |
| `body-sm` | 0.78 / 15.6 | 1.5 | 400 | — | Bolhas de chat, secundário |
| `label` | 0.72 / 14.4 | 1.3 | 700 | — | Rótulo de campo, chip |
| `caption` | 0.62 / 12.4 | 1.4 | 500 | 0.05em | Timestamp, eyebrow (uppercase) |

Exemplo de definição (`typography.css`):
```css
:root {
  --text-title-size: 1.4rem;  --text-title-line: 1.2;  --text-title-weight: 700;
  --text-body-size: 0.85rem;  --text-body-line: 1.55; --text-body-weight: 400;
  /* ...demais papéis... */
}
```
Consumo:
```css
.card__title {
  font-size: var(--text-subheading-size);
  line-height: var(--text-subheading-line);
  font-weight: var(--text-subheading-weight);
}
```
**Opcional (conveniência):** utilitários `.text-<role>` no DS que aplicam o trio de uma vez. Decidir na implementação; a API primária são as custom properties (consistente com o padrão atual).

> Nota: papel = **tamanho/linha/peso**, não família. Família (`--font-lato` etc.) fica fora deste spec.

## 5. Tokens semânticos — valores por tema

Nomes iguais nos dois temas; só o valor muda. Valores derivados dos hexes/rgba já usados nos componentes e mocks (inclui cinzas Tailwind de-facto: `#374151`, `#9CA3AF`, `#D1D5DB`, `#EDE9E4`, `#F3F4F6`).

### 5.1 Superfícies
| Token | Claro (`:root`) | Escuro (`[data-theme="dark"]`) | Uso |
|-------|-----------------|-------------------------------|-----|
| `--surface-base` | `#F8F5F2` | `#140A12` | Fundo da tela |
| `--surface-raised` | `#FFFFFF` | `rgba(255,255,255,.08)` | Cards, bolha do agente |
| `--surface-sunken` | `#F3F4F6` | `rgba(255,255,255,.04)` | Inputs, wells |
| `--surface-inverse` | `#111111` | `#FFFFFF` | Bolha do usuário, chips escuros |
| `--surface-overlay` | `rgba(10,10,10,.5)` | `rgba(0,0,0,.6)` | Scrims/modais |

### 5.2 Texto
| Token | Claro | Escuro | Uso |
|-------|-------|--------|-----|
| `--text-primary` | `#111111` | `#FFFFFF` | Texto principal |
| `--text-secondary` | `#374151` | `rgba(255,255,255,.7)` | Secundário |
| `--text-tertiary` | `#9CA3AF` | `rgba(255,255,255,.4)` | Terciário/placeholder |
| `--text-on-brand` | `#FFFFFF` | `#FFFFFF` | Sobre rosa |
| `--text-inverse` | `#FFFFFF` | `#111111` | Sobre `surface-inverse` |
| `--text-disabled` | `#BCBCBC` | `rgba(255,255,255,.3)` | Desabilitado |

### 5.3 Bordas
| Token | Claro | Escuro |
|-------|-------|--------|
| `--border-subtle` | `#F3F4F6` | `rgba(255,255,255,.08)` |
| `--border-default` | `#EDE9E4` | `rgba(255,255,255,.12)` |
| `--border-strong` | `#D1D5DB` | `rgba(255,255,255,.2)` |
| `--border-focus` | `var(--color-pink)` | `var(--color-pink)` |

### 5.4 Marca / interativo
| Token | Claro | Escuro |
|-------|-------|--------|
| `--brand` | `#FF3CAC` | `#FF3CAC` |
| `--brand-hover` | `#FF6EC7` | `#FF6EC7` |
| `--brand-subtle` | `#FFE8F5` | `rgba(255,60,172,.14)` |
| `--on-brand` | `#FFFFFF` | `#FFFFFF` |

### 5.5 Feedback (padrão: `-solid` / `-subtle` / `-text`)
`success #22C55E`, `warning #F59E0B`, `error #EF4444`, `info #3B82F6`. Ex.: `--feedback-error-solid`, `--feedback-error-subtle` (tinta clara/dark), `--feedback-error-text` (legível sobre o subtle). Reaproveita `--color-success/...` como `-solid`.

## 6. Dark mode — mecanismo

```css
/* semantic.css — tema claro é o default */
:root { --surface-base: #F8F5F2; --text-primary: #111; /* ... */ }

/* themes.css — re-declara os MESMOS nomes no escopo dark */
[data-theme="dark"] {
  --surface-base: #140A12;
  --text-primary: #fff;
  /* ...todos os semânticos... */
}
```
- **Superfície escura por escopo:** `<section data-theme="dark"> … </section>` — só aquele subtree vira escuro (onboarding). Sem JS.
- **Toggle global futuro:** setar `data-theme="dark"` no `<html>` — um `themeStore` grava o atributo + persiste (localStorage) e pode honrar `prefers-color-scheme` como default. **Fora de escopo agora**, mas o mecanismo já suporta.
- Herança: como semânticos são custom properties, um subtree com `data-theme` sobrescreve por cascata sem tocar os componentes.

## 7. Grid & breakpoints (sistema espacial — mobile / medium / large / ultra)

Mobile-first. Quatro tiers. **Importante:** dentro de `@media`, `rem`/`em` valem **16px** (valor inicial do root), então os breakpoints em `rem` **não** seguem os 20px do resto da app — por isso a coluna px abaixo. Alinhado aos breakpoints já usados no código (`40rem`, `64rem`).

### 7.1 Breakpoints

| Tier | Faixa | `@media` (min-width) | px (MQ) |
|------|-------|----------------------|---------|
| **mobile** | base / celular | — (default, sem query) | < 640 |
| **medium** | tablet | `@media (min-width: 40rem)` | ≥ 640 |
| **large** | desktop | `@media (min-width: 64rem)` | ≥ 1024 |
| **ultra** | desktop grande / wide | `@media (min-width: 90rem)` | ≥ 1440 |

> **Limitação CSS:** custom properties **não** funcionam dentro da condição de `@media`. Então os breakpoints são **constantes documentadas** (tabela acima) e as queries usam o valor literal (`40rem`/`64rem`/`90rem`). Para nomear/DRY seria preciso `postcss-custom-media` — deixado como opcional futuro (fora de escopo, ver §1). A query legada `76.8rem` (≈1229px) deve ser **normalizada** para `large` (64rem) na migração.

Tokens de referência (documentação; **não** usar em `@media`, só em código normal p.ex. JS/container-query futura):
```css
:root {
  --bp-medium: 40rem;  /* 640px  */
  --bp-large:  64rem;  /* 1024px */
  --bp-ultra:  90rem;  /* 1440px */
}
```

### 7.2 Container (largura de conteúdo + gutters)

`max-width` e `padding-inline` são código normal → aqui `rem` = **20px**. Tokens:
```css
:root {
  --container-medium: 36rem; /* 720px  */
  --container-large:  48rem; /* 960px  */
  --container-ultra:  60rem; /* 1200px */

  --gutter-mobile: 1rem;   /* 20px */
  --gutter-medium: 1.5rem; /* 30px */
  --gutter-large:  2rem;   /* 40px */
}
```
Utilitário `.container` (ou componente `Container` no DS):
```css
.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--gutter-mobile);
}
@media (min-width: 40rem) { .container { max-width: var(--container-medium); padding-inline: var(--gutter-medium); } }
@media (min-width: 64rem) { .container { max-width: var(--container-large);  padding-inline: var(--gutter-large);  } }
@media (min-width: 90rem) { .container { max-width: var(--container-ultra); } }
```

### 7.3 Grid de colunas

Colunas por tier (12-col no desktop, reduzido no mobile), gap via `--space-*`:

| Tier | Colunas | Gap sugerido |
|------|---------|--------------|
| mobile | 4 | `--space-4` (1rem/20px) |
| medium | 8 | `--space-5` (1.25rem) |
| large / ultra | 12 | `--space-6` (1.5rem) |

Utilitário `.grid`:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
@media (min-width: 40rem) { .grid { grid-template-columns: repeat(8, 1fr);  gap: var(--space-5); } }
@media (min-width: 64rem) { .grid { grid-template-columns: repeat(12, 1fr); gap: var(--space-6); } }
```
Span de itens via `grid-column: span N` (ou utilitários `.col-span-{n}` se quiserem, opcional). Componentes de tela devem usar `.container` para o cap de largura e `.grid` para layout multi-coluna; hoje várias telas são single-column full-width (mobile) e vão ganhar respiro no desktop com o `.container`.

### 7.4 Onde mora

`packages/design-system/src/tokens/layout.css` (novo — breakpoints/container/grid tokens) importado pelo `tokens.css` agregador. Os utilitários `.container`/`.grid` podem ir num `layout.css` global (DS) exposto junto dos tokens, **ou** virar componentes `Container`/`Grid` no DS (decidir na implementação; recomendo utilitários CSS por serem mais leves que componentes para layout).

## 8. Migração (oportunista, não-quebra)

1. **Adicionar** `primitives/semantic/typography/themes/layout.css` e religar `tokens.css` (aditivo — nada muda para quem já usa).
2. **Provar** migrando as **superfícies já-escuras** primeiro: `onboarding/+page.svelte` + `OnboardingHero` (hoje hardcodam `rgba`/hex) para `data-theme="dark"` + tokens semânticos. Remove os `rgba` mágicos.
3. **Migração oportunista:** ao tocar qualquer componente, trocar hex/alias por semântico + escala tipográfica. Ordem sugerida por impacto: chat (`ChatBubble`, `AgentTopBar`, `AgentFormCard`), depois primitivos muito usados (`Button`, `Input`, `Chip`).
4. **Opcional futuro** (specs separados): (a) toggle global de tema; (b) base 10px; (c) display fonts reais; (d) stylelint proibindo hex/px cru.

## 9. Testes / validação

Tokens são CSS — validação é visual + estrutural:
- **Paridade de tema (teste):** um teste unitário lê `semantic.css` e `themes.css` e afirma que **todo** token semântico definido no `:root` tem correspondente em `[data-theme="dark"]` (falha se alguém adicionar um semântico e esquecer o dark).
- **Storybook:** atualizar a doc de tokens (já existe story de tokens) com (a) tabela da escala tipográfica, (b) swatches semânticos, (c) um decorator que mostra os componentes em `light` vs `data-theme="dark"` lado a lado.
- **Contraste (WCAG AA):** documentar e conferir os pares texto/superfície principais (`text-primary`/`surface-base`, `text-secondary`/`surface-raised`, `on-brand`/`brand`) em ambos os temas ≥ 4.5:1 (texto normal) / 3:1 (grande). Ferramenta manual ou script.
- **Regressão visual:** screenshot do onboarding (migrado) antes/depois — deve ficar idêntico ao mock, agora via tokens.

## 10. Dívida técnica registrada: base 20px vs intenção 10px

O `RULES.md` diz "10px = 1rem", mas `app.postcss` usa `font-size:125%` → **1rem = 20px**, e todos os ~50 componentes + mocks foram autorados a 20px. Decisão: **manter 20px agora**. A camada de tokens desta spec é a **alavanca de migração**: no dia de ir para 10px, muda-se o root (`62.5%`) e **dobram-se os valores nos arquivos de token** — componentes que já usam `--text-*`/semânticos não mudam. Ação de acompanhamento: corrigir o `RULES.md` para refletir 20px (ou marcar 10px como meta futura com esta rota).

## 11. Arquivos afetados

```
packages/design-system/src/tokens/
├── primitives.css      (novo — recorte do tokens.css atual)
├── semantic.css        (novo)
├── typography.css      (novo)
├── themes.css          (novo — [data-theme="dark"])
├── layout.css          (novo — breakpoints/container/grid + utilitários .container/.grid)
└── tokens.css          (vira agregador @import)
packages/design-system/src/ (Storybook)
└── stories de tokens   (atualizar: escala + swatches + light/dark + tabela de breakpoints/grid)
packages/design-system/src/tokens/tokens.test.ts  (novo — paridade de tema)
apps/web/src/routes/onboarding/+page.svelte        (migrar p/ data-theme=dark + semânticos)
packages/design-system/src/patterns/OnboardingHero/OnboardingHero.svelte (idem)
```

## 12. Convenções

- Custom properties kebab-case; nomes **semânticos** (papel/uso), não visuais.
- `rem` (base 20px por ora; **exceto em `@media`, onde `rem` = 16px** — ver §7); sem `px` cru; sem hex cru em componente novo/migrado.
- Breakpoints: sempre mobile-first (`min-width`), valores literais `40rem`/`64rem`/`90rem`.
- Svelte 5 runes; validar `.svelte` migrados com Svelte MCP (`mcp__svelte__svelte-autofixer`).
- i18n inalterado (não há texto aqui).
