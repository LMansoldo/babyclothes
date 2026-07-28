# Design — Persistir a medição atual ao cadastrar filho (agente)

> Data: 2026-07-21 · Status: aprovado · Follow-up do fix "registro de filhos não persistia" (2026-07-21).
> App: `apps/web`. Não mexer em `apps/api`.

## 1. Problema (root cause já confirmado)

Ao cadastrar um filho no fluxo do agente, o form coleta **peso e altura atuais** (`currentWeightKg`, `currentHeightCm`), e o `POST /api/children` os envia como `current_weight_g`/`current_height_cm`. Mas a API **descarta** esses campos — `Child.changeset` só faz `cast([:name, :birth_date, :birth_weight_g, :birth_height_cm, :user_id, :document])`. Ou seja, **os dados atuais digitados são silenciosamente perdidos**; só nascem os dados de nascimento.

O modelo de dados correto para "estado atual" é uma **medição** (`child_measurements` / `GrowthRecord`), datada de agora — que também semeia o histórico de crescimento.

## 2. Objetivo

Ao cadastrar o filho no agente, **após criar o filho**, criar uma **medição inicial** com o peso/altura atuais (datada de agora), usando o endpoint que já existe: `POST /children/{id}/measurements`.

## 3. Fatos da API (confirmados)

`Api.Children.Measurement`:
- Campos: `recorded_at :utc_datetime`, `weight_g :integer`, `height_cm :integer`, `clothing_size :string`.
- `validate_required([:recorded_at, :child_id])` → **peso, altura e tamanho são OPCIONAIS** na API; só `recorded_at` (+ `child_id`) é obrigatório.
- `height_cm`/`weight_g` são **inteiros** → altura atual decimal (ex.: 68.5) precisa ser **arredondada**.

## 4. Decisões de design (explícitas)

| # | Decisão | Justificativa |
|---|---------|---------------|
| D1 | Criar a medição via o use case **`AddMeasurement`** (que valida `MeasurementInputSchema`) após o `RegisterChild.execute` retornar o filho. | Reusa camada existente; mantém validação. |
| D2 | **`clothingSize` vira opcional** em `MeasurementInputSchema` (`z.enum(VALID_SIZES).optional()`). A medição inicial é criada **sem tamanho**. | O form não coleta tamanho e a API não o exige. Derivar tamanho por idade é feature de produto separada (ver §7). |
| D3 | `heightCm` da medição = **`Math.round(currentHeightCm)`** (API é integer). `weightG` já é int (mapper faz `Math.round(kg*1000)`). | Consistente com o fix do `birthHeightCm`. |
| D4 | `recordedAt` = **agora**, ISO com offset (`new Date().toISOString()` → mas o schema exige `.datetime({offset:true})`; `toISOString()` gera `Z`, que é offset válido). | Schema `MeasurementInputSchema.recordedAt` é `.datetime({ offset: true }).optional()`. |
| D5 | Se o filho **não** tiver peso **nem** altura atuais, **não** cria medição (nada a salvar). | Evita medição vazia. |
| D6 | Falha ao criar a medição **não desfaz** o filho já criado nem bloqueia o avanço do intake. Faz `console.error` + toast **suave** opcional; o cadastro do filho continua válido. | O filho já foi persistido (sucesso principal). Melhor best-effort do que reverter. |

## 5. Implementação

### 5.1 Schema — `apps/web/src/lib/domain/child/schemas.ts`
Tornar `clothingSize` opcional em `MeasurementInputSchema`:
```ts
clothingSize: z.enum(VALID_SIZES).optional(),
```
(TDD: adicionar teste que aceita medição **sem** `clothingSize` e ainda com weight/height; manter os testes existentes de enum válido/ inválido quando presente.)

### 5.2 Builder puro — `apps/web/src/lib/application/child/buildInitialMeasurementInput.ts` (novo)
Função pura, testável, que constrói o `MeasurementInput | null` a partir do `CreateChildInput` já criado:
```ts
export function buildInitialMeasurementInput(
  input: CreateChildInput,
  now: Date = new Date(),
): MeasurementInput | null
```
- Retorna `null` se `currentWeightG` e `currentHeightCm` forem ambos ausentes (D5).
- Caso contrário: `{ weightG: currentWeightG ?? 0, heightCm: Math.round(currentHeightCm ?? 0), recordedAt: now.toISOString() }` (sem `clothingSize`).
- (Decidir: se só um dos dois existir, mandar o outro como 0 ou omitir. Recomendo enviar 0 para o ausente, já que a API aceita.)

**Testes (TDD, primeiro):**
- ambos presentes → medição com weightG/heightCm arredondado + recordedAt ISO.
- altura decimal (68.5) → heightCm 69 (round).
- ambos ausentes → `null`.
- recordedAt é ISO datetime com offset (aceito por `MeasurementInputSchema`).

### 5.3 Wiring — `apps/web/src/routes/agent/+page.svelte`
No `onSubmit` do `childForm`, **depois** do `registerChild.execute(input)` bem-sucedido (que retorna `created: Child`):
```ts
const created = await registerChild.execute(input);
children = [...children, created];

const measurement = buildInitialMeasurementInput(input);
if (measurement) {
  try {
    await new AddMeasurement(childRepo).execute(created.id, measurement);
  } catch (e) {
    console.error('Failed to save initial measurement:', e);
    // best-effort: não bloqueia; toast suave opcional
  }
}

dispatch({ type: 'CHILD_SUBMITTED', child: input });
```
- Instanciar `AddMeasurement` como os outros use cases (ou reusar uma instância no topo do script).
- Manter o `childFormSubmitting`/toast do fluxo atual (erro no `create` continua bloqueando + toast; erro na **medição** é best-effort — D6).

## 6. Verificação (evidência obrigatória)

1. `docker compose exec -T web yarn workspace @babyclothes/web test --run` — verde (novos testes do builder + schema).
2. `... web check` — 0 novos erros (o erro `"XL"` em `AddMeasurement.test` é pré-existente e não relacionado; não mexer nele).
3. **Browser (Playwright, ~390px, fluxo real do agente)** — registrar usuário novo → onboarding → `/agent` → "Sim" → "1" → preencher form com **altura atual decimal (ex.: 68.5)** e peso → "Salvar criança". Capturar `/api`:
   - `POST /api/children` → **201** (como antes).
   - **`POST /api/children/{id}/measurements`** → **201**, com body contendo `weight_g`, `height_cm` (inteiro, ex.: 69) e `recorded_at`.
   - `GET /api/children/{id}/measurements` depois → contém a medição.
   - Executável chromium: `/Users/lucasmansoldo/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell`; app em `http://127.0.0.1:5173` (o `localhost:5173` pode estar sombreado por outro processo nesta máquina).

## 7. Fora de escopo (follow-ups separados)

- **Derivação de tamanho por idade** (para exibir "· Sofia: M" no topbar e no card do perfil, como no mock): precisa de uma tabela idade→tamanho (decisão de produto — o mock mostra 8 meses → M). Fica como spec futura; quando existir, a medição inicial pode passar a incluir `clothingSize` derivado.
- **Rota marketplace `/child/register`** (hoje stub `console.log`) — persistência dela é outro item.
- **Backend**: não alterar `apps/api` (o endpoint de measurements já basta).

## 8. Regras

- Svelte 5 runes; sem `any`; TDD (teste falhando antes); i18n intacto (não há texto novo, salvo talvez um `agent.form.measurement_error` se optar por toast suave — adicionar en+pt se usar).
- Validar `.svelte` alterado com Svelte MCP se disponível; se não, não bloquear.
