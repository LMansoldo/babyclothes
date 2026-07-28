# Design — Tratar `clothingSize` nulo (medição sem tamanho)

> Data: 2026-07-21 · Follow-up da "medição inicial ao cadastrar filho". App: `apps/web`. Não mexer em `apps/api`.

## 1. Problema (confirmado em revisão)

A medição inicial criada no cadastro de filho vem com `clothing_size: null` (por decisão da spec anterior — não derivar tamanho). Mas o front assume que **sempre há tamanho**:

- `GrowthRecord.clothingSize` e `ApiMeasurementDTO.clothing_size` são tipados **`string`** (mentira de tipo — em runtime chega `null`). `mapMeasurement` propaga o `null`.
- `apps/web/src/routes/child/[id]/+page.svelte` calcula tamanho a partir de `latestRecord.clothingSize`:
  - **`nextSize`** (linha ~68): `allSizes[allSizes.indexOf(latestRecord.clothingSize) + 1]`. Com `null`, `indexOf` = **-1**, `+1` = **0** → o "próximo tamanho" vira **`RN`** (primeiro da lista) — **errado**, e ocorre **sempre** logo após o cadastro (a medição semeada é a mais recente).
  - **`growthSizes`** (linha ~55): mesma `indexOf(-1)` → estados (past/current/next) todos deslocados; `RN` marcado como `next`.
  - **Linha de histórico** (linha ~135): `{record.clothingSize}` renderiza vazio.
- `MeasurementHistory.svelte` (linha ~123): `<Chip label={item.size}>` → **chip de tamanho vazio** para a medição sem tamanho.

(`currentSize={latestRecord?.clothingSize ?? '?'}` na linha ~116 já lida com null → `'?'`.)

## 2. Objetivo

Fazer o front lidar com medições **sem tamanho** sem gerar sugestões erradas nem UI quebrada, mantendo os tipos honestos.

## 3. Fix

### 3.1 Tipos honestos
- `apps/web/src/lib/domain/child/entities/GrowthRecord.ts`: `clothingSize: string | null`.
- `apps/web/src/lib/infrastructure/http/HttpChildRepository.ts`: `type ApiMeasurementDTO.clothing_size: string | null`. `mapMeasurement` já repassa o valor — nenhum outro ajuste.

### 3.2 Cálculo de tamanho resiliente — `routes/child/[id]/+page.svelte`
Derivar o tamanho do **último registro que tem `clothingSize` não-nulo** (`latestSizedRecord`), não do `latestRecord` cru:
- `currentSize` = `latestSizedRecord?.clothingSize ?? '?'`.
- `nextSize`: se há `latestSizedRecord` **e** `indexOf(...) !== -1`, então `allSizes[idx + 1] ?? '?'`; senão `'?'`. **Nunca** cair no `indexOf(-1)+1 = 0`.
- `growthSizes`: usar o índice do `latestSizedRecord`; se não houver, todos `future` (ou `'?'`).
- Extrair essa lógica numa **função pura** testável, ex. `computeGrowthSizeInfo(records: GrowthRecord[], allSizes: string[]): { currentSize: string; nextSize: string; sizes: {label; status}[] }`, e consumir na página.

### 3.3 Exibição de linha e chip
- Linha de histórico: `{record.clothingSize ?? '—'}`.
- `MeasurementHistory`: onde o caller monta o `measurements: Measurement[]` (achar o mapeamento `GrowthRecord → Measurement`), mapear `size: clothingSize ?? '—'` (ou omitir o chip quando nulo). Se o `Chip` do DS não aceitar bem um label vazio, usar `'—'`.

## 4. Testes (TDD, primeiro falhando)

- **`computeGrowthSizeInfo`** (pura):
  - registros só com tamanho válido → current/next corretos (ex.: último = `M` → next `G`).
  - **último registro com `clothingSize: null`** (mas um anterior com `M`) → current `M`, next `G` (usa o último *com* tamanho).
  - **todos sem tamanho** → current `'?'`, next `'?'`, **nenhum** marcado `next` como `RN`.
  - último com tamanho no fim da escala (`8`) → next `'?'` (sem estourar índice).
- Regressão: `MeasurementInputSchema`/mapMeasurement continuam ok com `clothing_size` presente e ausente.

## 5. Verificação (browser)

Fluxo real: cadastrar filho no agente (semeia medição sem tamanho) → ir a `/child` → abrir o detalhe do filho. Conferir:
- "Próximo tamanho" **não** é `RN` indevidamente (deve ser `'?'` ou o tamanho correto se houver histórico com tamanho).
- Linha da medição sem tamanho mostra `—` (não vazio/nulo).
- Sem chip de tamanho vazio.

Chromium: `/Users/lucasmansoldo/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell`; app em `http://127.0.0.1:5173`.

## 6. Fora de escopo

- **Derivar tamanho por idade/medida** (para a medição inicial ter tamanho, e o topbar mostrar "· Sofia: M") — feature separada. Aqui só tornamos o front resiliente a `null`.
- Não mexer em `apps/api`.

## 7. Regras
Svelte 5 runes; sem `any`; TDD; i18n intacto (se precisar de `'—'` como literal, ok; sem string traduzível nova, salvo se preferir uma chave). Validar `.svelte` com Svelte MCP se disponível.
