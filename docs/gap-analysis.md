# Gap Analysis — Mock vs. Implementacao (v2)

> **Data**: 2026-06-29
> **Objetivo**: Comparacao sistematica entre o mock (`BabyClothes Mocks.dc.html`) e o codigo atual, cobrindo 12 telas, fontes, cores, layout, rotas faltantes e distribuicao dos componentes entre design-system e web app.

---

## Resumo Executivo

| Categoria | Gaps Criticos (P0) | Gaps Medios (P1) | Gaps Baixos (P2) |
|-----------|-------------------|-----------------|------------------|
| Backgrounds | 5 paginas com bg errado | 2 paginas com bg diferente | — |
| Fontes (titulos) | 7 paginas usam `--ld` e deveriam usar `--sr` | — | — |
| Layout | /catalog usa rows horizontais em vez de grid 2-colunas | /child layout diferente do mock | — |
| Componentes faltantes | Child selector chips inline (chat) | Terms/Privacy, Badges no perfil | Chat quick actions inline |
| Shell | Vender btn sem destaque escuro | TopBar desktop vs mock mobile | Icones BottomNav |
| Rotas | — | /terms, /privacy | — |

**Total: ~25 gaps identificados.** Aproximadamente 60% sao de estilizacao (CSS/fontes/cores), 25% de layout, 15% de funcionalidade/componentes.

---

## 1. Sistemas Globais

### 1.1 Backgrounds — Erro Sistemico

O mock define `#F8F5F2` (`var(--of)`) como fundo padrao para TODAS as telas exceto `/login` (dark gradient) e `/login` step registro (que tambem e `#F8F5F2`).

**Situacao atual:**

| Pagina | Background atual | Background mock | Gap |
|--------|-----------------|-----------------|-----|
| `/login` (step login) | `linear-gradient(160deg, #0A0A0A, #1A0814, #0A0A0A)` | `linear-gradient(160deg, #0F0F0F, #1A0814, #0A0A1A)` | P2 — tons levemente divergentes |
| `/login` (step registro) | `var(--color-bg)` = #F8F5F2 | #F8F5F2 | ✅ OK |
| `/catalog` | Herda do body: `var(--of)` = #F8F5F2 | #F8F5F2 | ✅ OK |
| `/catalog/[id]` | `var(--of2)` = #ECEAE6 | #F8F5F2 | **P1 — bg errado** |
| `/chat` | Herda do body: `var(--of)` | #F8F5F2 | ✅ OK |
| `/child` | Herda do body: `var(--of)` | #F8F5F2 | ✅ OK |
| `/child/register` | `var(--wh)` = #FFFFFF | #F8F5F2 | **P1 — bg errado** |
| `/child/[id]` | `var(--of2)` = #ECEAE6 | #F8F5F2 | **P1 — bg errado** |
| `/notifications` | `var(--wh)` = #FFFFFF | #F8F5F2 | **P1 — bg errado** |
| `/sell` | `var(--wh)` = #FFFFFF | #F8F5F2 | **P1 — bg errado** |
| `/profile` | `var(--of2)` = #ECEAE6 | #F8F5F2 | **P1 — bg errado** |

**Acao**: Trocar bg de `/child/register`, `/notifications`, `/sell` de `var(--wh)` para `var(--of)`. Trocar `/catalog/[id]`, `/child/[id]`, `/profile` de `var(--of2)` para `var(--of)`.

### 1.2 Fontes — Titulos de Pagina

**Situacao atual**: A maioria dos titulos de pagina usa `var(--ld)` (Londrina Solid).

**Mock define**: Titulos de pagina em **Cormorant Garamond** (`var(--sr)`).

| Pagina | Elemento | Fonte atual | Fonte mock | Gap |
|--------|---------|------------|-----------|-----|
| `/login` | Logo "BabyClothes" | `var(--ld)` (Londrina) | Londrina Solid | ✅ OK |
| `/login` | Heading "Bem-vinda" | AuthScreen component | Cormorant Garamond | Verificar |
| `/login·registro` | "Criar conta" (header) | `var(--sr)` (Cormorant) | Cormorant Garamond | ✅ OK |
| `/catalog` | Titulos de secao (Trending, etc.) | `var(--ld)` (Londrina) | Lato 700/900 | **P2** — mock usa Lato Bold, nao display |
| `/catalog` | Categoria tabs | `var(--ld)` | Lato 700 | **P1** |
| `/chat` | "Agente BabyClothes" | ChatHeader component | — | Verificar |
| `/child` | "Minhas criancas" | ChildSelector component | Cormorant Garamond | **P1** — mock usa `--sr` |
| `/child/register` | "Nova crianca" (h1) | `var(--ld)` (Londrina) | Cormorant Garamond | **P1 — fonte errada** |
| `/child/[id]` | Nome da crianca (h1) | `var(--ld)` (Londrina) | Cormorant Garamond | **P1 — fonte errada** |
| `/notifications` | "Notificacoes" (h1) | `var(--ld)` (Londrina) | Cormorant Garamond | **P1 — fonte errada** |
| `/sell` | "Criar anuncio" | ItemForm component | Cormorant Garamond | **P1** — depende do ItemForm |
| `/profile` | Nome do usuario (h1) | `var(--ld)` (Londrina) | Lato (provavelmente) | P2 — verificar mock |

**Acao**: Padronizar todos os `h1` de titulo de pagina para `font-family: var(--sr)` (Cormorant Garamond), mantendo `--ld` (Londrina Solid) apenas para o logo "BabyClothes".

### 1.3 Fontes — Labels e Campos de Formulario

**Mock define**:
- Labels: Lato 700 (`var(--vd)` com weight 700)
- Inputs: Lato (`var(--vd)`)
- Botoes: Lato 700 (`var(--vd)`)

**Situacao atual**: Varios componentes usam `var(--ld)` para labels.

| Componente | Elemento | Fonte atual | Fonte mock |
|-----------|---------|------------|-----------|
| `/child/register` | Labels (.register-page__label) | `var(--ld)` | Lato 700 |
| `/child/register` | Input (.register-page__input) | `var(--vd)` | Lato |
| `/child/register` | Botao submit | `var(--ld)` | Lato 700 |
| TopBar | Logo | `var(--ld)` | Londrina Solid |
| TopBar | Search/Actions | Implicito | Lato |
| BottomNav | Labels | `var(--font-ui)` = Lato | Lato |

### 1.4 Design Tokens — Status Atual

Apos correcoes anteriores, os tokens estao alinhados:

| Token | Valor | Status |
|-------|-------|--------|
| `--ld` | Londrina Solid | ✅ Corrigido (antes era Lato) |
| `--sr` | Cormorant Garamond | ✅ OK |
| `--vd` | Lato | ✅ Corrigido (antes era Verdana) |
| `--color-pk-soft` | #FFE8F5 | ✅ Adicionado |
| `--color-pk-mid` | #FF85CC | ✅ Adicionado |
| `--color-pk-purple` | #B03EFF | ✅ Adicionado |
| Google Fonts | Londrina Solid carregada | ✅ OK (app.html) |

---

## 2. Analise por Tela

### 2.1 `/login` — Tela de Login

**Mock specs**:
- Dark gradient bg `linear-gradient(160deg, #0F0F0F 0%, #1A0814 60%, #0A0A1A 100%)`
- Pink radial glow no canto superior direito
- Logo "BabyClothes" em Londrina Solid 1.6rem
- Heading Cormorant Garamond 1.9rem weight 300
- Glass card (`rgba(255,255,255,0.52)` + blur 2.4rem)
- Google button branco (border-radius 10px)
- "Entrar sem autenticacao (dev)" link
- Texto de termos no rodape

**Implementacao atual** (`apps/web/src/routes/login/+page.svelte`):

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background dark gradient | ✅ `linear-gradient(160deg, var(--color-black), #1A0814, var(--color-black))` | P2 — `#0A0A0A` vs mock `#0F0F0F` (tom inicial) |
| Pink radial glow | ❌ Nao implementado diretamente (usado no body global) | P1 — mock tem glow no top-right especifico |
| Glass card | ✅ Via AuthScreen | Verificar fidelidade |
| Logo font | ✅ Londrina Solid (via `--ld`) | OK |
| Heading font | Depende do AuthScreen | Verificar |
| Terms text | ✅ Na AuthScreen | OK |
| Dev login link | ✅ Implementado via AuthScreen | OK |

**AuthScreen** (`apps/web/src/lib/presentation/components/AuthScreen.svelte`):
- Renderiza o card de login
- Deve ser verificado se usa glass morphism (`var(--glass)`, `var(--glass-blur)`) vs card branco solido

### 2.2 `/login` (step registro) — Formulario PF/PJ

**Mock specs**:
- Background #F8F5F2
- Back button 32x32 circle com arrow
- Header "Criar conta" Cormorant Garamond 1.35rem
- Cards PF/PJ em **layout HORIZONTAL** (icon-left, text-center, checkmark-right)
- PF icon: Person SVG 40x40 em circulo `#FFE8F5`
- PF selecionado: 2px border `#FF3CAC` + shadow `rgba(255,60,172,0.12)`
- Checkmark: circulo 18px `#FF3CAC`
- Input CPF com mask placeholder
- Botao "Continuar" com pink gradient + shadow

**Implementacao atual** (`RegistrationForm.svelte`):

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | ✅ `var(--color-bg)` = #F8F5F2 | OK |
| Back button 32x32 | ✅ Implementado | OK |
| Header "Criar conta" | ✅ `var(--sr)` 1.35rem | OK |
| Layout dos cards | ✅ Horizontal (icon-left, text-center, checkmark-right) | Corrigido da versao anterior |
| PF icon | ✅ SVG em `var(--color-pk-soft)` circle | OK |
| PJ icon | ✅ SVG em `var(--color-bg-2)` circle | OK |
| Checkmark | ✅ 18px circle `var(--pk)` | OK |
| Selected border | ✅ 2px `var(--pk)` + shadow | OK |
| Input com mask | ✅ CPF/CNPJ formatado | OK |
| Botao gradient | ❌ `var(--pk)` solido, nao gradient | **P1 — mock usa pink gradient** |
| Descricao PF/PJ | ✅ Em Lato (`var(--vd)`) | OK |

### 2.3 `/catalog` — Listagem de Produtos

**Mock specs**:
- White status bar no topo
- Glass topbar: Londrina logo + search pill + "Publicar" pink button + avatar gradient "MC"
- Category tabs com underline ativo (2.5px `#FF3CAC`)
- Filter chips (M/P/G/RN/Menina) como pills
- **2-COLUMN GRID** de item cards (4 cards)
- Bottom nav com icones custom SVG; Vender usa dark circle + white "+"

**Implementacao atual**:

| Aspecto | Status | Gap |
|---------|--------|-----|
| TopBar | ✅ Parcial — Glass morphism correto, mas orientado a desktop | **P1 — Mock e mobile-first** |
| **Layout dos cards** | ❌ **Horizontal scrolling rows em vez de grid 2-colunas** | **P0 — MAJOR** |
| Category tabs | ✅ CategoryTabNav presente | Verificar estilo do underline (2.5px pink) |
| Filter chips | ✅ Implementado | P2 — Estilo pill vs mock |
| Size chips | ✅ Implementado (com badge "IA" no previsto) | OK |
| Sections (AI, Trending, etc.) | ❌ Mock nao tem essas secoes — e grid simples | **P0 — Estrutura diferente** |
| BottomNav — Vender | ❌ Plus icon normal, sem destaque dark circle | **P1 — Mock usa dark circle + white "+"** |
| BottomNav — Icones | ❌ lucide-svelte vs custom SVG do mock | P2 — Diferenca visual |

**Nota sobre o layout**: Esta e a maior divergencia do mock. O mock mostra um grid 2-colunas simples com filtros. A implementacao tem rows horizontais com scroll lateral agrupadas por categorias (AI, Trending, Recem-nascido, etc.). Isso e uma decisao de produto — as rows sao provavelmente uma evolucao intencional do design. Confirmar com o usuario se deve manter as rows ou voltar ao grid.

### 2.4 `/catalog/[id]` — Detalhe do Item

**Mock specs**:
- Hero photo full-width (240px) com gradient bg
- White status bar text
- Back/fav/share circular buttons
- Photo dots indicator
- White content card com top arredondado (16px)
- Title "Body manga longa listrado"
- Condition/size/gender chips
- Price R$32,00 com old price strikethrough
- Seller row: gradient avatar + verified badge
- "Contatar" + "Comprar" buttons

**Implementacao atual** (wrapper + ItemCard):

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | `var(--of2)` | **P1 — Deveria ser `var(--of)` / #F8F5F2** |
| Hero photo | Depende do ItemCard | Verificar |
| Status bar | Depende do ItemCard | Verificar |
| Back/fav/share buttons | Depende do ItemCard | Verificar |
| Content card | Depende do ItemCard | Verificar bordas (mock: 16px top) |
| Price + old price | Depende do ItemCard | Verificar |
| Seller row | Depende do ItemCard | Verificar verified badge |
| Contatar/Comprar buttons | Depende do ItemCard | Verificar |

### 2.5 `/chat` — Chat com IA

**Mock specs**:
- White status bar
- Header: dark circle avatar + pink droplet icon + green SSE pulse dot
- "Assistente IA" title
- Child selector chips entre header e mensagens (Sofia selecionado com pink bg+border, Mateus unselected, + add button)
- Agent bubble (white bg, rounded 12px)
- User bubble (black bg, white text)
- System bubble (pink bg, centered)
- Chat input com quick action chips + search pill + dark send button circle
- Bottom nav

**Implementacao atual** (mais completo, mais proximo do mock):

| Aspecto | Status | Gap |
|---------|--------|-----|
| Header | ✅ ChatHeader component | OK |
| SSE streaming | ✅ Implementado | OK |
| Component rendering | ✅ Carousel, ItemList, GrowthAlert | OK |
| Agent bubble | ✅ white bg | OK |
| User bubble | ✅ black bg, white text | OK |
| Typing indicator | ✅ 3 dots animation | OK |
| Bottom nav | ✅ Presente | OK |
| **Child selector chips** | ❌ Nao renderizado entre header e mensagens | **P1 — Mock tem chips inline** |
| **Quick action chips** | ⚠️ Via ChatInput.quickActions prop (dropdown?) | **P1 — Mock mostra chips inline acima do input** |
| Send button | Depende do ChatInput DS | Verificar se e dark circle como mock |

### 2.6 `/child` — Lista de Criancas

**Mock specs**:
- White status bar
- Header: Cormorant Garamond "Minhas criancas" + pink "Adicionar" button
- Child cards com gradient/black avatar circles
- Nome, idade, size badge
- **Progress bar** (M→G 68% em pink gradient, G→GG 32% em gray)
- Bottom nav

**Implementacao atual**:

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | ✅ Herda `var(--of)` | OK |
| Header title | ChildSelector component | **P1 — Mock usa Cormorant Garamond** |
| **Layout** | ❌ Implementacao mostra um child com GrowthChart full | **P1 — Mock mostra lista de cards com progress bars individuais** |
| Progress bars | ❌ Ausentes nos cards da lista | **P1** |
| "Adicionar" button | ✅ Via ChildSelector | OK |

### 2.7 `/child/register` — Cadastro de Crianca

**Mock specs**:
- White status bar
- Header: back circle + Cormorant Garamond "Nova crianca"
- Form fields: Nome, Data de nascimento, Peso ao nascer (com sufixo "g"), Altura ao nascer (com sufixo "cm"), Documento (optional)
- Pink "Cadastrar crianca" button

**Implementacao atual**:

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | `var(--wh)` | **P1 — Deveria ser `var(--of)` / #F8F5F2** |
| Title font | `var(--ld)` (Londrina) | **P1 — Mock usa Cormorant Garamond (`var(--sr)`)** |
| Label font | `var(--ld)` (Londrina) | **P1 — Mock usa Lato 700 (`var(--vd)`)** |
| Input font | `var(--vd)` (Lato) | ✅ OK |
| Suffixos "g"/"cm" | ❌ Nao implementados | P2 — Mock mostra unidades nos campos |
| Botao submit | `var(--pk)` solido | P2 — Mock usa pink gradient |
| Botao font | `var(--ld)` (Londrina) | P2 — Mock usa Lato 700 |
| Back button | ✅ 3.6rem circle | OK |

### 2.8 `/child/[id]` — Detalhe da Crianca

**Mock specs**:
- White status bar
- Header: back circle + Cormorant Garamond "Sofia · 8 meses"
- Growth chart card com:
  - Eyebrow "Previsao de crescimento" em italic pink
  - Current size M (black box) → next size G (pink gradient box) com arrow
  - "42 dias" countdown
  - 68% progress bar
  - Pink gradient "Ver roupas tamanho G" button
- "Medidas" section com add button e history list (Jun/Mai 2026)
- Bottom nav

**Implementacao atual**:

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | `var(--of2)` | **P1 — Deveria ser `var(--of)` / #F8F5F2** |
| Title font (nome) | `var(--ld)` (Londrina) | **P1 — Mock usa Cormorant Garamond (`var(--sr)`)** |
| Age subtitle | `var(--sr)` italic | ✅ OK |
| GrowthChart | ✅ Presente com variant="full" | Verificar fidelidade visual |
| "Medidas" history | ✅ Implementado | P2 — Mock mostra lista mais simples e compacta |
| Size badges nos records | ✅ Pink chips com `var(--pk3)` | OK |

### 2.9 `/notifications` — Central de Notificacoes

**Mock specs**:
- White status bar
- Cormorant Garamond "Notificacoes" + "Marcar todas como lidas" pink button
- "2 nao lidas" badge com pink dot
- Unread items tem **background `#FFF9FC`** (pink tint)
- Notification cards: colored circle icons (growth=`#FFE8F5` pink, match=`#FFE8F5` pink, system=`#F3F4F6` gray)
- Title/text/time
- Bottom nav

**Implementacao atual**:

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | `var(--wh)` | **P1 — Deveria ser `var(--of)` / #F8F5F2** |
| Title font | `var(--ld)` (Londrina) | **P1 — Mock usa Cormorant Garamond (`var(--sr)`)** |
| "Marcar todas" button | ✅ Pink, uppercase | OK |
| Unread styling | ❌ Borda pink esquerda em vez de bg `#FFF9FC` | **P1 — Mock usa bg tint rosa** |
| Icon circles | ✅ Colors corretos (growth=`var(--pk3)`, match=blue, sys=`var(--of2)`) | OK |
| "Nao lidas" count badge | ❌ Nao implementado | P2 |
| NotificationCard | ✅ Componente dedicado | OK |

### 2.10 `/sell` — Criar Anuncio (2 passos)

**Mock specs**:
- **Step 1:**
  - White status bar
  - Header: Cormorant Garamond "Criar anuncio" + close button
  - "Passo 1 de 2" + progress bar 50% pink gradient
  - Form: Titulo, Categoria chips (Bodies selecionado), Tamanho chips (M selecionado), Condicao chips (Novo selecionado), Genero chips (Menina selecionado)
  - Black "Continuar" button
- **Step 2:**
  - Header: back button + "Criar anuncio" + close
  - "Passo 2 de 2" + progress bar 100%
  - Fotos grid 4x4 (2 gradient swatches + 2 dashed empty slots)
  - Preco com R$ prefix
  - Descricao textarea (optional)
  - Pink gradient "Publicar anuncio" button
- Bottom nav (Vender ativo — PINK circle)

**Implementacao atual** (wrapper + ItemForm):

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | `var(--wh)` | **P1 — Deveria ser `var(--of)` / #F8F5F2** |
| Title font | ItemForm component | **P1 — Mock usa Cormorant Garamond (`var(--sr)`)** |
| Progress bar | ItemForm component | Verificar (mock: 50% e 100% pink gradient) |
| Chips (cat/size/cond/gender) | ItemForm component | Verificar estilo dos chips selecionados |
| "Continuar" button (step 1) | ItemForm | Mock: black button. Implementacao: verificar |
| "Publicar" button (step 2) | ItemForm | Mock: pink gradient. Implementacao: verificar |
| Foto grid | ItemForm | Mock: 4x4 com swatches + dashed slots |
| Preco R$ prefix | ItemForm | Verificar |
| Bottom nav Vender ativo | BottomNav | **P1 — Mock usa PINK circle para estado ativo em Vender** |

### 2.11 `/profile` — Perfil do Usuario

**Mock specs**:
- White status bar
- Header: gradient avatar "MC" 72px, "Maria Clara Santos" name, email
- **Badge row**: PF (gray), Vendedora (pink), Online (green with dot)
- Settings list:
  - Meus anuncios (com "5" count badge)
  - Idioma (PT-BR/EN **chip toggle** com black selecionado)
  - Notificacoes
  - Ajuda
- Red "Sair da conta" logout button
- Bottom nav

**Implementacao atual**:

| Aspecto | Status | Gap |
|---------|--------|-----|
| Background | `var(--of2)` | **P1 — Deveria ser `var(--of)` / #F8F5F2** |
| Avatar | ✅ 5.6rem gradient circle | OK |
| Name font | `var(--ld)` (Londrina) | P2 — Pode ser Cormorant no mock |
| Email | `var(--sr)` italic | ✅ OK |
| **Badge row (PF, Vendedora, Online)** | ❌ Nao implementado | **P1** |
| **"Meus anuncios" com count "5"** | ❌ Sem count badge | P2 |
| **Idioma chip toggle (PT-BR/EN)** | ❌ Implementado como button com texto | **P1 — Mock usa 2 chips lado a lado com selecionado preto** |
| **Notificacoes nav item** | ❌ Nao implementado | **P1** |
| **Ajuda nav item** | ❌ Nao implementado | **P1** |
| Favoritos | ✅ Presente | Extra vs mock |
| Compras | ✅ Presente | Extra vs mock |
| Logout button | ✅ Estilo outline | P2 — Mock usa vermelho `#EF4444` |

### 2.12 Rotas Faltantes

| Rota | Mock reference | Status |
|------|---------------|--------|
| `/terms` | Link "Termos de Uso" no footer da login | ❌ Nao implementada |
| `/privacy` | Link "Politica de Privacidade" no footer da login | ❌ Nao implementada |

---

## 3. Componentes Shell

### 3.1 TopBar

| Aspecto | Mock | Implementacao | Gap |
|---------|------|--------------|-----|
| Altura | ~48px (mobile) | 5.6rem (89px) | **P0 — Muito alta, orientada a desktop** |
| Layout | Logo + search pill + "Publicar" + avatar | Logo + search bar + chat btn + "Publicar" + avatar | P1 — Elementos extras |
| Glass effect | ✅ | ✅ | OK |
| Logo font | Londrina Solid | Londrina Solid (`var(--ld)`) | ✅ OK |
| Avatar | gradient circle com iniciais | fallback com `var(--of2)` bg | P2 — Mock usa gradient |
| Responsividade | Mobile-first | Desktop-first | **P0** |

### 3.2 BottomNav

| Aspecto | Mock | Implementacao | Gap |
|---------|------|--------------|-----|
| Icones | Custom SVG inline | lucide-svelte (Home, MessageSquare, Baby, Plus) | P2 — Visual diferente |
| **Vender ativo** | Dark circle (#111) + white "+" | Plus icon sem destaque especial | **P1 — Mock tem botao Vender com destaque escuro** |
| Glass effect | ✅ | ✅ | OK |
| Labels | Lato uppercase 700 | Lato (`var(--font-ui)`) 700 | ✅ OK |

### 3.3 Footer

| Aspecto | Status |
|---------|--------|
| Presente em paginas non-chat, non-login | ✅ |
| Fontes | Verificar alinhamento com mock |

---

## 4. Distribuicao de Componentes: Design System vs Web App

### 4.1 No Design System (`packages/design-system`)

| Componente | Status | Notas |
|-----------|--------|-------|
| Card | ✅ | Item card generico |
| Carousel | ✅ | Carousel generico |
| ChatInput | ✅ | Input de chat generico |
| ItemList | ✅ | Lista de itens generica |
| Modal | ✅ | Modal generico |
| BottomNav | ✅ (patterns) | Navegacao inferior |
| TopBar | ✅ (patterns) | Barra superior |

### 4.2 No Web App (`apps/web`) — Devem permanecer

Componentes com logica de dominio que devem ficar no web app:

| Componente | Motivo |
|-----------|--------|
| AuthScreen | Dominio de autenticacao (Google OAuth) |
| RegistrationForm | Dominio de autenticacao (PF/PJ) |
| ItemCard | Dominio de catalogo (item detail, seller, payment) |
| ItemForm | Dominio de venda (2-step listing) |
| ChatHeader | Dominio de chat (SSE status, child context) |
| ChildSelector | Dominio de child (selecao, age calculation) |
| GrowthChart | Dominio de growth (prediction, sizes) |
| NotificationCard | Dominio de notificacao (read/unread, types) |

### 4.3 No Web App — Candidatos a migrar para Design System

Componentes genericos o suficiente para estarem no design system:

| Componente | Justificativa | Prioridade |
|-----------|--------------|-----------|
| **ChatBubble** | Bubble de chat generico (user/agent/system). Props: role, content, timestamp. | P1 |
| **EmptyState** | Estado vazio generico. Props: variant, title, description, action, accent. | P1 |
| **CategoryTabNav** | Navegacao por tabs generica. Props: categories, active, onSelect. | P1 |
| **PageHeader** | Header de pagina generico com back button + titulo. | P2 |
| **Footer** | Footer padrao da aplicacao. | P2 — muito especifico do app |

### 4.4 Componentes que precisam ser criados (nao existem)

| Componente | Localizacao | Descricao |
|-----------|------------|-----------|
| ProfileBadges | `apps/web` (domain) | Row de badges PF/Vendedora/Online no perfil |
| LanguageToggle | `packages/design-system` | Chip toggle para selecao de idioma (PT-BR/EN) |
| CountBadge | `packages/design-system` | Badge numerico (ex: "5" em Meus anuncios) |
| ProgressBar | `packages/design-system` | Barra de progresso com variantes (pink/gray) |

---

## 5. Plano de Acao (Priorizado)

### Fase 1 — Correcoes Criticas de Estilo (P0/P1) — ~2-3h

1. **Backgrounds**: Trocar `var(--wh)` e `var(--of2)` para `var(--of)` em 6 paginas:
   - `/child/register` (linha 125: `background: var(--wh)`)
   - `/notifications` (linha 131: `background: var(--wh)`)
   - `/sell` (linha 110: `background: var(--wh)`)
   - `/catalog/[id]` (linha 46: `background: var(--of2)`)
   - `/child/[id]` (linha 150: `background: var(--of2)`)
   - `/profile` (linha 118: `background: var(--of2)`)

2. **Titulos de pagina**: Trocar `var(--ld)` para `var(--sr)` em h1s:
   - `/child/register` linha 155: `.register-page__title`
   - `/child/[id]` linha 192: `.child-detail-page__name`
   - `/notifications` linha 144: `.notifs-page__title`

3. **Labels de formulario** (`/child/register`): Trocar `var(--ld)` para `var(--vd)` nas labels (linha 184)

4. **TopBar altura**: Reduzir de 5.6rem para ~3.5rem (56px) em mobile, ajustar `padding-top` no `.app-main`

### Fase 2 — Alinhamento de Layout (P1) — ~3-4h

5. **BottomNav Vender**: Estilizar botao Vender como dark circle com "+" branco quando ativo
6. **`/catalog` grid vs rows**: Confirmar com usuario se mantem rows ou volta ao grid 2-colunas do mock
7. **`/chat` child selector chips**: Adicionar chips inline entre ChatHeader e mensagens
8. **`/notifications` unread bg**: Trocar borda rosa por background `#FFF9FC` nos itens nao lidos
9. **`/profile` badges**: Adicionar row PF/Vendedora/Online
10. **`/profile` language toggle**: Implementar chip toggle PT-BR/EN

### Fase 3 — Rotas Faltantes e Componentes (P1/P2) — ~2-3h

11. Criar `/terms` — pagina estatica com Termos de Uso
12. Criar `/privacy` — pagina estatica com Politica de Privacidade
13. Migrar **ChatBubble** para `@babyclothes/design-system`
14. Migrar **EmptyState** para `@babyclothes/design-system`
15. Migrar **CategoryTabNav** para `@babyclothes/design-system`

### Fase 4 — Polimento Visual (P2) — ~2-3h

16. TopBar: Ajustar para mobile-first (ocultar elementos extras, compactar altura)
17. BottomNav: Considerar custom SVG icons para matching exato com mock
18. `/child`: Alinhar layout com mock (lista de cards com progress bars)
19. `/profile`: Adicionar count badge em "Meus anuncios", itens Notificacoes e Ajuda
20. `/sell` ItemForm: Verificar progress bar, chips, botoes (preto vs pink gradient)
21. Itens do catalogo: Verificar estilos de Card (featured, md, sm, lg)

---

## 6. Notas Tecnicas

### Convencoes de CSS
- **BEM** e usado consistentemente em todos os componentes — manter
- **CSS custom properties** do design system sao usados na maioria dos lugares
- **Glass morphism** tokens (`--glass`, `--glass-blur`, `--glass-brd`, `--glass-shadow`) estao definidos e sendo usados

### i18n
- Todas as strings visiveis usam `$t()` — ✅ conformidade
- Novas paginas (`/terms`, `/privacy`) precisam de chaves i18n em `en.json` e `pt.json`

### Mock Data
- `PUBLIC_MOCK_DATA` flag permite testar com dados mock — ✅ util para desenvolvimento
- Todos os componentes suportam tanto mock quanto API real

### Performance
- `$derived` e usado extensivamente — ✅ sem reatividade desnecessaria
- SSE streaming no chat implementado corretamente com atualizacao incremental de mensagens

---

## 7. Referencias

- Mock HTML: `BabyClothes architecture diagrams/BabyClothes Mocks.dc.html` (789 linhas, 12 telas)
- Design tokens: `packages/design-system/src/tokens/tokens.css` (127 linhas)
- Brand tokens: `packages/design-system/src/tokens/brand.css` (109 linhas)
- App shell: `apps/web/src/routes/+layout.svelte`
- Global styles: `apps/web/src/app.postcss`
- Font loader: `apps/web/src/app.html`
