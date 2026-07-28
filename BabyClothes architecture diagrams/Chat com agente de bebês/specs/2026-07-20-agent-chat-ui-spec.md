# Spec detalhada — UI da rota `/agent` (telas 04, 05, 07) e seus componentes

> Data: 2026-07-20 · Base visual: `BabyClothes Chat Mocks.dc.html` — telas
> `04 — /agent · filhos?` (linhas 303–364), `05 — /agent · form filhos` (367–472), `07 — /agent · sugestões` (551–620).
> Base de código: monorepo `babyclothes`. Formato: **work packages (WP1–WP8)** para delegação a subagente.
> Objetivo: alinhar a implementação atual do chat do agente (já existente) ao mock, nos três estados pedidos.

---

## 0. Contexto e estado atual

As telas 04/05/07 **não são rotas distintas** — são três estados da **mesma** tela `/agent`, dirigida por uma máquina de intake conversacional já existente:

- Rota: `apps/web/src/routes/agent/+page.svelte` (+ `+page.server.ts`, guard de sessão — **não mexer**).
- Máquina de estado: `apps/web/src/lib/application/chat/IntakeMachine.ts` (steps: `ask_has_children` → `ask_children_count` → `fill_child_form` → `ask_due_date` → `explain_platform` → `ask_search_intent` → `free_chat`). **A lógica dos steps já cobre 04/05/07** — este spec é de **UI/paridade visual**, não de máquina de estado.
- Componentes do design-system já usados pela rota: `ChatHeader`, `ChatBubble`, `ChoiceChipGroup`, `AgentFormCard`, `ChildInlineForm`, `MonthPicker`, `ChatInput`. Já existem também `AgentTopBar`, `Chip`, `Avatar`, `Badge`, `DotIndicator`.
- i18n: `apps/web/src/lib/i18n/{en,pt}.json` → bloco `agent` (intake/suggestions/form/topbar) **já existe** — este spec só **acrescenta** as chaves faltantes (WP7).

### 0.1 Tema: o mock 04/05/07 é CLARO

As três telas usam `phone-frame` **claro** (`background:#F8F5F2`), diferente do onboarding (03) que é escuro. Valores exatos do mock (para referência de todos os WPs):

| Elemento | Mock (CSS exato) |
|---|---|
| Fundo da tela | `#F8F5F2` (`--of`) |
| Topbar | `rgba(255,255,255,.95)`, blur 12px, borda inferior `#F3F4F6` |
| Bubble agente | `background:#fff`; radius `12px 12px 12px 3px`; `box-shadow:0 1px 4px rgba(0,0,0,.06)`; texto `#111` `.78rem` line-height 1.5 |
| Bubble usuário | `background:#111`; radius `12px 12px 3px 12px`; texto **branco** (`--inv`) `.78rem` |
| System pill | `background:#FFE8F5`; radius `99rem`; padding `4px 12px`; texto `#FF3CAC` `.65rem` |
| choice-chip | `background:#fff`; borda `1.5px #EDE9E4`; texto `#374151` `.78rem`/700; pill. **--primary**: borda+texto `#FF3CAC`, `box-shadow:0 2px 8px rgba(255,60,172,.12)`. **--selected**: mesmo do primary (chip escolhido) |
| suggestion-chip | `background:#fff`; borda `1.5px #EDE9E4`; texto `#374151` `.75rem`/700; pill. **--primary**: `background:#FFE8F5`, borda `#FFD0ED`, texto `#FF3CAC` |
| agent-form-card | `background:#fff`; borda `1.5px #FFD0ED`; radius 14px; `box-shadow:0 2px 12px rgba(255,60,172,.1)`; `margin-left:30px` |
| chat-input-field | `background:#F3F4F6`; pill; placeholder `#9CA3AF` `.78rem` |
| agent-avatar (topbar) | 32px círculo `#111`, gota rosa dentro, `online-dot` (verde, pulsa quando ativo) |
| msg-avatar (nas mensagens) | ~24px, gota rosa `#FF3CAC`; nas bubbles subsequentes do MESMO autor, espaço vazio 24px (sem repetir avatar) |
| user-avatar (topbar) | 32px círculo, gradiente `135deg,#FF3CAC,#B03EFF`, iniciais `MC` `.62rem`/700 brancas |
| typing | 3 pontos `#FF3CAC` 6px, animação `bc-bounce` escalonada (.1s/.2s) |

### 0.2 Desvios mock × código atual (o que este spec corrige)

| # | Área | Mock | Código atual | WP |
|---|------|------|--------------|----|
| 1 | Tema do chat | Claro (bubble agente branco/texto escuro; bubble usuário preto/texto branco) | `ChatBubble` é **escuro** (agente translúcido/texto branco) → invisível em fundo claro | WP1 |
| 2 | Topbar | Gota+status, sino c/ badge, avatar usuário `MC`, detalhe "· Sofia: M" | Usa `ChatHeader` (pill "LIVE" + 3 pontinhos) | WP2 |
| 3 | Tags de debug | — | Renderiza `component:ChoiceChips`, `component:ChildForm`, `component:DueDate` **visíveis na UI** | WP3 |
| 4 | Avatar da mensagem | Gota pequena ~24px; some em bubbles consecutivas do mesmo autor | Quadrado preto 2.6rem com ícone `Droplets`, repetido em toda linha do agente | WP3 |
| 5 | System pills / divisor de data | "Hoje · 10:30", "Sofia cadastrada · …", "Buscando … São Paulo…" | Ausentes | WP4/WP6 |
| 6 | Chips 04 | Sim (primary + check), Não, Bebê a caminho (+ coração roxo) | Sem ícones nos chips | WP4 |
| 7 | Stepper 05 | 1/2/3+ com selecionado rosa | choiceChips sem estado "selecionado" persistido | WP5 |
| 8 | Typing 07 | Pontos **rosa** | Pontos escuros `rgba(0,0,0,.22)` | WP6 |
| 9 | Sugestões 07 | Label "Sugestões" + 5 chips estilo `suggestion-chip` | `ChoiceChipGroup tone="soft" size="sm"` (aproximado) | WP6 |

---

## Regras globais (todos os WPs)

1. **Svelte 5 runes**; nunca `export let`. Snippets via `{#snippet}`/`{@render}`.
2. **Sem emojis**; ícones de `lucide-svelte` (web) ou SVG inline (DS), como no mock.
3. **CSS**: tokens de `@babyclothes/design-system/tokens.css`; BEM; `<style>` scoped.
4. **i18n**: todo texto via `$t()`. Nunca hardcodar PT/EN em componente/rota.
5. **DS**: componente novo = `.svelte` + `index.ts` + `.stories.ts` + `.test.ts` + export em `packages/design-system/src/index.ts`.
6. **Blast radius**: `ChatBubble` e `ChatHeader` também são usados por `apps/web/src/routes/chat/+page.svelte`. Qualquer mudança nesses componentes **não pode** quebrar `/chat` — usar prop de variação (ver WP1), nunca alterar o default silenciosamente. **Não editar** `+page.server.ts`, `IntakeMachine.ts`, rotas de marketplace.
7. Rodar ao fim de cada WP:
   `docker compose exec -T web yarn workspace @babyclothes/web check`
   `docker compose exec -T web yarn workspace @babyclothes/web test --run`
   e testes do design-system.

### Tokens de referência
`--pk #FF3CAC` · `--color-pk-soft #FFE8F5` · `--color-pk-mid #FF85CC` · `--color-pk-purple/#B03EFF` · `--bk #0A0A0A` (mock usa `#111`) · `--of #F8F5F2` · cinzas: texto `#374151`, secundário `#9CA3AF`, borda `#EDE9E4`, borda rosa clara `#FFD0ED`, input `#F3F4F6` · sucesso `#22C55E` · fontes `--font-lato`, `--sr`.

---

## WP1 — Tema claro do chat (`ChatBubble` + fundo da rota)

**Problema:** `ChatBubble` está escuro; `/agent` precisa do tema claro do mock; `/chat` pode depender do atual.

### 1.1 `packages/design-system/src/patterns/ChatBubble/ChatBubble.svelte`
Adicionar prop `surface: 'light' | 'dark' = 'dark'` (default mantém `/chat` intacto). Regras por surface:

- `surface="light"` (mock 04/05/07):
  - `--agent`: `background:#fff`; `color:#111`; `border-radius:12px 12px 12px 3px`; `box-shadow:0 1px 4px rgba(0,0,0,.06)`; sem borda; `max-width:80%`.
  - `--user`: `background:#111`; `color:#fff`; `border-radius:12px 12px 3px 12px`; `max-width:75%`.
  - `--system`: `background:#FFE8F5`; `color:#FF3CAC`; `border-radius:99rem`; `padding:4px 12px`; `font-size:.65rem`; `align-self:center`.
  - Texto: `font-family:var(--font-lato)`; `.78rem`; line-height 1.5. Hora (`__time`): `.6rem`, `#9CA3AF` (agente) / `rgba(255,255,255,.6)` (usuário).
- `surface="dark"`: manter estilos atuais.

Implementar via `class:chat-bubble--light`/`--dark` no root + blocos CSS separados. **Testes:** renderiza classe correta por `surface`; default é `dark`.

### 1.2 Fundo da rota
`.agent-page` deve ter `background: var(--of)` (`#F8F5F2`). Passar `surface="light"` em **todas** as instâncias de `ChatBubble` da rota (agente, usuário e as system pills do WP4/WP6).

**DoD WP1:** bubbles do agente legíveis (branco/texto escuro) e do usuário pretos/texto branco em `/agent`; `/chat` inalterado (screenshot antes/depois).

---

## WP2 — Topbar do agente → `AgentTopBar`

Trocar `ChatHeader` por `AgentTopBar` (já existe e bate com o mock: gota + status-dot, nome, status + `statusDetail`, sino com `unreadCount`, avatar de iniciais).

### 2.1 Na rota
```svelte
<AgentTopBar
  agentName={$t('agent.topbar.name')}
  status={isTyping ? 'typing' : 'online'}
  statusLabel={isTyping ? $t('agent.topbar.typing') : $t('agent.topbar.online')}
  statusDetail={children[0] ? `· ${children[0].name}: ${sizeLabel(children[0])}` : undefined}
  unreadCount={1}
  userInitials={initials(session?.name)}
  onNotifications={() => goto('/notifications')}
  onProfile={() => goto('/account')}
/>
```
- `initials(name)`: 2 primeiras iniciais (ex.: "Maria Clara" → "MC"); fallback "?".
- `sizeLabel(child)`: rótulo de tamanho estimado (ex.: "M"). Se ainda não houver cálculo, usar campo já disponível no domínio `Child` ou omitir `statusDetail` até existir (não inventar).
- **Verificar** se `+layout.svelte` já renderiza um topbar para a rota `/agent` (ele importa `AgentTopBar`). Se sim, **não** duplicar: a rota não deve renderizar outro header. Decidir 1 único ponto de render (preferência: layout para `/agent`, ou página — nunca os dois).

**DoD WP2:** topbar idêntico ao mock (gota+dot, nome "Assistente IA", "online", detalhe do filho, sino com pontinho rosa, avatar `MC`); um único header.

---

## WP3 — Limpeza das mensagens (tags de debug + avatar)

Na rota `/agent/+page.svelte`:

1. **Remover** todos os `<span class="agent-page__chunk-tag">component:XXX</span>` (ChoiceChips, ChildForm, DueDate, Carousel, ItemList, GrowthAlert, e o heading via tag). O heading "Sugestões" do WP6 vira label próprio (não a tag de debug).
2. **Avatar da mensagem**: substituir o `.agent-page__av` (2.6rem, `--bk`, `Droplets`) pelo padrão do mock `msg-avatar` (~24px, círculo/quadrado claro com gota rosa `#FF3CAC`). Regras:
   - Só a **primeira** bubble de uma sequência do agente mostra avatar; as seguintes usam espaçador vazio `width:24px` (como no mock, linhas 338–339).
   - Bubble do usuário: sem avatar na coluna (mock alinha à direita).
3. **Layout de linha**: `msg-row` com `gap:8px`, avatar + bubble; `--user` alinhado à direita. Ajustar `.agent-page__row` para largura/gaps do mock (`.78rem` de fonte, bolhas até 80%/75%).

**DoD WP3:** nenhuma string `component:` na UI; avatar pequeno de gota, sem repetição em bolhas consecutivas.

---

## WP4 — Estado 04 (`ask_has_children`)

Mensagens (já geradas pela máquina): saudação + "Pra começar: você tem filhos?" + chips.

1. **Divisor de data** no topo das mensagens: system pill "Hoje · HH:MM" (`agent.system.today` + hora). Renderizar como `ChatBubble role="system" surface="light"` centralizado, ou um pequeno componente `SystemPill` (opcional; ver WP7 nota).
2. **Choice chips** (`ChoiceChipGroup`): opções `Sim` (primary), `Não`, `Bebê a caminho`. Fidelidade de ícones (mock):
   - `Sim` (primary): ícone check (lucide `Check`) antes do label.
   - `Bebê a caminho`: ícone coração roxo (lucide `Heart`, `#B03EFF`).
   - Requer estender `ChoiceChipOption` com `icon?: Snippet` (ou `iconName?`) e o `ChoiceChipGroup`/`Chip` já suportam `prefixIcon`. Se não quiser tocar no DS agora, entregar **sem** ícones (aceitável como fidelidade parcial) e registrar como follow-up.
3. **Chat input**: placeholder "Ou responda por aqui..." (`agent.intake.choice_placeholder`) enquanto há chips ativos; senão o placeholder padrão.

**DoD WP4:** tela 04 com pill de data, três chips (Sim destacado), input com placeholder correto.

---

## WP5 — Estado 05 (`ask_children_count` + `fill_child_form`)

1. **Stepper 1/2/3+** (`ChoiceChipGroup`): após escolha, o chip escolhido fica **selecionado** (estilo primary/`--selected` do mock) e persiste na conversa (não some). Garantir que `ChoiceChipGroup` reflete `value` selecionado visualmente (usar `value` bindável já existente).
2. **AgentFormCard + ChildInlineForm**: conferir paridade com o mock (grid 2 col, 6 campos, nesta ordem e unidades):
   | Campo | Placeholder | Sufixo |
   |---|---|---|
   | Nome | Sofia | — |
   | Idade | 8 | meses |
   | Altura | 68 | cm |
   | Peso | 7,4 | kg |
   | Altura ao nascer | 50 | cm |
   | Peso ao nascer | 3.500 | g |
   - Botão "Salvar criança" (`agent.form.submit`), largura total, rosa (`btn-primary--sm`).
   - Card: fundo branco, borda `1.5px #FFD0ED`, radius 14px, sombra rosa, `margin-left:30px` (alinha sob a bolha do agente). Confirmar que `AgentFormCard` aplica esse estilo; se não, ajustar o `AgentFormCard` (blast radius: usado só aqui? verificar antes).
   - **Bug atual a corrigir**: no `onSubmit` da rota, `currentWeightKg` é descartado (`''`). Mapear o peso atual do form para o input do domínio.

**DoD WP5:** stepper com selecionado persistente; form card idêntico ao mock (campos/ordem/sufixos/placeholder/botão); peso atual não é perdido.

---

## WP6 — Estado 07 (`ask_search_intent` + envio)

1. **System pill de contexto** após salvar filho: "{Nome} cadastrada · {idade} meses · tamanho {M}" (`agent.system.child_saved`, ver WP7). Renderizar como bubble system claro.
2. **Mensagem de intent** (já existe): "Tudo pronto! Agora me conta: o que você quer encontrar…".
3. **Bloco de sugestões**: label "Sugestões" (`.62rem`/700, uppercase, `letter-spacing:.1em`, `#9CA3AF`) + 5 chips `suggestion-chip`:
   - `Bodies tamanho M` (**primary**: `#FFE8F5`/borda `#FFD0ED`/texto `#FF3CAC`), `Roupas de inverno`, `Look para festa`, `Pijamas confortáveis`, `Próximo tamanho (G)`.
   - Manter via `ChoiceChipGroup` mas garantir o **visual** do `suggestion-chip` (fundo branco, borda `#EDE9E4`, `.75rem`; primary rosa-soft). Se `tone="soft"` do `ChoiceChipGroup` não bater exatamente, adicionar `tone="suggestion"` ou ajustar tokens do tone soft (verificar reuso).
   - Alinhamento: bloco com `padding-left:30px` (sob a bolha do agente), `flex-wrap`.
4. **Eco do usuário**: ao escolher, adicionar bubble do usuário (preta) com o label (já implementado).
5. **Typing indicator**: pontos **rosa** `#FF3CAC` (trocar `rgba(0,0,0,.22)`), animação `bc-bounce` escalonada; bolha estilo agente claro.
6. **System pill de busca**: "Buscando {query} em brechós perto de {cidade}…" (`agent.system.searching`, ver WP7). Aparece enquanto `chatState === 'streaming'` na primeira busca.

**DoD WP6:** tela 07 com pill de cadastro, sugestões (1 primary), eco do usuário preto, typing rosa e pill "Buscando…".

---

## WP7 — i18n (acrescentar chaves faltantes)

Em `agent` (en e pt), adicionar (as demais já existem):

```jsonc
// agent.system
"system": {
  "today": "Today",                         // pt: "Hoje"
  "child_saved": "{{name}} registered · {{age}} months · size {{size}}", // pt: "{{name}} cadastrada · {{age}} meses · tamanho {{size}}"
  "searching": "Searching {{query}} in thrift stores near {{city}}..."   // pt: "Buscando {{query}} em brechós perto de {{city}}..."
},
"topbar": { "name": "AI Assistant" /* já existe como topbar.name? confirmar; pt: "Assistente IA" */ }
```
- Conferir que `agent.topbar.name`/`online`/`typing` existem (existem). Divisor de data usa `agent.system.today` + hora formatada (`formatTime`).
- **Regra de gênero/pt**: "cadastrada" assume feminino; para não travar, usar forma neutra ("{{name}} · {{age}} meses · tamanho {{size}}") **ou** manter feminino como no mock e registrar follow-up. Decidir com o time; default: neutro.

**DoD WP7:** en e pt completos; sem string hardcodada nos WPs anteriores.

---

## WP8 — Verificação e paridade visual

1. `check` (0 novos erros) + `test --run` (verde) web + DS.
2. `/chat` inalterado (WP1/WP2 não regridem): screenshot antes/depois.
3. **Paridade (Playwright)**, largura ~360–390px, autenticado (registrar usuário → onboarding → `/agent`), dirigindo a máquina de intake:
   - **04**: responder nada → conferir saudação, pergunta, pill "Hoje", 3 chips (Sim destacado), input "Ou responda por aqui...".
   - **05**: clicar "Sim" → stepper 1/2/3+ (1 selecionado), form card 6 campos/sufixos, "Salvar criança".
   - **07**: salvar filho → pill de cadastro, mensagem de intent, "Sugestões" + 5 chips (1 primary), escolher um → bubble preta do usuário, typing rosa, pill "Buscando…".
4. Sem emojis; sem tags `component:`; contraste OK no tema claro.

**DoD WP8:** três screenshots anexados à PR batendo com 04/05/07.

---

## Ordem de execução

```
WP1 (tema claro) ─┐
WP2 (topbar) ─────┼─► WP3 (limpeza) ─► WP4, WP5, WP6 (estados) ─► WP8
WP7 (i18n) ───────┘   (WP4/5/6 dependem das chaves do WP7)
```
WP1, WP2 e WP7 podem ser paralelos; WP4–WP6 dependem de WP1+WP3(+WP7).

## Fora de escopo (não fazer)

- Alterar `IntakeMachine.ts` (fluxo de steps) — só UI.
- Alterar `/chat`, `+page.server.ts`, rotas de marketplace.
- Implementar a busca real de itens (carousel/itemList/growthAlert ficam como placeholders — telas 04/05/07 não os exigem).
- Tela 06 (`bebê a caminho`) — fora do pedido; a máquina já a cobre, alinhamento visual fica para spec futura.
