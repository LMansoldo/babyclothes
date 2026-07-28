# Design — Toast service para interceptar erros de request/response

> Data: 2026-07-20 · Status: aprovado (brainstorming) · Próximo passo: writing-plans
> App: `apps/web` (SvelteKit 2 + Svelte 5). Componente visual base: `Toast` (design-system, já existe).

## 1. Objetivo

Centralizar o tratamento de erros de rede/HTTP para que **qualquer falha de request/response** exiba automaticamente um toast localizado ao usuário, sem cada call precisar lembrar de tratar. Cobrir três canais: requests client-side (repositórios), form actions do SvelteKit e o stream SSE do chat do agente.

### Não-objetivos (YAGNI)

- Não substitui o tratamento **inline** existente (ex.: erros de validação 422 do registro continuam nos campos).
- Não cria sistema de notificações persistente (isso é a rota `/notifications`, outra coisa).
- Não faz retry/backoff automático de requests (pode virar spec futura).
- Não faz toast no servidor (SSR não tem DOM) — só normaliza e propaga.

## 2. Decisões (do brainstorming)

| Tema | Decisão |
|------|---------|
| Escopo | HTTP client (browser) + form actions + SSE |
| Gatilho | **Todo non-2xx** vira toast por padrão, com **opt-out por chamada** (`silent`) |
| Mensagem | **Genérica por categoria**, via i18n (en/pt). Nunca vaza texto cru do servidor |
| Local | Store + container em `apps/web`, usando o primitivo `Toast` do design-system |
| Interceptação HTTP | **Cliente HTTP central** (`httpClient`) — único ponto por onde os requests passam |

## 3. Arquitetura

```
             ┌──────────────────────────────────────────────┐
             │            apps/web (browser)                 │
             │                                               │
  repos ───► │  httpClient.request(path, init, opts)         │
  (5x)       │      │ fetch('/api'+path)                     │
             │      │ categoriza erro (network|server|client)│
             │      │ if !silent && browser → toast.error()  │──┐
             │      └─ rejeita HttpError normalizado          │  │
             │                                               │  │ dispatch
  actions ─► │  toastFromActionResult(result, {silent})──────┼──┤
             │                                               │  │
  SSE ─────► │  catch(stream) → toast.error(errors.network)──┼──┤
             │                                               │  ▼
             │                    stores/toast.ts  (fila writable)
             │                                │
             │              ToastContainer.svelte (no +layout)
             │                                │ renderiza pilha de <Toast/>
             └──────────────────────────────────────────────┘
```

Três camadas independentes:
1. **`toast` store** — estado/fila cross-cutting (como um logger). Não conhece HTTP.
2. **`ToastContainer`** — apresentação; só assina o store e renderiza.
3. **Fontes de erro** (`httpClient`, actions helper, SSE) — dispatcham no store.

> Nota de camadas: `httpClient` (infra) importar o `toast` store é uma dependência cross-cutting aceitável (como logging). Não introduzimos "notifier port" — decidido no brainstorming que é exagero para este caso.

## 4. Componentes

### 4.1 Toast store — `apps/web/src/lib/stores/toast.ts`

Estado da fila e API imperativa. Sem DOM, testável com fake timers.

```ts
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'pk'

export interface ToastItem {
  id: string
  type: ToastType
  message: string        // já resolvida/traduzida (string final, não chave)
  title?: string
  duration: number       // ms; 0 = não expira sozinho
}

export interface ToastOptions {
  title?: string
  duration?: number      // sobrescreve o default por tipo
}
```

API pública (objeto `toast`):
- `toast.error(message, opts?)` · `toast.success(...)` · `toast.info(...)` · `toast.warning(...)`
- `toast.show(item: Omit<ToastItem,'id'>): string` (retorna id)
- `toast.dismiss(id: string): void`
- `toast.clear(): void`
- `subscribe` (é/expõe um `Readable<ToastItem[]>` para o container)

Comportamento:
- **Durações default**: erro/warning `6000ms`, success/info/pk `3000ms`. `duration: 0` desativa auto-dismiss.
- **Auto-dismiss**: ao adicionar, agenda `setTimeout(dismiss, duration)` se `duration > 0`. `dismiss` limpa o timeout.
- **Máx. visíveis**: `MAX_VISIBLE = 3`. Ao exceder, remove o **mais antigo** (FIFO).
- **Dedupe**: se já existe um toast **ativo** com mesmo `type` + `message`, não adiciona um novo (reinicia o timer do existente). Evita rajada de toasts idênticos num 5xx em cascata.
- **id**: `crypto.randomUUID()` com fallback para timestamp+random.

Regra de camadas: o store guarda `message` **já traduzida**. Quem chama (httpClient etc.) resolve a chave i18n antes (via `get(t)`), porque o store não deve depender de i18n.

### 4.2 ToastContainer — `apps/web/src/lib/presentation/components/ToastContainer.svelte`

- `import { toast } from '$lib/stores/toast'` e assina a lista (`$toast` ou store dedicada).
- Renderiza `{#each $toasts as t (t.id)}` um `<Toast type={t.type} title={t.title} message={t.message} onclose={() => toast.dismiss(t.id)} />`.
- Wrapper `position: fixed`, canto **superior direito** no desktop e **topo full-width** no mobile (≤ 40rem), `z-index` alto (acima de topbar `z-index:100`), `pointer-events: none` no wrapper e `auto` em cada toast (para não bloquear cliques na tela).
- Região com `aria-live="polite"` (o próprio `Toast` já tem `role="alert"`).
- **Unidades em `rem`** (RULES: 10px = 1rem). Gap `0.8rem`, largura máx `min(36rem, calc(100vw - 2rem))`.
- Animação de entrada/saída simples (usar keyframe `bc-toast` que já existe nos tokens, ou transição Svelte `fly`).
- Renderizado **uma vez** no `+layout.svelte`, **inclusive nas rotas "bare"** (login/register/onboarding), para valer em toda a app (ver §7).

### 4.3 Cliente HTTP central — `apps/web/src/lib/infrastructure/http/httpClient.ts`

Único ponto de saída HTTP do browser. Assinatura:

```ts
export interface HttpOptions extends RequestInit {
  silent?: boolean            // não dispara toast (mas ainda rejeita)
  silentStatuses?: number[]   // status específicos sem toast (ex.: [401, 422])
}

export class HttpError extends Error {
  readonly status: number          // 0 = erro de rede/timeout
  readonly category: ErrorCategory // 'network' | 'server' | 'client'
  readonly code?: string           // err.error do body, se houver
  readonly body?: unknown
}

export async function httpRequest<T>(path: string, options?: HttpOptions): Promise<T>
```

Fluxo:
1. Monta `input = path.startsWith('http') ? path : '/api' + path`.
2. `fetch(input, init)` dentro de `try`:
   - **Falha de rede/timeout** (throw do fetch) → `category = 'network'`, `status = 0`.
   - **`res.ok`** → parseia e retorna `T` (204/sem corpo → `undefined as T`).
   - **`!res.ok`** → `category = res.status >= 500 ? 'server' : 'client'`. Tenta ler `body`/`code = body.error`.
3. Em qualquer erro:
   - Monta `HttpError`.
   - **Toast** se: `browser === true` **e** `!options.silent` **e** `!options.silentStatuses?.includes(status)`.
     Mensagem = `get(t)(messageKeyFor(category))` (ver §5).
   - **Rejeita** com o `HttpError` (o chamador ainda pode tratar/mostrar inline).
4. **`browser`** vem de `$app/environment`. No SSR, nunca faz toast — só normaliza e propaga (resolve o caso load/actions no servidor).

Helpers de conveniência (opcionais, açúcar sobre `httpRequest`): `httpClient.get/post/put/del(path, body?, opts?)` que setam método, `Content-Type: application/json` e `JSON.stringify`.

### 4.4 Integração com form actions — helper

Actions rodam no servidor e retornam `fail(status, data)`. O toast é client-side, então acontece no callback do `use:enhance`. Helper:

```ts
// $lib/presentation/forms/toastActionResult.ts
export function toastActionResult(
  result: ActionResult,
  opts?: { silent?: boolean }
): void
```
Regra: dispara `toast.error(errors.generic)` quando `result.type === 'error'` (erro inesperado do runtime) **ou** `result.type === 'failure'` com status `>= 500`. **Não** dá toast em `failure` de validação (4xx com `data.error === 'validation_failed'`) nem quando `opts.silent`. Uso **opt-in** por formulário — o registro (que já mostra inline) passa `silent` ou simplesmente não chama.

### 4.5 Integração com SSE

`SseChatRepository` emite chunks; o consumidor (`routes/agent/+page.svelte`) já tem `catch` que seta `chatState = 'error'`. Adicionar ali:
```ts
} catch (e) {
  chatState = 'error'
  toast.error(get(t)('errors.network'))
}
```
Stream não tem status HTTP → categoria `network`. Opt-out trivial (só não chamar). Sem mudança no `IntakeMachine`.

## 5. Mensagens (i18n)

Chaves novas em `apps/web/src/lib/i18n/en.json` e `pt.json`, bloco `errors`:

| Chave | en | pt |
|-------|----|----|
| `errors.network` | "Connection problem. Check your internet and try again." | "Problema de conexão. Verifique sua internet e tente novamente." |
| `errors.server` | "Something went wrong on our side. Please try again." | "Algo deu errado do nosso lado. Tente novamente." |
| `errors.generic` | "Could not complete the action. Please try again." | "Não foi possível completar a ação. Tente novamente." |
| `errors.timeout` | "The request took too long. Please try again." | "A requisição demorou demais. Tente novamente." |

`messageKeyFor(category)`: `network → errors.network` (ou `errors.timeout` se `AbortError`), `server → errors.server`, `client → errors.generic`.

## 6. Migração dos repositórios (blast radius)

Trocar `fetch(...) + if(!res.ok) throw` por `httpRequest(...)` em:
- `HttpChildRepository.ts`
- `HttpCatalogRepository.ts`
- `HttpItemRepository.ts`
- `HttpNotificationRepository.ts`
- `HttpAuthRepository.ts`

Regras da migração:
- Mesmos paths (`/children`, etc.) — o `httpRequest` já prefixa `/api`, então remover o prefixo duplicado onde aplicável.
- Onde o repo hoje trata erro específico (ex.: parse de `err.error`), usar `HttpError.code`/`HttpError.body`.
- Chamadas que **não** devem dar toast (se houver alguma que trata inline) passam `{ silent: true }`.
- Atualizar os testes existentes (`HttpCatalogRepository.test.ts`, `HttpItemRepository.test.ts`) para o novo caminho, **mockando `httpRequest`/`fetch`** conforme o padrão atual.

## 7. Onde é montado

- `+layout.svelte`: adicionar `<ToastContainer />` uma vez (fora do bloco "bare"? decidir: toasts devem aparecer também em `/login`, `/register`, `/onboarding`, então montar **sempre**, inclusive nas bare routes). Renderizar no fim do markup para ficar por cima.

## 8. Plano de testes (TDD)

**`stores/toast.ts`** (unit, fake timers):
- `error()` adiciona 1 item com type/message/duration corretos.
- auto-dismiss remove após `duration`.
- `duration: 0` não expira.
- `MAX_VISIBLE`: 4º toast remove o mais antigo.
- dedupe: mesma `type`+`message` não duplica; reinicia timer.
- `dismiss(id)` remove e cancela timeout; `clear()` esvazia.

**`httpClient.ts`** (unit, `vi.stubGlobal('fetch', ...)` + mock do store + mock de `$app/environment`):
- 2xx → retorna body tipado; 204 → undefined.
- 500 → dispara `toast.error(errors.server)` e rejeita `HttpError{status:500,category:'server'}`.
- 400 → `toast.error(errors.generic)`, category `client`.
- `{ silent: true }` → **não** chama toast, ainda rejeita.
- `silentStatuses: [422]` + 422 → sem toast.
- erro de rede (fetch rejeita) → `errors.network`, status 0.
- `browser === false` (SSR) → **nunca** chama toast; ainda rejeita.
- extrai `code` de `body.error`.

**`ToastContainer.svelte`** (@testing-library/svelte):
- renderiza N `<Toast>` a partir do store.
- clicar em fechar chama `toast.dismiss(id)` (item some).
- `aria-live` presente.

**`toastActionResult`** (unit):
- `type:'error'` → toast.
- `failure` 500 → toast; `failure` validação → sem toast; `silent` → sem toast.

## 9. Estrutura de arquivos

```
apps/web/src/lib/
├── stores/
│   ├── toast.ts                        (novo)
│   └── toast.test.ts                   (novo)
├── infrastructure/http/
│   ├── httpClient.ts                   (novo)
│   ├── httpClient.test.ts              (novo)
│   └── Http*Repository.ts              (migrados)
├── presentation/
│   ├── components/
│   │   ├── ToastContainer.svelte       (novo)
│   │   └── ToastContainer.test.ts      (novo)
│   └── forms/
│       ├── toastActionResult.ts        (novo)
│       └── toastActionResult.test.ts   (novo)
├── i18n/{en,pt}.json                   (+ bloco errors)
└── routes/
    ├── +layout.svelte                  (+ <ToastContainer/>)
    └── agent/+page.svelte              (+ toast no catch do SSE)
```

## 10. Riscos e mitigações

- **Toast duplicado** onde já há tratamento inline (registro 422) → mitigado por `silent`/`silentStatuses` e pelo helper de actions ignorar validação.
- **Rajada de toasts** (várias chamadas falhando juntas) → dedupe + `MAX_VISIBLE`.
- **SSR** chamando toast → guard por `browser`.
- **Regressão nos 5 repos** → migração coberta por testes; rodar `check` + `test` após cada repo.

## 11. Convenções obrigatórias

- Svelte 5 runes; BEM + `<style>` scoped no `ToastContainer`; **`rem`** (10px=1rem), nunca `px`; sem emojis; sem `any` (usar `unknown`+narrow no parse de body); strings via i18n.
- Validar cada `.svelte` novo com o Svelte MCP (`mcp__svelte__svelte-autofixer`).
