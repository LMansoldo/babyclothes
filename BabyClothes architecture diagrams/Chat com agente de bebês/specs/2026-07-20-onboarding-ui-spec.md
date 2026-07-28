# Spec detalhada — UI da rota `/onboarding` (tela 03) e seus componentes

> Data: 2026-07-20 · Base visual: `BabyClothes Chat Mocks.dc.html`, `data-screen-label="03 — /onboarding"` (linhas 216–297).
> Base de código: monorepo `babyclothes`. Formato: **work packages (WP1–WP4)** autocontidos para delegação a subagente.
> Objetivo: aproximar a implementação real da rota `/onboarding` e do pattern `OnboardingHero` ao mock, corrigindo os desvios abaixo.

---

## 0. Contexto e estado atual

**Arquivos envolvidos:**
- Rota: `apps/web/src/routes/onboarding/+page.svelte` (+ `+page.server.ts`, já correto — **não mexer**).
- Pattern: `packages/design-system/src/patterns/OnboardingHero/OnboardingHero.svelte` (+ `index.ts`, `.stories.ts`, `.test.ts`).
- i18n: `apps/web/src/lib/i18n/{en,pt}.json` → bloco `onboarding` (**já existe e está completo — não mexer**).

`OnboardingHero` é usado **exclusivamente** pela rota `/onboarding` (verificado). Pode ser redesenhado sem risco de regressão em outras telas.

**Regra de redirect automático já removida:** o bloco `onMount` que redirecionava para `/agent` quando `localStorage.bc_onboarded === '1'` foi retirado. **Não reintroduzir.** A navegação para `/agent` só acontece por ação do usuário (CTA e "Pular").

### Delta mock × código atual (o que este spec corrige)

| # | Aspecto | Mock (tela 03) | Código atual | Ação |
|---|---------|----------------|--------------|------|
| 1 | Ícones das features | SVG traçado em `--color-pk-mid` | Renderiza `{feature.icon}` como **texto** → aparece "size", "age"… literalmente | WP1 |
| 2 | Cards das features | Card translúcido escuro, `rgba(255,255,255,.08)`, borda `.12`, radius 10px | Pílula **branca** arredondada (99rem) | WP1 |
| 3 | Título | Serif display, 1.7rem, peso 300, branco; acento **no meio** da frase | Lato 1.5rem; acento **no fim** | WP1 |
| 4 | Ilustração | Cena 240×200: mascote gota + 4 cards flutuantes + conectores tracejados + brilhos | Gota simples 120×120 | WP1 |
| 5 | Dots de paginação | 3 dots (1º ativo alongado rosa, 2 cinza) | Ausente | WP3 |
| 6 | Brilho radial roxo | `radial-gradient(...,rgba(176,62,255,.18)...)` topo-esquerda | Ausente | WP3 |
| 7 | Fundo escuro + CTA | Gradiente escuro + botão rosa full-width com seta | Já existe (mantém) | WP3 |

---

## Regras globais (valem para TODOS os WPs)

1. **Svelte 5 runes**: `$props()`, `$state()`, `$derived()`, `Snippet`, `{#snippet}`/`{@render}`. Nunca `export let`.
2. **Sem emojis** em código, strings ou stories. Ícones: `lucide-svelte` na rota (web); SVG inline no pattern do design-system.
3. **CSS**: custom properties de `@babyclothes/design-system/tokens.css`; BEM `.block__element--modifier`; `<style>` scoped.
4. **i18n**: todo texto via `$t('chave')`. As chaves de `onboarding` já existem — não hardcodar PT/EN.
5. **DS**: componente do design-system tem `.svelte` + `index.ts` + `.stories.ts` + `.test.ts` e export em `packages/design-system/src/index.ts` (via `patterns/index.ts`, já existente para `OnboardingHero`).
6. **Não editar**: `+page.server.ts` da onboarding, `Button.svelte`, tokens, outras rotas.
7. Ao final de cada WP rodar (dentro do container Docker):
   `docker compose exec -T web yarn workspace @babyclothes/web check`
   `docker compose exec -T web yarn workspace @babyclothes/web test --run`
   e para o DS: `yarn workspace @babyclothes/design-system test --run` (ou o runner configurado).

### Tokens de referência (de `tokens.css`)

`--pk` / `--color-pink` `#FF3CAC` (acento, dot ativo, CTA) · `--color-pk-soft` `#FFE8F5` · `--color-pk-mid` `#FF85CC` (traço dos ícones) · `--color-pk-purple` `#B03EFF` (brilho) · `--sr` / `--font-cormorant` (título display; **hoje aliased para Lato** — ver nota 5.1) · `--font-lato` (corpo) · `--radius-md` `0.75rem` · `--radius-pill` `99rem` · `--transition-fast`.

Superfícies escuras usam rgba de branco literais (não há token dark): `rgba(255,255,255,.08)` (card), `.12` (borda card), `.25` (dot inativo), `.4` (skip), `.5` (descrição), `.8` (label da feature). Manter fiéis ao mock.

> **Nota 5.1 (fonte serifada):** `--sr`/`--font-cormorant` estão aliased para `--font-lato` em `tokens.css`. Usar o token `--sr` no título (intenção correta). Carregar Cormorant Garamond de verdade é **fora de escopo** aqui — se desejado, é uma tarefa separada de fontes; o token continua sendo o ponto de troca.

---

## WP1 — Redesenhar `OnboardingHero` (design-system pattern)

**Arquivo:** `packages/design-system/src/patterns/OnboardingHero/OnboardingHero.svelte` (reescrever completo).

### 1.1 Props (estender)

Adicionar `titleRest` e tipar `icon` pelos nomes conhecidos:

```ts
export interface OnboardingFeature {
  /** 'size' | 'age' | 'weight' | 'location' (fallback: nenhum ícone) */
  icon: string
  label: string
}

export interface OnboardingHeroProps {
  title: string
  titleAccent?: string
  titleRest?: string
  description: string
  features: OnboardingFeature[]
}
```

### 1.2 Template (código completo)

```svelte
<script lang="ts">
  export interface OnboardingFeature {
    icon: string
    label: string
  }

  export interface OnboardingHeroProps {
    title: string
    titleAccent?: string
    titleRest?: string
    description: string
    features: OnboardingFeature[]
  }

  let {
    title,
    titleAccent,
    titleRest,
    description,
    features,
  }: OnboardingHeroProps = $props()
</script>

{#snippet featureIcon(name: string)}
  {#if name === 'size'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <rect x="3" y="9" width="18" height="7" rx="2" /><path d="M7 9v3M11 9v2M15 9v3M19 9v2" />
    </svg>
  {:else if name === 'age'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  {:else if name === 'weight'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 12l4-5" /><circle cx="12" cy="12" r="1.5" fill="var(--color-pk-mid)" />
    </svg>
  {:else if name === 'location'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  {/if}
{/snippet}

<section class="onboardinghero">
  <div class="onboardinghero__illustration" aria-hidden="true">
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
      <circle cx="120" cy="96" r="82" fill="rgba(255,60,172,.08)" />
      <circle cx="120" cy="96" r="58" fill="rgba(255,60,172,.1)" />
      <path d="M120 52 C120 52 96 76 96 90 C96 103 106.7 111 120 111 C133.3 111 144 103 144 90 C144 76 120 52 120 52Z" fill="var(--pk)" />
      <circle cx="113" cy="90" r="3" fill="#fff" />
      <circle cx="127" cy="90" r="3" fill="#fff" />
      <path d="M113 99 Q120 104 127 99" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" />
      <g transform="translate(30,40)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <path d="M14 12 L18 9 H26 L30 12 L34 17 L30 20 L29 18 V33 H15 V18 L14 20 L10 17 Z" fill="var(--color-pk-soft)" stroke="var(--color-pk-mid)" stroke-width="1.2" />
      </g>
      <g transform="translate(168,34)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <rect x="10" y="18" width="24" height="9" rx="2" fill="var(--color-pk-purple)" />
        <path d="M14 18v4M19 18v3M24 18v4M29 18v3" stroke="#fff" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <g transform="translate(36,122)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <circle cx="22" cy="23" r="11" fill="none" stroke="var(--color-pk-mid)" stroke-width="2" />
        <path d="M22 23 L27 17" stroke="var(--pk)" stroke-width="2" stroke-linecap="round" />
        <circle cx="22" cy="23" r="2.4" fill="var(--pk)" />
      </g>
      <g transform="translate(162,122)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <path d="M22 11c-5 0-8.5 3.6-8.5 8 0 6 8.5 14 8.5 14s8.5-8 8.5-14c0-4.4-3.5-8-8.5-8z" fill="var(--pk)" />
        <circle cx="22" cy="19" r="3" fill="#fff" />
      </g>
      <path d="M78 66 Q96 70 102 78" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M164 60 Q146 68 140 78" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M82 140 Q98 124 106 110" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M160 140 Q142 124 134 110" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M120 22 l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="var(--color-pk-mid)" />
      <path d="M196 96 l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="rgba(255,255,255,.5)" />
      <path d="M42 96 l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="rgba(176,62,255,.7)" />
    </svg>
  </div>

  <div class="onboardinghero__content">
    <h1 class="onboardinghero__title">
      {title}{#if titleAccent}&nbsp;<em class="onboardinghero__accent">{titleAccent}</em>{/if}{#if titleRest}&nbsp;{titleRest}{/if}
    </h1>
    <p class="onboardinghero__description">{description}</p>
  </div>

  <div class="onboardinghero__features" role="list">
    {#each features as feature (feature.label)}
      <div class="onboardinghero__pill" role="listitem">
        <span class="onboardinghero__pill-icon" aria-hidden="true">{@render featureIcon(feature.icon)}</span>
        <span class="onboardinghero__pill-label">{feature.label}</span>
      </div>
    {/each}
  </div>
</section>
```

### 1.3 Estilos (substituir o `<style>` inteiro)

```css
.onboardinghero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.4rem;
}

.onboardinghero__illustration { flex-shrink: 0; }

.onboardinghero__content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 28rem;
}

.onboardinghero__title {
  font-family: var(--sr);              /* display/serif (ver nota 5.1) */
  font-size: 1.7rem;
  font-weight: 300;
  color: #fff;
  line-height: 1.15;
  margin: 0;
}

.onboardinghero__accent {
  font-style: normal;                  /* <em> sem itálico; cor faz o destaque */
  color: var(--pk);
}

.onboardinghero__description {
  font-family: var(--font-lato);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.65;
  margin: 0;
}

.onboardinghero__features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  width: 100%;
  max-width: 24rem;
}

.onboardinghero__pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.56rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.onboardinghero__pill-icon {
  display: inline-flex;
  flex-shrink: 0;
  line-height: 0;
}

.onboardinghero__pill-label {
  font-family: var(--font-lato);
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}
```

> Removido o `padding: 2rem 1.2rem` do container: o espaçamento externo passa a ser responsabilidade da rota (o hero deve ficar “solto” dentro do container escuro). Removido `:hover` das pílulas (não há hover no mock; e a tela é mobile/touch).

### 1.4 Stories — `OnboardingHero.stories.ts`

Atualizar args para nomes de ícone válidos e renderizar sobre fundo escuro (o pattern é dark-only):

```ts
const meta = {
  title: 'Patterns/OnboardingHero',
  component: OnboardingHero,
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    () => ({ template: '<div style="background:#140a12;padding:2rem;max-width:360px;"><story/></div>' }),
  ],
}

export const Default = {
  args: {
    title: 'Um agente que',
    titleAccent: 'garimpa',
    titleRest: 'o brechó por você',
    description: 'A IA procura roupas e itens ideais combinando tamanho, idade, peso e a sua localização.',
    features: [
      { icon: 'size', label: 'Tamanho' },
      { icon: 'age', label: 'Idade' },
      { icon: 'weight', label: 'Peso' },
      { icon: 'location', label: 'Localização' },
    ],
  },
}
```
(Adaptar a sintaxe do decorator ao runner de stories do repo — Svelte CSF. Se o projeto usa `@storybook/svelte` CSF3, aplicar o wrapper via `render`/decorator equivalente.)

### 1.5 Testes — `OnboardingHero.test.ts` (reescrever casos de ícone)

Os ícones agora são SVG, não texto. Ajustar:

```ts
const defaultProps = {
  title: 'Um agente que',
  titleAccent: 'garimpa',
  titleRest: 'o brechó por você',
  description: 'A IA procura...',
  features: [
    { icon: 'size', label: 'Tamanho' },
    { icon: 'age', label: 'Idade' },
    { icon: 'weight', label: 'Peso' },
    { icon: 'location', label: 'Localização' },
  ],
}
```

Casos obrigatórios:
- renderiza `title`, `titleAccent` (com classe `onboardinghero__accent`) e `titleRest`;
- **não** renderiza accent nem rest quando ausentes;
- renderiza os 4 labels; `getAllByRole('listitem')` = 4;
- **cada** pílula contém um `<svg>` (`container.querySelectorAll('.onboardinghero__pill svg').length === features.length`);
- ícone desconhecido não quebra: `features:[{icon:'zzz',label:'X'}]` renderiza a pílula sem `<svg>`;
- ilustração: `.onboardinghero__illustration svg` presente;
- `section.onboardinghero` presente.

**DoD WP1:** `check` + testes do DS verdes; Storybook renderiza os 4 ícones SVG (não texto) sobre fundo escuro; título com acento no meio.

---

## WP2 — (sem novo componente) Confirmar API do `OnboardingHero`

Não há componente novo. Este WP é o contrato entre WP1 e WP3: a rota passará `title`, `titleAccent`, `titleRest`, `description`, `features` (com `icon` ∈ {`size`,`age`,`weight`,`location`}). Se WP1 e WP3 forem para subagentes diferentes, este contrato é a fronteira. **DoD:** tipos exportados batem com o uso no WP3.

---

## WP3 — Reescrever a rota `apps/web/src/routes/onboarding/+page.svelte`

Adiciona brilho radial, dots de paginação e usa a nova API do hero. Mantém fundo escuro, skip, CTA e `finish()` (sem redirect automático).

```svelte
<script lang="ts">
  import { goto } from '$app/navigation'
  import { Button, OnboardingHero } from '@babyclothes/design-system'
  import { ArrowRight } from 'lucide-svelte'
  import { t } from '$lib/i18n'

  const STORAGE_KEY = 'bc_onboarded'

  const features = $derived([
    { icon: 'size' as const, label: $t('onboarding.features.size') },
    { icon: 'age' as const, label: $t('onboarding.features.age') },
    { icon: 'weight' as const, label: $t('onboarding.features.weight') },
    { icon: 'location' as const, label: $t('onboarding.features.location') },
  ])

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    goto('/agent')
  }
</script>

<svelte:head>
  <title>{$t('onboarding.title')} {$t('onboarding.title_accent')} | BabyClothes</title>
</svelte:head>

<div class="onboarding">
  <div class="onboarding__glow" aria-hidden="true"></div>

  <div class="onboarding__container">
    <a
      href="/agent"
      class="onboarding__skip"
      onclick={(event) => {
        event.preventDefault()
        finish()
      }}
    >
      {$t('onboarding.skip')}
    </a>

    <OnboardingHero
      title={$t('onboarding.title')}
      titleAccent={$t('onboarding.title_accent')}
      titleRest={$t('onboarding.title_rest')}
      description={$t('onboarding.description')}
      {features}
    />

    <div class="onboarding__dots" aria-hidden="true">
      <span class="onboarding__dot onboarding__dot--active"></span>
      <span class="onboarding__dot"></span>
      <span class="onboarding__dot"></span>
    </div>

    <div class="onboarding__footer">
      <Button variant="pk" size="lg" onclick={finish}>
        {$t('onboarding.cta')}
        <ArrowRight size={14} />
      </Button>
    </div>
  </div>
</div>

<style>
  .onboarding {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #0f0f0f 0%, #1a0814 60%, #0a0a1a 100%);
    padding: 1.6rem;
  }

  .onboarding__glow {
    position: absolute;
    top: -4.5rem;
    left: -3rem;
    width: 18rem;
    height: 18rem;
    background: radial-gradient(circle, rgba(176, 62, 255, 0.18) 0%, transparent 65%);
    pointer-events: none;
  }

  .onboarding__container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 24rem;
    width: 100%;
    gap: 1.4rem;
  }

  .onboarding__skip {
    align-self: flex-end;
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .onboarding__skip:hover,
  .onboarding__skip:focus-visible {
    color: rgba(255, 255, 255, 0.7);
  }

  .onboarding__dots {
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .onboarding__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
  }

  .onboarding__dot--active {
    width: 18px;
    border-radius: 99rem;
    background: var(--pk);
  }

  .onboarding__footer {
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .onboarding__footer :global(button) {
    width: 100%;
  }
</style>
```

**Notas de implementação:**
- A ordem vertical do mock é: Skip → ilustração → título → descrição → features → **dots** → (espaçador) → CTA. Com `gap` no container e o `flex:1` do mock substituído por layout centralizado, os dots ficam **entre** features e CTA (como no mock). Se o subagente preferir empurrar o CTA para o rodapé (mock usa `flex:1`), envolver hero+dots num wrapper e dar `margin-top:auto` ao `__footer` — opcional; o centralizado é aceitável em telas altas.
- `title` no `<svelte:head>` deve continuar traduzido.

**DoD WP3:** rota renderiza sobre fundo escuro com brilho roxo topo-esquerda; hero com ícones SVG; 3 dots (1º rosa alongado); CTA rosa full-width com seta; "Pular" e CTA levam a `/agent`; nenhum redirect automático.

---

## WP4 — Verificação e paridade visual

1. **Type + testes:**
   - `docker compose exec -T web yarn workspace @babyclothes/web check` (0 novos erros).
   - `docker compose exec -T web yarn workspace @babyclothes/web test --run` (verde).
   - Testes do design-system verdes.
2. **i18n:** conferir que en e pt renderizam corretos (título com acento no meio em ambos: "An agent that **finds** thrift deals for you" / "Um agente que **garimpa** o brechó por você").
3. **Sem emojis / sem texto de ícone:** garantir que as pílulas mostram SVG, não a string do nome (`size`/`age`/…).
4. **A11y:** `Pular` focável e com `:focus-visible`; ilustração e dots `aria-hidden`; features `role="list"`/`listitem`; contraste do texto branco sobre fundo escuro OK.
5. **Paridade visual (Playwright):** abrir `/onboarding` autenticado (registrar usuário novo leva à rota), tirar screenshot 360–390px de largura e comparar com a tela 03 do mock. Checklist: brilho roxo, mascote+cards, título serif com acento rosa, 4 cards escuros translúcidos com ícone rosa, 3 dots, botão rosa.

**DoD WP4:** todos os itens acima confirmados; screenshot anexado à PR.

---

## Ordem de execução

```
WP1 (OnboardingHero) ──► WP3 (rota)
WP2 (contrato) é a fronteira entre WP1 e WP3 (se paralelizar)
WP3 ──► WP4 (verificação)
```

Se um único subagente executar tudo: WP1 → WP3 → WP4 em sequência (WP2 é só o contrato de tipos).

## Fora de escopo (não fazer)

- Carregar fonte serifada real (Cormorant Garamond) — token `--sr` fica como ponto de troca (nota 5.1).
- Reintroduzir qualquer redirect automático para `/agent`.
- Tornar o onboarding um carrossel de 3 telas — os dots são indicador estático (a tela é única).
- Alterar `+page.server.ts`, `Button`, tokens ou i18n (chaves já existem).
