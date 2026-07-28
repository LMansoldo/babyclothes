# Design — DS adoption / cleanup (apps/web)

> Data: 2026-07-21 · Status: aprovado (pós-auditoria) · Origem: auditoria de pente-fino do `apps/web/src` (2026-07-21).
> Objetivo: eliminar componentes custom que duplicam o design system, trocar elementos crus por primitivos do DS, e corrigir cores hex que já têm token hoje.

## 1. Escopo e fronteira

**Neste spec:** de-duplicação de componentes, elementos crus → primitivos do DS, e fixes de cor **cujo token já existe hoje** (`--pk`, `--color-pk-purple`, `--color-error`).

**Fora deste spec (vai para as specs de foundations):** os cinzas Tailwind (`#9CA3AF`, `#6B7280`, `#374151`, `#D1D5DB`, `#EDE9E4`, `#F3F4F6`), os fundos escuros (`#0f0f0f`/`#1a0814`/`#0a0a1a`) e a escala tipográfica/spacing — esses só ganham token nas specs `ds-foundations-01/02/03`. Aqui **não** os tocamos (evita retrabalho); a migração deles é a "adoção oportunista" daquelas specs.

**Ignorar (legítimo):** as cores do logo do Google (`#4285F4/#EA4335/#FBBC05/#34A853`) em SVG de marca.

## 2. Regras globais

1. Migrações **preservam comportamento** — cada uma é refactor: rodar os testes existentes (verdes antes e depois) e conferir paridade visual (screenshot).
2. **TDD**: onde há lógica (mapeamento de props, validação), teste primeiro. Para troca puramente visual, o "teste" é o screenshot + `check`/testes existentes verdes.
3. Svelte 5 runes; BEM; `rem`; sem emojis; i18n intacto.
4. Validar cada `.svelte` alterado com Svelte MCP (`mcp__svelte__svelte-autofixer`).
5. **Nada é deletado** exceto código comprovadamente morto (WP1) e componentes substituídos por equivalente do DS (WP2).

## 3. Work packages

Ordem sugerida: WP1 → WP2 → WP3 → WP6 (fixes de cor rápidos) → WP4 → WP5 → WP7 → WP8. WP independentes podem paralelizar.

### WP1 — Deletar código morto: `ChildRegistrationForm`

`lib/presentation/components/ChildRegistrationForm.svelte` **não é importado em lugar nenhum** (confirmado por grep, sem import dinâmico). Duplica `Input`/`ChildInlineForm`.
- **Ação:** deletar o arquivo (e o `.test.ts`/`.stories` se houver). Rodar `check`/`test` — nada deve quebrar.
- **DoD:** arquivo removido; build e testes verdes; `grep -rn ChildRegistrationForm src` vazio.

### WP2 — `ChildSelector` (custom) → `ChildSelectorChips` (DS)

`lib/presentation/components/ChildSelector.svelte` duplica o composite `ChildSelectorChips` (props quase idênticas). Usado em `routes/child/+page.svelte:136`.
- Mapear props na chamada da rota:
  - `activeId` → `selectedId`
  - `children: ChildOption[]` → `{ id, name, age, size, avatarUrl? }[]` (adaptar o shape; a rota já tem os dados de `Child`).
  - `onSelect`, `onAdd` iguais.
- O DS tem `getInitials` melhor (2 partes) que o custom (só 1ª letra) — ganho de qualidade.
- **Ação:** trocar o import/uso na `routes/child/+page.svelte` para `ChildSelectorChips` do DS; **deletar** `ChildSelector.svelte` (+ testes/stories locais). Isso já remove o `#7b2ff7` daquele arquivo.
- **DoD:** `routes/child` usa `ChildSelectorChips`; visual idêntico (screenshot); `ChildSelector` removido; testes verdes.

### WP3 — `<input>` de UI crus → `Input` (DS)

Trocar **apenas inputs de UI visíveis** por `Input`. **NÃO** tocar nos `<input type="hidden">` (padrão do `enhance` — `routes/register/+page.svelte` inteiro e `routes/login` linhas 95/146/147 são hidden, deixar).
- `routes/child/register/+page.svelte` (linhas 37/48/59/70/81 — inputs reais) → `Input`.
- `routes/login/+page.svelte` (linhas 199/215 — campos visíveis de e-mail/senha) → `Input` (ou confirmar se já não deveriam vir do `EmailLoginForm`; ver WP7).
- **DoD:** inputs visíveis usam `Input`; hidden intactos; validação/binding preservados; testes verdes.

### WP4 — `ItemForm` → primitivos do DS

`lib/presentation/components/ItemForm.svelte` (usado em `routes/sell/+page.svelte:70`) tem **17** elementos de form crus e 0 import do DS.
- Migrar para `Input`, `Select`, `FormField`, `Button` do DS, preservando os campos/validação/submit atuais.
- Manter a lógica de `mapItemFormToCreateInput` (application) intacta.
- **Blast radius:** só a `sell` usa; validar o fluxo de anúncio ponta-a-ponta.
- **DoD:** `ItemForm` sem `<input>/<button>` crus (usa DS); fluxo de sell funciona; screenshot vs estado anterior; testes verdes.

### WP5 — `<button>` custom → `Button` (DS), seletivo

~14 arquivos têm `<button>` estilizado localmente. **Não** é conversão cega:
- **Converter** botões de ação padrão (primário/secundário/ghost) para `Button`.
- **Manter** botões icon-only que já têm equivalente `IconButton` → usar `IconButton`.
- **Manter** casos especiais (ex.: chips, toggles, linhas clicáveis) que não são "button" do DS.
- Alvos prioritários: `routes/profile` (5), `routes/catalog` (4), `routes/notifications` (2), `MeasurementHistory`, `SettingsList`.
- **DoD:** botões de ação usam `Button`/`IconButton`; sem regressão visual; por arquivo, `check`/test verdes.

### WP6 — Fixes de cor com token existente (rápidos)

Trocar hex por token **onde o token já existe hoje** (não mexer em cinzas/dark — ver §1):
- **`#7b2ff7` → `var(--color-pk-purple)`** (`#B03EFF`): `routes/profile/+page.svelte:130` (o de `ChildSelector` some no WP2). É um roxo **errado** hoje (diverge do DS e do mock).
- **`#FF3CAC` → `var(--pk)`** (11 ocorrências) nos `.svelte`/`.css` de web.
- **`#EF4444`/`#F87171` → `var(--color-error)`** onde for cor de erro.
- **DoD:** `grep -rn '#7b2ff7\|#FF3CAC' src` (fora SVG de marca) → vazio; visual idêntico; `stylelint`/`check` verdes.

### WP7 — `AuthScreen` (login) — consolidar

`lib/presentation/components/AuthScreen.svelte` (usado em `routes/login/+page.svelte:281`) não importa DS e é o **pior ofensor de hex** (login 16 + AuthScreen 4). Existem também `LoginCard`, `EmailLoginForm`, `RegisterScreen` no DS-adjacent.
- **Ação:** verificar sobreposição entre `AuthScreen`, `LoginCard` e `EmailLoginForm`. Consolidar (usar o que já existe) ou migrar os internals do `AuthScreen` para primitivos do DS (`Input`, `Button`) + tokens.
- **Decisão pendente:** se `AuthScreen` for redundante com `LoginCard`, é candidato a merge/delete — **confirmar antes** de deletar.
- **DoD:** login sem hex cru desnecessário; usa primitivos do DS; fluxo de login (Google + e-mail) funciona.

### WP8 — Verificação + guarda-corpo

1. `check` + `test --run` (web + DS) verdes após cada WP.
2. `grep` de saúde: `#7b2ff7` e `#FF3CAC` fora de SVG de marca → vazio (WP6); `ChildSelector`/`ChildRegistrationForm` → vazio (WP1/2).
3. Playwright: screenshots das telas tocadas (child, sell, profile, login) sem regressão.
4. **Opcional (recomendado):** adicionar regra `stylelint` proibindo hex cru e `px` em componente — transforma a disciplina em CI. (Também listado no backlog das specs de foundations; fazer num lugar só.)

## 4. Não-objetivos

- Não migrar cinzas/dark/spacing/tipografia para token (é `ds-foundations-*`).
- Não redesenhar nenhuma tela (é refactor/adoção, não mudança visual).
- Não mexer em `apps/api` nem em lógica de aplicação (só a camada de apresentação).

## 5. Arquivos afetados (resumo)

```
DELETAR:  lib/presentation/components/ChildRegistrationForm.svelte (WP1)
          lib/presentation/components/ChildSelector.svelte (WP2)
MIGRAR:   routes/child/+page.svelte (WP2)
          routes/child/register/+page.svelte, routes/login/+page.svelte (WP3)
          lib/presentation/components/ItemForm.svelte (WP4)
          routes/profile, routes/catalog, routes/notifications, MeasurementHistory, SettingsList (WP5)
          routes/profile/+page.svelte + demais com #FF3CAC/#EF4444 (WP6)
          lib/presentation/components/AuthScreen.svelte + routes/login (WP7)
CONFIG:   .stylelintrc (WP8, opcional)
```
