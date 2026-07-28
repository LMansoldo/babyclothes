# Spec detalhada — UI da rota `/profile` (modo agente) vs mock 08 `/account · perfil`

> Data: 2026-07-21 · Base visual: `BabyClothes Chat Mocks.dc.html`, `data-screen-label="08 — /account"` (linhas 625–677).
> Base de código: `apps/web/src/routes/profile/+page.svelte`. Formato: work packages (WP1–WP6) para subagente.
> Objetivo: reconstruir `/profile` em **modo agente** batendo com o mock 08, mantendo a versão marketplace atrás de flag.

## 0. Contexto e diagnóstico

Hoje `/profile` é a tela de **marketplace** (My listings / Favorites / Purchases). O mock 08 é a **conta do modo agente** (crianças, histórico de conversas, localização, notificações, idioma, ajuda). São telas diferentes. Em modo agente, o `AgentTopBar` (`onProfile`) já manda pra `/profile` — então o usuário cai na tela errada.

**Rota:** o mock rotula `/account`, mas a rota real é `/profile` e o topbar já aponta pra ela. **Manter `/profile`** (não criar `/account`); é só o rótulo do mock.

### Delta mock 08 × `/profile` atual

| Área | Mock 08 (agente) | Hoje |
|------|------------------|------|
| Header | Voltar + título "Minha conta" | Sem voltar, sem título |
| Card de perfil | Centralizado: avatar 72px gradiente, nome, email, **3 badges** (crianças / cidade / Online) | À esquerda, sem badges |
| Lista | Minhas crianças(+2), Histórico de conversas, Localização, Notificações(toggle), Idioma(PT-BR/EN), Ajuda | My listings, Favorites, Purchases, Language |
| Idioma | Segmentado PT-BR \| EN | Link que alterna |
| Sair | Outline, texto **vermelho** + ícone | Outline preto |

## Regras globais

1. Svelte 5 runes; BEM; `<style>` scoped; **sem emojis** (ícones `lucide-svelte` na rota, SVG/snippet no DS).
2. **i18n**: tudo via `$t()`, chaves em en+pt (WP4).
3. **Flag-gated**: a versão marketplace atual **não é deletada** — fica sob `flags.marketplace`; a versão agente sob `!flags.marketplace` (mesmo padrão do registro/onboarding).
4. Tokens: usar os atuais/hex do mock por ora; **adotar tokens semânticos** quando a spec de foundations (`ds-foundations-01/03`) existir. Não bloquear nisto.
5. Componente novo de DS = `.svelte` + `index.ts` + `.stories.ts` + `.test.ts` + export nos barrels.
6. Validar cada `.svelte` com Svelte MCP (`mcp__svelte__svelte-autofixer`).

### Valores exatos do mock (referência)

- **page-header**: `bg:#fff; border-bottom:1px #F3F4F6; padding:10px 16px; flex; gap:10px`.
- **back-btn**: `30px` círculo, `bg:#F3F4F6`; ícone seta `#111`.
- **page-title**: `--sr` (Cormorant/hoje Lato), `1.2rem`, weight 400, `#111`.
- **Card**: `bg:#fff; padding:22px 20px 18px; text-align:center; border-bottom:1px #F3F4F6`.
  - Avatar `72px`, `border-radius:50%`, `background:linear-gradient(135deg,#FF3CAC,#B03EFF)`, iniciais `1.5rem/700 #fff`.
  - Nome `1rem/700 #111`; email `.78rem #9CA3AF`.
  - Badges (gap 6px, centralizado, `3px 10px`, pill, `.68rem/700`): crianças `#FFE8F5/#FF3CAC`; cidade `#F3F4F6/#374151`; Online `#DCFCE7/#15803D` + dot verde `#22C55E`.
- **Lista**: container `padding:12px 16px; flex column; gap:4px`.
- **settings-row**: `padding:12px 14px; bg:#fff; radius:10px; space-between`. `row-left gap:10px`; ícone `16px`; label `.85rem/700 #111`.
  - Trailing: chevron `#9CA3AF`; badge `#FFE8F5/#FF3CAC`; valor `.72rem #9CA3AF` + chevron; toggle `36×20` on `#FF3CAC`; segmentado.
- **Segmentado idioma**: `border:1.5px #EDE9E4; radius:99rem`. Ativo `bg:#111 color:#fff`; inativo `transparent #374151`; itens `3px 10px .68rem/700`.
- **Sair**: `width:100%; padding:12px; radius:10px; transparent; border:1.5px #EDE9E4; color:#EF4444 .85rem/700`; ícone logout.

---

## WP1 — `SettingsRow` (novo composite no DS)

`packages/design-system/src/composites/SettingsRow/SettingsRow.svelte`. Linha genérica de lista de conta.

### API
```ts
export interface SettingsRowProps {
  label: string
  icon?: Snippet            // ícone à esquerda (16px), passado pela rota (lucide)
  trailing?: Snippet        // conteúdo à direita (chevron/badge/toggle/valor/segmentado)
  onclick?: () => void      // se definido, a linha é <button>; senão <div>
  ariaLabel?: string
}
```
- Estrutura: `.settingsrow` (space-between) → `.settingsrow__left` (icon + `.settingsrow__label`) + `{@render trailing?.()}`.
- Se `onclick` → renderiza `<button>` (acessível, `:focus-visible`); senão `<div role="group">`.
- Estilos do mock (`.settings-row`/`.row-left`/`.settings-label`), em `rem`.
- **Chevron não é embutido** — a rota decide o trailing (chevron, badge, toggle…). Fornecer um snippet helper de chevron na rota, ou aceitar que a rota importe `ChevronRight` do lucide.

### Testes
- Renderiza label; renderiza icon/trailing snippets; vira `<button>` só com `onclick`; click dispara `onclick`; `<div>` sem onclick.

**DoD:** componente + stories (com/sem onclick, com badge/toggle/valor) + testes verdes; export nos barrels.

## WP2 — `PageHeader` com botão voltar (aditivo)

`packages/design-system/src/patterns/PageHeader/PageHeader.svelte`. Hoje só tem title/subtitle/variant. Adicionar **opt-in** `onBack`:
```ts
onBack?: () => void
```
- Quando `onBack` definido (variant `default`), renderizar o `.back-btn` (30px, `#F3F4F6`, seta) antes do título, layout `.page-header` do mock.
- **Blast radius:** aditivo — telas que não passam `onBack` ficam iguais. Verificar consumidores atuais do `PageHeader` (grep) e confirmar que nada muda.
- Título usa `--sr` 1.2rem/400 (como o mock).

**DoD:** `onBack` opcional funciona; sem `onBack`, header idêntico ao atual; testes cobrindo os dois.

## WP3 — Segmented control de idioma

Opção **A (recomendada, menor):** montar o segmentado **inline na rota** (dois `<button>` num wrapper pill), já que só o idioma usa. Estilos do mock (§ valores).
Opção B: criar `SegmentedToggle` no DS se houver outro uso previsto — **não** criar sem 2º caso (YAGNI).

**DoD:** PT-BR/EN alterna `setLocale`, item ativo destacado (`#111/#fff`).

## WP4 — i18n (novas chaves)

Em `apps/web/src/lib/i18n/{en,pt}.json`, bloco `profile` (acrescentar; manter as antigas p/ marketplace):

| Chave | pt | en |
|-------|----|----|
| `profile.account_title` | "Minha conta" | "My account" |
| `profile.my_children` | "Minhas crianças" | "My children" |
| `profile.chat_history` | "Histórico de conversas" | "Chat history" |
| `profile.location` | "Localização" | "Location" |
| `profile.notifications` | "Notificações" | "Notifications" |
| `profile.help` | "Ajuda" | "Help" |
| `profile.logout_account` | "Sair da conta" | "Sign out" |
| `profile.badge_children` | "{{count}} crianças" | "{{count}} children" |
| `profile.status_online` | "Online" | "Online" |

Idioma/segmentado reaproveita labels "PT-BR"/"EN" (podem ser literais no segmentado).

## WP5 — Reconstruir a rota `/profile` (modo agente, flag-gated)

`apps/web/src/routes/profile/+page.svelte`:
- `{#if flags.marketplace}` → **manter** a UI atual (marketplace).
- `{:else}` → nova UI do mock 08:
  1. `PageHeader title={$t('profile.account_title')} onBack={() => history.back()}` (ou `goto('/agent')`).
  2. **Card**: `Avatar` (iniciais de `session.name`, 72px, gradiente — ver decisão) + nome + email + linha de **3 `ProfileBadge`/`Badge`**: crianças (`profile.badge_children` com count real de `children`), cidade (`session.city` → "São Paulo, SP"), Online (`ProfileBadge variant="status" status="online"`).
  3. **Lista** de `SettingsRow`:
     - Minhas crianças (`Heart` rosa) → trailing badge count + chevron → `goto('/child')`.
     - Histórico de conversas (`MessageSquare`) → chevron → destino a definir (`/agent` por ora; marcar TODO se não houver rota de histórico).
     - Localização (`MapPin`) → valor `session.city` + chevron.
     - Notificações (`Bell`) → `Toggle` (estado local; persistência = fora de escopo, marcar).
     - Idioma (`Globe`) → segmentado PT-BR/EN (WP3).
     - Ajuda (`HelpCircle`) → chevron → `/help` (ou externo; marcar se não existir).
  4. **Sair da conta**: botão outline vermelho + `LogOut` → `handleLogout` (já existe).
- Contagem de crianças: buscar via `HttpChildRepository.findAll(session.userId)` no load/onMount (a página do agente já faz isso — reusar padrão). Se falhar, badge some (não quebra).

**DoD:** em modo agente, `/profile` bate com o mock 08 (header, card, badges, 6 linhas, sair vermelho); marketplace intacto sob flag.

## WP6 — Verificação

1. `check` + `test --run` (web + DS) verdes.
2. i18n en+pt renderizam; sem string hardcoded.
3. **Playwright ~390px**, autenticado, `/profile` em modo agente: screenshot vs mock 08 — header/voltar, avatar gradiente + iniciais, 3 badges, 6 linhas com trailings corretos (badge/valor/toggle/segmentado/chevron), botão sair vermelho.
4. Marketplace: com `flags.marketplace=true`, a tela antiga continua igual.
5. Svelte MCP autofixer limpo nos `.svelte` novos/alterados.

---

## Decisões pendentes (confirmar antes/na implementação)

1. **Avatar gradiente**: `Avatar` hoje é sólido (`fill: pk/bk/of`). Opções: (a) adicionar `fill="gradient"` ao `Avatar` (aditivo, reutilizável); (b) render inline na rota. Recomendo **(a)**.
2. **Destinos** de "Histórico de conversas" e "Ajuda": não há rotas hoje. Definir alvo ou deixar `TODO`/desabilitado (não inventar rota).
3. **Persistência do toggle de Notificações**: só visual agora, ou já grava preferência? (fora de escopo sugerido).

## Fora de escopo

- Não implementar as telas de destino (crianças detalhe, histórico, ajuda) — só a navegação.
- Não deletar a versão marketplace.
- Não migrar para tokens semânticos agora (adotar quando as specs de foundations landarem).
