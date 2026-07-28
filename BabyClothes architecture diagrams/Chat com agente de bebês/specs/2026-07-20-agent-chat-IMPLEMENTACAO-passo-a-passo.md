# Implementação passo-a-passo — Chat do agente (`/agent`) vs mock 04/05/07

> Data: 2026-07-20 · Para: **execução literal por um modelo simples**. Cada tarefa é um *find & replace* com
> **ANTES** (código que existe hoje) e **DEPOIS** (código a colar). Não interpretar, não improvisar: copiar exatamente.
> Base visual: `BabyClothes Chat Mocks.dc.html` telas 04/05/07. Base de código: monorepo `babyclothes`.

## Como trabalhar (leia antes)

1. Uma tarefa por vez, na ordem (T1 → T12). Depois de cada tarefa rodar:
   `docker compose exec -T web yarn workspace @babyclothes/web check`
2. Só edite os arquivos citados. Não renomeie classes. Não mexa em lógica que não está no bloco DEPOIS.
3. Se o bloco ANTES não bater 100% com o arquivo, PARE e não altere nada nessa tarefa (avise).
4. Prioridades: **P0 = tela quebrada (usuário não vê input nem respostas)**; **P1 = fidelidade visual**.

## Diagnóstico (validado no navegador em 2026-07-20)

- **O input não aparece** porque há `height:100vh` aninhado: `+layout.svelte` renderiza `AgentTopBar` (~60px) e depois `<main class="app-main">`; dentro, `apps/web/src/routes/agent/+page.svelte` usa `.agent-page{height:100vh}`. Ou seja, a página tem 1 viewport inteira **abaixo** de um header de ~60px, então o rodapé (input) fica fora da tela e é cortado por `overflow:hidden`. → **T1**.
- **As respostas do agente "somem"** ao enviar mensagem porque não há *auto-scroll*; a bolha nova entra no fim da lista, abaixo da área visível. → **T2**.
- **O avatar do topbar é o octocat do GitHub** (o `path` do SVG é o logo do GitHub), não a gota rosa. O mesmo octocat está nos avatares das mensagens. → **T3**.
- **O "online" aparece gigante** e o avatar "MC" fica cortado porque o CSS usa `font:` shorthand **inválido** (`font: 0.8rem 700 …` — tamanho antes do peso é inválido, o browser descarta a regra inteira). → **T4**.

---

# P0 — Corrigir a tela quebrada

## T1 — Consertar altura aninhada (input volta a aparecer)

### T1.a — `apps/web/src/routes/agent/+page.svelte`
**ANTES**
```css
  .agent-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--of);
  }
```
**DEPOIS**
```css
  .agent-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--of);
  }
```

### T1.b — `apps/web/src/routes/agent/+page.svelte` (mesmo arquivo)
**ANTES**
```css
  .agent-page__messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.2rem;
```
**DEPOIS**
```css
  .agent-page__messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 1.2rem;
```

### T1.c — `apps/web/src/routes/+layout.svelte`
**ANTES**
```css
  .app-main {
    flex: 1;
    padding-bottom: 0;
  }
```
**DEPOIS**
```css
  .app-main {
    flex: 1;
    min-height: 0;
    padding-bottom: 0;
  }

  .app-shell--chat .app-main {
    display: flex;
    flex-direction: column;
  }
```
**Por quê:** `.agent-page{height:100%}` só preenche se o `<main>` for um contêiner de altura definida em coluna flex. As três alterações juntas fazem a lista rolar por dentro e o input ficar fixo no rodapé visível.

**Validação T1:** abrir `/agent` numa viewport 390×840 → o input (campo + botão de enviar) fica visível no rodapé, sem corte.

---

## T2 — Auto-scroll para a última mensagem

`apps/web/src/routes/agent/+page.svelte`.

### T2.a — No `<script>`, logo após `const isTyping = $derived(chatState === 'streaming')`, ADICIONAR:
```ts
  let messagesEl = $state<HTMLDivElement>()

  $effect(() => {
    // reexecuta quando chega mensagem nova ou o "digitando" muda
    messages.length
    isTyping
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight
    }
  })
```

### T2.b — No template, no elemento da lista de mensagens.
**ANTES**
```svelte
  <div class="agent-page__messages">
```
**DEPOIS**
```svelte
  <div class="agent-page__messages" bind:this={messagesEl}>
```
**Validação T2:** clicar em "Yes"/"Sim", preencher e salvar; ao enviar uma busca, a resposta do agente aparece e a lista rola sozinha até ela.

---

## T3 — Trocar o avatar octocat pela gota rosa

O path a REMOVER (octocat) começa com `M10 0C4.48 0 0 4.48 0 10c0 4.42…`.
O path CORRETO (gota) é: `M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z`

### T3.a — `packages/design-system/src/patterns/AgentTopBar/AgentTopBar.svelte`
**ANTES**
```svelte
      <svg viewBox="0 0 20 24" width="16" height="20" fill="none">
        <path
          d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0110 4.84c.85.004 1.71.12 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0020 10c0-5.52-4.48-10-10-10z"
          fill="#FF3CAC"
        />
      </svg>
```
**DEPOIS**
```svelte
      <svg viewBox="0 0 20 24" width="12" height="15" fill="none">
        <path
          d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z"
          fill="#FF3CAC"
        />
      </svg>
```

### T3.b — `apps/web/src/routes/agent/+page.svelte`
Há **vários** SVGs de avatar iguais (nas linhas dos componentes: choiceChips, childForm, dueDate, suggestions, e na linha da mensagem do agente). Em CADA um, o `<path>` é o octocat. Trocar TODOS por gota. O bloco repetido é:

**ANTES (repete-se várias vezes)**
```svelte
                  <svg viewBox="0 0 20 24" width="14" height="17" fill="none">
                    <path d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0110 4.84c.85.004 1.71.12 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0020 10c0-5.52-4.48-10-10-10z" fill="#FF3CAC"/>
                  </svg>
```
**DEPOIS (usar em todas as ocorrências)**
```svelte
                  <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                    <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                  </svg>
```
> Dica: procure no arquivo por `M10 0C4.48` — cada resultado é um octocat a trocar. Ao final não pode sobrar nenhum `M10 0C4.48` no repositório (`grep -rn "M10 0C4.48" apps packages/design-system/src` deve dar vazio).

**Validação T3:** avatar do topbar e das mensagens mostram a gota rosa, sem logo do GitHub.

---

## T4 — Corrigir `font:` shorthand inválido no `AgentTopBar`

`packages/design-system/src/patterns/AgentTopBar/AgentTopBar.svelte`. Quatro regras usam shorthand inválido (tamanho antes do peso). Trocar por longhand.

**ANTES**
```css
  .agenttopbar__name {
    font: 0.8rem 700 var(--font-lato, 'Lato', sans-serif);
    color: var(--bk, #111111);
  }
```
**DEPOIS**
```css
  .agenttopbar__name {
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--bk, #111111);
  }
```

**ANTES**
```css
  .agenttopbar__status-indicator {
    font: 0.62rem 700 var(--font-lato, 'Lato', sans-serif);
  }
```
**DEPOIS**
```css
  .agenttopbar__status-indicator {
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.62rem;
    font-weight: 700;
  }
```

**ANTES**
```css
  .agenttopbar__badge {
    position: absolute;
    top: -0.2rem;
    right: -0.2rem;
    background: var(--color-pk, #FF3CAC);
    color: #fff;
    font: 0.5rem 700 var(--font-lato, 'Lato', sans-serif);
```
**DEPOIS**
```css
  .agenttopbar__badge {
    position: absolute;
    top: -0.2rem;
    right: -0.2rem;
    background: var(--color-pk, #FF3CAC);
    color: #fff;
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.5rem;
    font-weight: 700;
```

**ANTES**
```css
    background: var(--color-pk, #FF3CAC);
    color: #fff;
    border: none;
    cursor: pointer;
    font: 0.6rem 700 var(--font-lato, 'Lato', sans-serif);
    display: flex;
```
**DEPOIS**
```css
    background: var(--color-pk, #FF3CAC);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.6rem;
    font-weight: 700;
    display: flex;
```
**Validação T4:** "online" fica pequeno (0.62rem), nome do agente 0.8rem, avatar "MC" inteiro (sem corte na direita).

---

# P1 — Fidelidade visual ao mock

> Referência CSS exata do mock (não mudar valores): use as tabelas ANTES/DEPOIS abaixo.

## T5 — Avatar das mensagens: fundo preto (como o mock `.msg-avatar`)

Mock `.msg-avatar`: `width:24px;height:24px;border-radius:50%;background:#111` com a gota rosa dentro.
`apps/web/src/routes/agent/+page.svelte`:

**ANTES**
```css
  .agent-page__av {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: #FFE8F5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
```
**DEPOIS**
```css
  .agent-page__av {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
  }
```

## T6 — Choice chips iguais ao mock

Mock `.choice-chip`: fundo **branco**, borda `1.5px #EDE9E4`, texto `#374151` `.78rem`/**700**, pill.
`.choice-chip--primary`: borda/texto `#FF3CAC` + `box-shadow:0 2px 8px rgba(255,60,172,.12)`.
`.choice-chip--selected`: fundo `#FF3CAC`, texto `#fff`, `box-shadow:0 2px 8px rgba(255,60,172,.25)`.

`packages/design-system/src/composites/ChoiceChipGroup/ChoiceChipGroup.svelte`:

**ANTES**
```css
  .choicechipgroup__chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.45rem 0.9rem;
    border: 0.1rem solid #EDE9E4;
    border-radius: 99rem;
    background: transparent;
    color: #374151;
    font-family: var(--font-lato);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;
  }
```
**DEPOIS**
```css
  .choicechipgroup__chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.55rem 1rem;
    border: 0.09rem solid #EDE9E4;
    border-radius: 99rem;
    background: #fff;
    color: #374151;
    font-family: var(--font-lato);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;
  }
```

**ANTES**
```css
  .choicechipgroup__chip--primary {
    border-color: var(--color-pink);
    color: var(--color-pink);
  }
```
**DEPOIS**
```css
  .choicechipgroup__chip--primary {
    border-color: var(--color-pink);
    color: var(--color-pink);
    box-shadow: 0 2px 8px rgba(255, 60, 172, 0.12);
  }
```

**ANTES**
```css
  .choicechipgroup__chip--selected {
    background: var(--color-pink);
    border-color: var(--color-pink);
    color: #fff;
  }
```
**DEPOIS**
```css
  .choicechipgroup__chip--selected {
    background: var(--color-pink);
    border-color: var(--color-pink);
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 60, 172, 0.25);
  }
```

## T7 — Card do formulário igual ao mock

Mock `.agent-form-card`: borda `1.5px #FFD0ED`, radius **14px**, padding **14px**, `box-shadow:0 2px 12px rgba(255,60,172,.1)`.
Mock `.form-card-title`: `.72rem`/700. Mock `.ia-badge`: `padding:2px 8px; font-size:.6rem; background:#111`.

`packages/design-system/src/composites/AgentFormCard/AgentFormCard.svelte`:

**ANTES**
```css
  .agentformcard {
    background: #fff;
    border: 0.075rem solid #FFD0ED;
    border-radius: 1.4rem;
    padding: 1.4rem;
    width: 100%;
  }
```
**DEPOIS**
```css
  .agentformcard {
    background: #fff;
    border: 0.1rem solid #FFD0ED;
    border-radius: 0.875rem;
    padding: 0.875rem;
    width: 100%;
    box-shadow: 0 2px 12px rgba(255, 60, 172, 0.1);
  }
```

**ANTES**
```css
  .agentformcard__title {
    font-family: var(--font-lato);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--bk);
    margin: 0;
  }
```
**DEPOIS**
```css
  .agentformcard__title {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--bk);
    margin: 0;
  }
```

## T8 — Inputs do formulário: radius do grupo e placeholders

Mock `.input-group`/`.text-input`: radius **10px**; sufixo com fundo `#F3F4F6`. O componente já está próximo; ajustar só o radius.

`packages/design-system/src/patterns/ChildInlineForm/ChildInlineForm.svelte`:

**ANTES**
```css
  .childinlineform__input-group {
    display: flex;
    align-items: center;
    background: var(--color-white);
    border: 0.075rem solid #D1D5DB;
    border-radius: 0.5rem;
    overflow: hidden;
```
**DEPOIS**
```css
  .childinlineform__input-group {
    display: flex;
    align-items: center;
    background: var(--color-white);
    border: 0.1rem solid #D1D5DB;
    border-radius: 0.625rem;
    overflow: hidden;
```

**(opcional, fidelidade)** Passar placeholders do mock pelo lado da rota `apps/web/src/routes/agent/+page.svelte` só é possível se `ChildInlineForm` aceitar `placeholders`. Como hoje NÃO aceita, deixar sem placeholder (aceitável). Não inventar prop nova sem pedir.

## T9 — Barra de input igual ao mock (campo pill cinza, sem botão "+")

Mock `.chat-input-bar`: fundo branco, `border-top:1px #F3F4F6`, sem card/borda ao redor; `.chat-input-field` cinza `#F3F4F6` pill; botão enviar preto `#111` 36px. O componente atual (`ChatInput`) tem card com borda e um botão "+" que **não existe no mock**.

`packages/design-system/src/composites/ChatInput/ChatInput.svelte`:

### T9.a — Só mostrar o botão "+" quando `onadd` for passado (a rota não passa).
**ANTES**
```svelte
    <button
      class="chat-input__add-btn"
      type="button"
      onclick={onadd}
      aria-label="Adicionar"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
```
**DEPOIS**
```svelte
    {#if onadd}
      <button
        class="chat-input__add-btn"
        type="button"
        onclick={onadd}
        aria-label="Adicionar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    {/if}
```

### T9.b — Contêiner sem card (borda) e campo cinza pill.
**ANTES**
```css
  .chat-input {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    background: var(--color-white);
    border: 0.15rem solid #EDE9E4;
    border-radius: 1rem;
    padding: 1rem 1.2rem;
  }
```
**DEPOIS**
```css
  .chat-input {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    background: var(--color-white);
    border: none;
    border-top: 0.06rem solid #F3F4F6;
    border-radius: 0;
    padding: 0.65rem 0.75rem 1rem;
  }
```

**ANTES**
```css
  .chat-input__textarea {
    flex: 1;
    border: 0.075rem solid #D1D5DB;
    border-radius: 1.25rem;
    outline: none;
    background: transparent;
    padding: 0.65rem 1rem;
```
**DEPOIS**
```css
  .chat-input__textarea {
    flex: 1;
    border: none;
    border-radius: 99rem;
    outline: none;
    background: #F3F4F6;
    padding: 0.65rem 1rem;
```

> **Decisão de cor do botão enviar:** o mock usa botão preto (`#111`); o app usa rosa (`--pk`). NÃO trocar sem confirmação — deixar como está (rosa) e registrar como pendência de decisão.

## T10 — (opcional) Ícones nos choice chips (check no "Sim", coração no "Bebê a caminho")

Requer estender `ChoiceChipOption` com `icon?: 'check' | 'heart'` e renderizar um SVG antes do label no `ChoiceChipGroup`. Como é mudança de API do design-system, **só fazer com aprovação**. Sem isso, os chips ficam sem ícone (fidelidade parcial aceitável).

---

# Verificação final (T11)

1. `docker compose exec -T web yarn workspace @babyclothes/web check` → 0 novos erros.
2. `docker compose exec -T web yarn workspace @babyclothes/web test --run` → verde.
3. `grep -rn "M10 0C4.48" apps packages/design-system/src` → **vazio** (nenhum octocat).
4. Playwright 390×840, autenticado, indo até `/agent`:
   - Topbar: gota rosa + dot verde, "AI Assistant" (0.8rem), "online" pequeno verde, sino, avatar "MC" inteiro.
   - Mensagens: bolha do agente branca/texto escuro; **input visível no rodapé**.
   - Clicar "Yes" → stepper; salvar filho → sugestões; enviar → **resposta do agente aparece e rola sozinha** (T2).
5. `/chat` continua igual (T-nenhuma mexeu no `surface="dark"` default do `ChatBubble`).

# Não fazer

- Não alterar `IntakeMachine.ts`, `+page.server.ts`, rotas de marketplace.
- Não trocar a cor do botão enviar (T9) nem adicionar ícones nos chips (T10) sem aprovação.
- Não mexer no default `surface="dark"` do `ChatBubble` (quebraria `/chat`).
