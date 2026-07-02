# Plano: Design System BabyClothes (Repositório Separado)

## Contexto

- `packages/ui` será **congelado** — não receberá mais alterações.
- Todo o Design System será migrado para um **novo repositório** (`babyclothes-design-system`).
- O `apps/web` passará a importar os componentes e tokens do novo pacote (`@babyclothes/design-system`) como dependência local (sem publicação npm).

A referência principal é o mock em `BabyClothes architecture diagrams/BabyClothes Design System.dc.html`, que especifica **28 componentes** em 4 categorias + 5 Fundamentos.

---

## 1. Gap Analysis: Mock vs. `packages/ui`

### 1.1 Fundamentos (5/5 — alguns existem como stories)

| Item | Status no `packages/ui` | Observação |
|------|------------------------|------------|
| Marca | Não existe | Sem seção de marca/logotipo no pacote atual |
| Cores | `tokens.css` + `Colors.stories.ts` | Apenas token CSS, sem documentação visual de paleta |
| Tipografia | `tokens.css` + `Typography.stories.ts` | Apenas token CSS, sem amostras visuais |
| Espaçamento | `tokens.css` + `Spacing.stories.ts` | Apenas token CSS (space, radius, shadow, transition) |
| Efeitos | `tokens.css` + `Effects.stories.ts` | Glass tokens, blur, shadow |

> **Conclusão:** `packages/ui` tem os tokens CSS brutos e stories markdown, mas falta a seção **Marca** e não há demonstração visual interativa de paletas, fontes, ou efeitos.

### 1.2 Primitivos (7/7 — existentes no mock e no `packages/ui`)

| Componente | Mock | `packages/ui` | Status |
|-----------|------|---------------|--------|
| Avatar | `src/lib/components/Avatar/` | ✅ Existe | Consistente |
| Badge | `src/lib/components/Badge/` | ✅ Existe | Consistente |
| Button | `src/lib/components/Button/` | ✅ Existe | Consistente |
| FilterBar | `src/lib/components/FilterBar/` | ✅ Existe | Consistente |
| Input | `src/lib/components/Input/` | ✅ Existe | Consistente |
| Spinner | `src/lib/components/Spinner/` | ✅ Existe | Consistente |
| Toast | `src/lib/components/Toast/` | ✅ Existe | Consistente |

> **Conclusão:** Todos os 7 Primitivos existem. Podem ser copiados "as-is" para o novo repositório, ajustando apenas imports e barrel exports.

### 1.3 Compostos (3/3 — existentes no mock e no `packages/ui`)

| Componente | `packages/ui` | Status |
|-----------|---------------|--------|
| Card | `src/lib/components/Card/` | ✅ Existe |
| ChatInput | `src/lib/components/ChatInput/` | ✅ Existe |
| Modal | `src/lib/components/Modal/` | ✅ Existe |

> **Conclusão:** Todos os 3 Compostos existem. Mesma estratégia: copiar para o novo repositório.

### 1.4 Padrões (5 — NENHUM existe em `packages/ui`)

| Componente | Mock | `packages/ui` | Status |
|-----------|------|---------------|--------|
| ItemCard | ✅ Especificado | ❌ **Não existe** | **Falta** — card de catálogo com foto, badge condição, favoritar, preço BRL, seller row, ações contatar/comprar |
| ChatBubble | ✅ Especificado | ❌ **Não existe** | **Falta** — 3 roles: agent (vidro/ESQ), user (branco/DIR), system (rosa/centro) |
| GrowthChart | ✅ Especificado | ❌ **Não existe** | **Falta** — previsão IA de próximo tamanho com barra progresso gradiente e timeline RN→P→M→G→GG |
| NotificationCard | ✅ Especificado | ❌ **Não existe** | **Falta** — 4 tipos: growth_prediction, new_match, item_sold, system. Lida vs não-lida |
| Navegação | ✅ Especificado | ❌ **Não existe** | **Falta** — TopBar (desktop, fixed, glass) + BottomNav (mobile, < 76.8rem, glass) |

> **Conclusão:** Os 5 Padrões precisam ser **criados do zero** no novo repositório com base nas especificações do mock.

### 1.5 Carousel e ItemList — Variações Específicas

Carousel e ItemList existem em `packages/ui` como componentes **genéricos** (Carousel genérico de imagens, ItemList como grid wrapper). No Design System, eles entram como **componentes específicos do domínio BabyClothes**:

| Componente | `packages/ui` (genérico) | DS (específico) |
|-----------|------------------------|-----------------|
| **Carousel** → **CategoryCarousel** | Carousel de imagens genérico | Vitrine de categorias (ex: "Body", "Macacão", "Sapatos") com ícone + label + badge de quantidade |
| **ItemList** → **ItemGrid** | Grid wrapper genérico (items, columns, gap) | Grid de anúncios com ItemCards + infinite scroll + loading skeleton |

**Decisão:** Ambos são migrados para o novo DS, mas como componentes **específicos de domínio** (`CategoryCarousel`, `ItemGrid`), não como cópias dos genéricos do SDK.

---

## 2. O Que Será Migrado para o Novo Repositório

### 2.1 Escopo do Novo Repositório

```
babyclothes-design-system/
├── packages/
│   └── ds/
│       ├── src/
│       │   ├── tokens/
│       │   │   ├── tokens.css          ← TODO: expandir com tokens de Marca
│       │   │   ├── brand.css           ← NOVO: cores, logo, variações da marca
│       │   │   └── index.ts            ← export programático dos tokens
│       │   ├── primitives/
│       │   │   ├── Avatar/
│       │   │   ├── Badge/
│       │   │   ├── Button/
│       │   │   ├── FilterBar/
│       │   │   ├── Input/
│       │   │   ├── Spinner/
│       │   │   └── Toast/
│       │   ├── composites/
│       │   │   ├── Card/
│       │   │   ├── ChatInput/
│       │   │   ├── CategoryCarousel/   ← NOVO (ex-Carousel, específico domínio)
│       │   │   └── Modal/
│       │   └── patterns/
│       │       ├── ItemCard/           ← NOVO
│       │       ├── ItemGrid/           ← NOVO (ex-ItemList, específico domínio)
│       │       ├── ChatBubble/         ← NOVO
│       │       ├── GrowthChart/        ← NOVO
│       │       ├── NotificationCard/   ← NOVO
│       │       └── Navigation/         ← NOVO (TopBar + BottomNav)
│       ├── .storybook/
│       ├── package.json
│       ├── tsconfig.json
│       ├── svelte.config.js
│       └── vite.config.ts
├── apps/
│   └── storybook/                     ← ou Storybook standalone
├── docs/
├── package.json                       ← workspace root
├── .gitignore
└── README.md
```

### 2.2 Estratégia de Migração

| Etapa | Ação | Origem |
|-------|------|--------|
| 1 | Criar novo repositório com estrutura yarn 4 workspace + Svelte 5 + TypeScript strict | Novo |
| 2 | Copiar `tokens.css` → `src/tokens/tokens.css` | `packages/ui/src/lib/tokens/tokens.css` |
| 3 | Criar `src/tokens/brand.css` com especificações da marca (logotipo Londrina Solid, cores primárias, gradiente hero) | Mock sec. Marca |
| 4 | Copiar Avatar, Badge, Button, FilterBar, Input, Spinner, Toast → `src/primitives/` | `packages/ui/src/lib/components/*` |
| 5 | Copiar Card, ChatInput, Modal → `src/composites/` | `packages/ui/src/lib/components/*` |
| 6 | Implementar CategoryCarousel (vitrine de categorias com ícone + label + badge) baseado no mock | Mock |
| 7 | Implementar ItemCard baseado no mock (linhas 903-937) | Mock |
| 8 | Implementar ChatBubble (3 variantes: agent/user/system) baseado no mock (linhas 940-973) | Mock |
| 9 | Implementar GrowthChart com barra de progresso e timeline (linhas 976-1020) | Mock |
| 10 | Implementar NotificationCard com 4 tipos (linhas 1023-1057) | Mock |
| 11 | Implementar Navigation: TopBar + BottomNav glass (linhas 1060+) | Mock |
| 12 | Configurar Storybook com todas as stories dos 28 itens | Novo |
| 13 | Adicionar `@babyclothes/design-system` como dependência local no `apps/web` (sem publicação) | Novo |
| 14 | Atualizar `apps/web` para consumir `@babyclothes/design-system` em vez de `@babyclothes/ui` | `apps/web` |

### 2.3 Pacote Instalado Localmente

O pacote será consumido via dependência local (sem publicação npm):

```
@babyclothes/design-system
├── tokens.css
├── brand.css
├── index.js (barrel exports)
├── components/
│   ├── Avatar.svelte
│   ├── Badge.svelte
│   ├── ...
│   ├── CategoryCarousel.svelte
│   ├── ItemCard.svelte
│   ├── ItemGrid.svelte
│   ├── ChatBubble.svelte
│   ├── GrowthChart.svelte
│   ├── NotificationCard.svelte
│   └── Navigation.svelte (TopBar + BottomNav)
```

`apps/web` passa a importar:

```ts
// Antes (via workspace)
import { Button } from '@babyclothes/ui'
import '@babyclothes/ui/tokens.css'

// Depois (via dependência local)
import { Button } from '@babyclothes/design-system'
import '@babyclothes/design-system/tokens.css'
```

---

## 3. O Que Fica em `packages/ui` (Congelado)

`packages/ui` permanece no monorepo como o **SDK de renderização do agente**. Nada muda neste pacote.

- ✅ Código existente intacto
- ❌ Sem novos componentes
- ❌ Sem alterações nos componentes existentes
- ❌ Sem correções de bugs (a correção deve ser feita no novo DS e o web atualizado)

O `apps/web` pode continuar usando `@babyclothes/ui` temporariamente até que a migração para `@babyclothes/ds` esteja completa.

---

## 4. Resumo

| Item | Mock | `packages/ui` | Novo Repositório |
|------|------|---------------|------------------|
| Fundamentos (5) | 5 itens | Tokens CSS + stories | Mesmo + Marca + docs visuais |
| Primitivos (7) | 7 componentes | 7 componentes ✅ | Copiar |
| Compostos (3) | 3 componentes | 5 componentes ✅ (tem Carousel, ItemList) | Copiar (decidir Carousel/ItemList) |
| Padrões (5) | 5 componentes | **0 componentes** ❌ | **Criar do zero** |
| **Total** | **20 + 5 fund.** | **12 + tokens** | **20 + 5 fund.** |

### Pendências para Decisão

1. Carousel e ItemList devem ser migrados para o novo DS ou permanecem só no SDK?
2. O nome do novo pacote: `@babyclothes/ds` ou `@babyclothes/design-system`?
3. O novo repositório será público ou privado?
4. Método de publicação: npm registry público vs. GitHub Packages vs. git submodule?
