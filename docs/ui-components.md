# BabyClothes — Inventário de Componentes UI/UX

> Total: **28 componentes** — 7 primitives + 5 composite (`packages/ui`) + 13 page-level + 3 shell (`apps/web`)

---

## 1. Componentes Compartilhados (`packages/ui`)

### 1.1 Primitives

#### Avatar

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Avatar/Avatar.svelte` |
| **Teste** | `packages/ui/src/lib/components/Avatar/Avatar.test.ts` |
| **Props** | `name` (string), `src` (string URL), `size` ('sm' \| 'md' \| 'lg' \| 'xl'), `fill` ('pk' \| 'bk' \| 'of'), `online` (boolean), `verified` (boolean) |
| **Estados** | `com foto` (img src) / `fallback` (iniciais auto-geradas com fundo gradiente) / `online` (indicador verde 1rem) / `verified` (checkmark rosa 1.2rem) |
| **Gradiente** | Rosa→Roxo para variante pk, Cinza→Cinza para of |
| **Tam.** | sm (2rem), md (2.5rem), lg (3rem), xl (4rem) |

#### Badge

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Badge/Badge.svelte` |
| **Teste** | `packages/ui/src/lib/components/Badge/Badge.test.ts` |
| **Props** | `label` (string), `variant` ('dark' \| 'pk' \| 'pk-soft' \| 'neutral' \| 'green' \| 'amber'), `size` ('sm' \| 'md' \| 'lg'), `pill` (boolean) |
| **Estados** | 6 variantes de cor + modo pill (border-radius: 99rem) |
| **BEM** | `.bc-badge--{variant}`, `.bc-badge--{size}`, `.bc-badge--pill` |
| **Uso** | Selo de condição (Novo/Seminovo/Usado), badge IA, badges de categoria |

#### Button

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Button/Button.svelte` |
| **Teste** | `packages/ui/src/lib/components/Button/Button.test.ts` |
| **Props** | `label` (string), `variant` ('primary' \| 'pk' \| 'secondary' \| 'ghost' \| 'ghost-pk' \| 'primary-inv' \| 'ghost-inv'), `size` ('sm' \| 'md' \| 'lg'), `loading` (boolean), `disabled` (boolean), `type` ('button' \| 'submit'), `icon` ('arrow-right' \| 'arrow-left' \| 'camera' \| 'plus' \| 'x' \| 'search' \| ''), `onclick`, `children` (Snippet) |
| **Estados** | `default` / `loading` (spinner + disabled) / `disabled` (opacidade reduzida) |
| **Variantes** | 7 visuais: primary (preto), pk (rosa), secondary (cinza), ghost (transparente), ghost-pk (transparente rosa), primary-inv (branco), ghost-inv (transparente claro) |
| **Tam.** | 3 tamanhos: sm (0.5rem 0.9rem padding), md (0.6rem 1rem), lg (0.75rem 1.25rem) |
| **Ícones** | SVGs inline (ArrowRight, ArrowLeft, Camera, Plus, X, Search) — exibidos à esquerda do label com gap 0.4rem |

#### FilterBar

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/FilterBar/FilterBar.svelte` |
| **Teste** | `packages/ui/src/lib/components/FilterBar/FilterBar.test.ts` |
| **Props** | `filters` (Array\<{label, value, count?}\>), `selected` ($bindable string[]), `variant` ('default' \| 'pk' \| 'on-dark'), `size` ('sm' \| 'md'), `label`, `onchange` |
| **Estados** | `selecionado` (fundo preto/texto branco) / `não selecionado` (fundo cinza claro) / `hover` (opacidade 0.8) |
| **Variantes** | 3 variantes × 2 tamanhos = 6 combinações visuais |
| **Badge** | `count` exibido apenas se !== undefined; scroll horizontal sem scrollbar (`-ms-overflow-style: none; scrollbar-width: none`) |

#### Input

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Input/Input.svelte` |
| **Teste** | `packages/ui/src/lib/components/Input/Input.test.ts` |
| **Props** | `id`, `type` (incluindo 'password'), `label`, `placeholder`, `value` ($bindable), `hint`, `error`, `success`, `prefix` (string), `suffixLabel`, `onsuffixclick`, `oninput`, `disabled` |
| **Estados** | `default` / `error` (borda vermelha + feedback) / `success` (borda verde + feedback) |
| **Funcionalidades** | Toggle show/hide senha (ícone Eye/EyeOff), texto de prefixo (ex: "R$"), botão de sufixo, hint text |
| **Animações** | Transição suave de 0.15s no focus dentro/fora |

#### Spinner

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Spinner/Spinner.svelte` |
| **Teste** | `packages/ui/src/lib/components/Spinner/Spinner.test.ts` |
| **Props** | `size` ('sm' \| 'md' \| 'lg'), `variant` ('default' \| 'pk' \| 'inv') |
| **Estados** | 3 tamanhos × 3 cores = 9 combinações |
| **Animação** | CSS puro com `@keyframes spin` (rotação 360°, 0.6s linear infinite) |

#### Toast

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Toast/Toast.svelte` |
| **Teste** | `packages/ui/src/lib/components/Toast/Toast.test.ts` |
| **Props** | `message` (string), `title` (string), `type` ('info' \| 'success' \| 'warning' \| 'error' \| 'pk'), `closable` (boolean), `onclose` |
| **Estados** | 5 tipos visuais: barra lateral colorida à esquerda (pk=rosa, info=azul, success=verde, warning=âmbar, error=vermelho) |
| **BEM** | `.bc-toast--{type}`, `.bc-toast__bar`, `.bc-toast__body`, `.bc-toast__close` |
| **Animações** | `@keyframes toastSlideIn` (de cima, com transição 0.2s ease) |

---

### 1.2 Composite

#### Card

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Card/Card.svelte` |
| **Props** | `image` (URL), `title`, `detail`, `price`, `oldPrice`, `badge`, `condition` ('new' \| 'like_new' \| 'used'), `size` ('sm' \| 'md' \| 'lg' \| 'featured'), `pinkPrice` (boolean), `onAdd` |
| **Seções** | Imagem (com placeholder fallback gradient), selo de condição (Badge), badge IA, botão favoritar (coração), corpo (título, detail, linha de preço + oldPrice) |
| **Efeito** | Vidro líquido: `background: var(--color-glass)`, `backdrop-filter: blur(12px)` |
| **Tam.** | sm (14rem), md (16rem), lg (20rem), featured (28rem) |
| **Condições** | Mapeamento: new → "Novo" (dark), like_new → "Seminovo" (pk), used → "Usado" (neutral) |

#### Carousel

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Carousel/Carousel.svelte` |
| **Props** | `label` (string), `children` (Snippet), `onprevious`, `onnext` |
| **Estados** | `canScrollLeft` / `canScrollRight` (botões desabilitados nas extremidades) |
| **Scroll** | `scroll-snap-type: x mandatory`, scroll de 70% da largura do container |
| **Botões** | Setas (SVG) nos cantos com background glass, disabled = opacidade 0.3 |

#### ChatInput

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/ChatInput/ChatInput.svelte` |
| **Props** | `placeholder`, `loading` (boolean), `quickActions` (Array\<{label, value}\>), `onsend`, `onadd` |
| **Estados** | `default` / `loading` (indicador de digitação animado — 3 bolinhas pulando) |
| **Funcionalidades** | Enter para enviar, Shift+Enter para nova linha, textarea auto-redimensionável, chips de ação rápida, botão + (quick actions) |
| **Animações** | Bolinhas de digitação com `@keyframes bounce` (delay escalonado: 0ms, 100ms, 200ms), transição 0.2s no textarea |

#### ItemList

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/ItemList/ItemList.svelte` |
| **Props** | `label`, `count` (number), `layout` ('grid' \| 'list'), `children` (Snippet) |
| **Layout grid** | 3 colunas responsivas (2 colunas em < 64rem) |
| **Layout list** | Scroll horizontal com flex-shrink: 0 nos children |

#### Modal

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `packages/ui/src/lib/components/Modal/Modal.svelte` |
| **Props** | `open` ($bindable boolean), `title`, `variant` ('default' \| 'danger' \| 'pk'), `onclose`, `children` (Snippet), `footer` (Snippet) |
| **Estados** | `aberto` / `fechado` (transições fade + slide — 0.2s) |
| **Ícones** | danger (X vermelho), pk (coração rosa), default (sem ícone) |
| **Comportamento** | Fechar no X, no backdrop, na tecla Escape; max 36rem largura, 85vh altura |

---

## 2. Componentes de Página (`apps/web`)

#### AuthScreen

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/AuthScreen.svelte` |
| **Props** | `onGoogleLogin`, `onDevLogin`, `loading` |
| **Seções** | Logo (gota rosa + "BabyClothes" em Londrina Solid), headline (2 linhas: "Compre e venda" + "Roupas inteligentes"), subtitle, botão Google (ou GSI), dev login (skip), termos/privacy |
| **Estados** | `GSI carregando` (fallback button com SVG Google) / `GSI pronto` (Google button renderizado via `google.accounts.id.renderButton`) / `loading` (spinner) |
| **i18n** | `$t('auth.*')` — headline, subtitle, continue_google, terms, loading |

#### RegistrationForm

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/RegistrationForm.svelte` |
| **Props** | `onComplete` (callback com {type, cpf ou cnpj}), `loading` |
| **Step 1** | Seleção PF/PJ com cartões: ícone (UserCheck/Building2 — lucide-svelte), label, descrição |
| **Step 2** | Input de documento com máscara (CPF: 000.000.000-00, CNPJ: 00.000.000/0000-00), validação por length de dígitos |
| **Validação** | CPF = 11 dígitos, CNPJ = 14 dígitos — botão disabled se inválido |
| **Navegação** | Botão voltar (ArrowLeft) no step 2, seta (ArrowRight) no submit |
| **i18n** | `$t('auth.registration.*')` |

#### ItemCard

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/ItemCard.svelte` |
| **Props** | `item` (Item), `seller` ({name, avatarUrl, listingCount, verified}), `paymentEnabled`, `onclick`, `onFavorite`, `onContact`, `onBuy`, `onSellerClick` |
| **Seções** | Foto (com badge condição + botão favoritar coração), info (título/preço/badges), seller row (Avatar + nome + verified), ações (Contact/Buy) |
| **Formatação** | Preço BRL via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` |
| **Ícones** | Heart, MessageCircle, ShoppingCart (lucide-svelte) |
| **Estados** | `paymentEnabled = true` (mostra botão comprar) / `false` (mostra contatar) |

#### CategoryTabNav

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/CategoryTabNav.svelte` |
| **Props** | `categories` (string[]), `active` (string), `onSelect` |
| **Estados** | `active` (texto preto 900 + borda inferior rosa 0.2rem) / `inactive` (30% opacidade cinza) |
| **Efeito** | Glass backdrop no sticky header, separadores entre tabs (borda 0.05rem) |
| **Scroll** | Horizontal sem scrollbar (`scrollbar-width: none`) |

#### ChatBubble

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/ChatBubble.svelte` |
| **Props** | `role` ('user' \| 'agent' \| 'system'), `content` (string), `timestamp` |
| **Estados** | `user` (background escuro, texto branco, alinhado à direita, border-radius invertido) / `agent` (glass, alinhado à esquerda) / `system` (rosa claro, centralizado) |
| **Max-width** | 80% para user/agent, 90% para system |
| **Timestamp** | Exibido condicionalmente, fonte pequena (0.65rem) |

#### ChatHeader

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/ChatHeader.svelte` |
| **Props** | `title`, `subtitle`, `childContext`, `onMore` |
| **Seções** | Avatar (preto + ponto rosa), live pill (SSE, animação pulsante verde — `@keyframes pulse`), contexto criança (ícone Baby), mais opções (MoreHorizontal) |
| **Ícones** | Baby, MoreHorizontal (lucide-svelte) |
| **i18n** | `$t('chat_header.sse_live')` |

#### ChildSelector

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/ChildSelector.svelte` |
| **Props** | `children` (ChildOption[]: id, name, age, size), `activeId`, `onSelect`, `onAdd` |
| **Estados** | `active` (fundo/borda rosa) / `inactive` (off-white) |
| **Chips** | Avatar gradiente com iniciais, nome, idade (itálico), tamanho (badge rosa) |
| **Ícones** | Plus (lucide-svelte) no botão adicionar |

#### EmptyState

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/EmptyState.svelte` |
| **Props** | `variant` ('centered' \| 'inline'), `title`, `description`, `accent` ('default' \| 'pink'), `action` ({label, variant: 'pk'\|'bk'\|'ghost', onclick}), `icon` (Snippet) |
| **Variantes** | `centered` (layout vertical completo com shape circular 5rem) / `inline` (horizontal row) |
| **Fallback** | Círculo interno se nenhum icon Snippet fornecido |
| **Ações** | pk (rosa), bk (preto), ghost (outlined) |

#### Footer

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/Footer.svelte` |
| **Props** | Nenhuma — estático |
| **Grid** | 4 colunas (Sobre, Ajuda, Legal, Social), responsivo: 2-col em 76.8rem, 1-col em 48rem |
| **Links** | Instagram, TikTok, Twitter (externo, target=_blank, rel=noopener) |
| **Copyright** | Ano dinâmico via `new Date().getFullYear()` |

#### GrowthChart

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/GrowthChart.svelte` |
| **Props** | `variant` ('compact' \| 'full'), `childName`, `currentSize`, `nextSize`, `daysUntil`, `progress` (0-100), `sizes` (SizeEntry[]), `eyebrow`, `description`, `primaryAction`, `secondaryAction` |
| **Seções** | Eyebrow (itálico rosa, fonte 0.75rem), nome da criança, transição (tamanho atual → seta → próximo), dias até, barra progresso (gradiente rosa→roxo), timeline dots (past=apagado, current=preto, next=rosa), descrição, ações |
| **Efeito** | Vidro líquido — `background: var(--color-glass)` |
| **i18n** | `$t('growth_chart.*')` — current_size, next_size, days_until |

#### ItemForm

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/ItemForm.svelte` |
| **Props** | `currentStep` (1\|2), `totalSteps` (2), `formData` ({title, category, size, condition, gender, photos: File[], price, description}), `onSubmit`, `onBack` |
| **Step 1** | Título (input), chips de categoria/tamanho/condição/gênero (FilterBar + Badge) |
| **Step 2** | Fotos (drag-drop + thumbnails + remover), preço (prefixo R$), descrição (textarea) |
| **Progresso** | Barra rosa `(currentStep / totalSteps) * 100` com transição |
| **Navegação** | Back (ghost + ArrowLeft), Continue (dark + ArrowRight), Publish (primary rosa) |
| **Ícones** | Camera, Plus, X, ArrowLeft, ArrowRight (lucide-svelte) |
| **i18n** | Todos labels e placeholders via `$t('sell.*')` |

#### NotificationCard

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/NotificationCard.svelte` |
| **Props** | `notification` (Notification), `onclick` |
| **Estados** | `lida` (fundo branco, título 700) / `não lida` (fundo rosa suave, título 900 + dot rosa 0.5rem) |
| **Ícones** | TrendingUp (growth_prediction), Target (new_match), Bell (outros) — lucide-svelte |
| **Time** | `timeAgo` derivado: agora/ X min atrás / X h atrás / X d atrás via Intl + i18n |
| **BEM** | `.notification-card--unread` |

#### PageHeader (`components/`)

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/components/PageHeader.svelte` |
| **Props** | `variant` ('default' \| 'hero'), `title`, `subtitle` |
| **Variante hero** | Gradiente rosa (`linear-gradient(135deg, #FF5F9E, #FFB3D9)`), border-radius inferior 2.4rem, fonte maior (1.8rem) |
| **Variante default** | Padding simples (1.5rem 1rem 1rem), título 1.4rem, subtítulo opcional 0.85rem |

---

## 3. Componentes de Shell

#### TopBar

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/shell/TopBar.svelte` |
| **Props** | `variant` ('catalog' \| 'chat') |
| **Variante catalog** | Logo "BabyClothes" (Londrina Solid, link /catalog), search bar com lupa, botão "Chat AI" (ghost), botão "Publicar" (rosa), avatar |
| **Variante chat** | Navegação por tabs (Catálogo \| Mensagens \| Crescimento) com indicador active rosa |
| **Avatar** | Foto do usuário ou fallback com inicial |
| **Efeito** | Vidro líquido: `backdrop-filter: blur(12px)`, fixed top, z-index 100 |
| **Ícones** | Search, MessageSquare (lucide-svelte) |
| **i18n** | `$t('topbar.*')` — search_label, nav.catalog, nav.chat_ai, publish |

#### BottomNav

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/shell/BottomNav.svelte` |
| **Props** | Nenhuma (usa `$page.url.pathname` para active state) |
| **Tabs** | Catálogo (Home), Chat (MessageSquare), Crianças (Baby), Vender (Plus) |
| **Estados** | `active` (cor rosa) / `inactive` (cinza), via `aria-current="page"` |
| **Efeito** | Vidro líquido, padding-bottom com `safe-area-inset-bottom`, fixed bottom, z-index 100 |
| **Responsivo** | Escondido em > 76.9rem (desktop — TopBar assume) |
| **i18n** | `$t('nav.*')` — catalog, chat, child, sell |
| **Ícones** | Home, MessageSquare, Baby, Plus (lucide-svelte) |

#### PageHeader (`shell/`)

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `apps/web/src/lib/presentation/shell/PageHeader.svelte` |
| **Props** | `title`, `showBack` (boolean), `onBack`, `actions` (Snippet) |
| **Funcionalidade** | Botão voltar (ArrowLeft) com fallback para `history.back()`, slot de ações à direita |
| **Estados** | `showBack=true` (exibe ArrowLeft + título) / `false` (apenas título) |
| **Ícones** | ArrowLeft (lucide-svelte) |

---

## 4. Resumo

| Categoria | Quantidade | Componentes |
|-----------|-----------|-------------|
| **Primitives** (ui) | 7 | Avatar, Badge, Button, FilterBar, Input, Spinner, Toast |
| **Composite** (ui) | 5 | Card, Carousel, ChatInput, ItemList, Modal |
| **Page-level** (web) | 13 | AuthScreen, RegistrationForm, ItemCard, CategoryTabNav, ChatBubble, ChatHeader, ChildSelector, EmptyState, Footer, GrowthChart, ItemForm, NotificationCard, PageHeader |
| **Shell** (web) | 3 | TopBar, BottomNav, PageHeader (shell) |
| **Total** | **28** | |

### Componentes com Testes (7)

Avatar, Badge, Button, FilterBar, Input, Spinner, Toast

### Padrões Comuns

- **Design Tokens**: Todos os componentes usam `--color-pk` (rosa #FF3CAC), `--color-bk` (preto), `--color-wh` (branco), `--color-glass` (vidro líquido), `--font-lato` (corpo), `--font-cormorant` (display)
- **Efeito Vidro**: Presente em Card, TopBar, BottomNav, ChatBubble, ChatHeader, GrowthChart — `background: var(--color-glass)` + `backdrop-filter: blur(12px)`
- **Ícones**: `packages/ui` usa SVGs inline; `apps/web` usa `lucide-svelte`
- **i18n**: Componentes de página usam `$t('key')` para en-US/pt-BR com `$t('key', { var })` para interpolação
- **Svelte 5 Runes**: `$state()`, `$derived()`, `$props()`, `$effect()`, `$bindable()`, `Snippet`
- **BEM CSS**: `.bc-block__element--modifier` (ui) / `.block__element--modifier` (web)
- **Responsividade**: Mobile-first, breakpoints em 48rem, 64rem, 76.8rem

---

*Documento gerado em 2026-06-26.*
