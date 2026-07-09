# Primeira Versão Funcional (v1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tirar o app do modo mock e entregar a primeira versão funcional de ponta a ponta: catálogo real, detalhe de item real, criação de anúncio com upload presigned, chat IA com sessão real, e polish visual P0 (fundos, chat header, Footer, /terms, /privacy).

**Architecture:** O frontend SvelteKit consome a API Elixir via o proxy `/api/[...path]` (que injeta o JWT do cookie). Vários repositórios HTTP do web têm contratos divergentes da API real — este plano corrige os contratos, liga as páginas aos repositórios, e ajusta a API em 2 pontos pequenos (seller no detalhe do item, contexto da criança no proxy do agente). O agente de IA só precisa de bump de modelo e alinhamento de categorias.

**Tech Stack:** SvelteKit 2 + Svelte 5 (runes), TypeScript strict, Vitest, Elixir + Plug/Bandit + Ecto + ExUnit, LangGraph + @langchain/anthropic.

## Global Constraints

Copiadas de `RULES.md` e `CLAUDE.md` — **leia `RULES.md` na raiz antes de qualquer código**. Valem para TODAS as tasks:

- **Docker first:** todo build/test/check roda via scripts da raiz: `yarn test:web`, `yarn test:api`, `yarn test:agents`, `yarn test:ui`, `yarn check:web`, `yarn check:ui`, `yarn api:credo`, `yarn lint`, `yarn stylelint`. Nunca rode comandos de workspace direto no host.
- **Nunca use `any`** em TypeScript. Use `unknown` + narrowing, ou type assertions específicas (`as X`) apenas em fronteiras de I/O (JSON parse) seguidas de validação.
- **CSS: nunca `px`, sempre `rem`.** Siga os valores rem já usados no arquivo que você está editando (os componentes existentes usam valores como `0.8rem`, `1.2rem` — mantenha a escala do arquivo).
- **BEM:** `.block__element--modifier`.
- **i18n:** toda string visível ao usuário vai em `apps/web/src/lib/i18n/en.json` E `pt.json` (mesmas chaves nos dois arquivos). Em Svelte use `{$t('chave')}`; dentro de funções TS use `get(t)('chave')` (import `{ t, get } from '$lib/i18n'`).
- **Sem emojis na UI** — ícones via `lucide-svelte` no web, SVG inline no design system.
- **Svelte 5 runes:** `$props()`, `$state()`, `$derived()`, `$effect()`. Nunca sintaxe Svelte 4 (`export let`, `$:`).
- **Elixir:** lógica em contextos, controllers só delegam; `@moduledoc`/`@doc`/`@spec` em módulos/funções públicas; pattern matching em vez de if/else; `{:ok, _}`/`{:error, _}`.
- **Commits semânticos:** `feat(scope):`, `fix(scope):`, etc. Commite ao final de cada task.
- **Não modifique migrations já aplicadas.**

### Mapa de contratos da API (referência para todas as tasks)

A API Elixir (porta 4000, acessada pelo web via proxy `/api`) tem estes contratos REAIS (verificados no código):

1. `GET /catalog?category=&size=&gender=&condition=&page=&per_page=` → `{ "items": [CatalogItemJSON], "pagination": {...} }` onde `CatalogItemJSON = { id, title, category, gender, clothing_size, condition, price_cents, photo_url, seller: {id, name, avatar_url} | null, inserted_at }`. **Não existe** `sections` (o código atual do web espera `sections` — está errado).
2. `GET /items/:id` → `ItemJSON` **sem wrapper** `{item: ...}`: `{ id, title, description, category, gender, clothing_size, condition, price_cents, status, seller_id, inserted_at, updated_at, photos: [{id, url, position, item_id, inserted_at}] }`.
3. `POST /items` (JSON puro — o router só aceita `application/json`, **multipart falha**) com `Authorization: Bearer` → `201` + `ItemJSON` sem wrapper.
4. `POST /items/:id/photos` (JSON, body pode ser `{}`) → `201` + `{ upload_url, photo: {id, url, position, ...} }`. O cliente então faz `PUT` do arquivo **direto** na `upload_url` (presigned S3/R2) com header `Content-Type: image/jpeg`.
5. `POST /agent/chat` (JSON `{message, child_id, context}`, Bearer) → stream SSE `data: {"type":"text","content":"..."}\n\n` e `data: {"type":"component","component":"...","props":{...}}\n\n`.
6. Categorias canônicas dos itens (mesmas nos seeds e nos mocks do web): `romper`, `bodysuit`, `dress`, `coat`, `set`, `accessory`. Gêneros: `male | female | unisex`. Condições: `new | like_new | used`. Tamanhos: `RN, P, M, G, GG, 1, 2, 3, 4, 6, 8`. Status no banco: `active | sold | removed`.
7. O proxy do web `apps/web/src/routes/api/[...path]/+server.ts` repassa qualquer chamada `/api/*` para a API com o JWT do cookie. Chamadas do browser para a API **sempre** usam caminho relativo `/api/...`.

---

## Fase 1 — Contratos de dados web ↔ API

### Task 1: Corrigir HttpCatalogRepository (contrato `{items, pagination}`)

O repositório atual espera `{sections: {...}}`, mas a API retorna `{items: [...], pagination: {...}}` com `photo_url` (singular) e objeto `seller`. Sem isso, o catálogo real quebra.

**Files:**
- Modify: `apps/web/src/lib/infrastructure/http/HttpCatalogRepository.ts` (reescrever inteiro)
- Test: `apps/web/src/lib/infrastructure/http/HttpCatalogRepository.test.ts` (criar)

**Interfaces:**
- Consumes: `Filter` de `$lib/domain/catalog/value-objects/Filter` (`{size?, category?, gender?, condition?}`), `Item` de `$lib/domain/item/entities/Item`.
- Produces: `HttpCatalogRepository.fetch(filter: Filter): Promise<Item[]>` — assinatura inalterada (páginas catalog e chat já usam), só o parsing interno muda.

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/web/src/lib/infrastructure/http/HttpCatalogRepository.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { HttpCatalogRepository } from './HttpCatalogRepository';

const apiResponse = {
  items: [
    {
      id: 7,
      title: 'Macacão floral',
      category: 'romper',
      gender: 'female',
      clothing_size: 'P',
      condition: 'new',
      price_cents: 8900,
      photo_url: 'https://cdn.example.com/p1.jpg',
      seller: { id: 2, name: 'Maria', avatar_url: '' },
      inserted_at: '2026-07-01T00:00:00Z',
    },
  ],
  pagination: { page: 1, per_page: 20, total: 1 },
};

describe('HttpCatalogRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps the real API contract ({items, pagination}) to Item[]', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(apiResponse), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const repo = new HttpCatalogRepository();
    const items = await repo.fetch({ size: 'P', gender: 'female' });

    expect(fetchMock).toHaveBeenCalledWith('/api/catalog?size=P&gender=female');
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      id: '7',
      sellerId: '2',
      title: 'Macacão floral',
      description: '',
      category: 'romper',
      gender: 'female',
      clothingSize: 'P',
      condition: 'new',
      priceCents: 8900,
      status: 'active',
      photoUrls: ['https://cdn.example.com/p1.jpg'],
    });
  });

  it('maps null photo_url and null seller safely', async () => {
    const response = {
      items: [{ ...apiResponse.items[0], photo_url: null, seller: null }],
      pagination: apiResponse.pagination,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })),
    );

    const repo = new HttpCatalogRepository();
    const items = await repo.fetch({});

    expect(items[0].photoUrls).toEqual([]);
    expect(items[0].sellerId).toBe('');
  });

  it('throws on non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 500 })),
    );
    const repo = new HttpCatalogRepository();
    await expect(repo.fetch({})).rejects.toThrow('Catalog fetch failed: 500');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `yarn test:web`
Expected: FAIL — os novos testes quebram (o código atual procura `body.sections` e vai lançar erro ao iterar `undefined`).

- [ ] **Step 3: Reescrever o repositório**

Substituir TODO o conteúdo de `apps/web/src/lib/infrastructure/http/HttpCatalogRepository.ts` por:

```ts
import type { ICatalogRepository } from '$lib/domain/catalog/repositories/ICatalogRepository';
import type { Filter } from '$lib/domain/catalog/value-objects/Filter';
import type { Item } from '$lib/domain/item/entities/Item';

type CatalogItemDTO = {
  id: number | string;
  title: string;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  photo_url: string | null;
  seller: { id: number | string; name: string; avatar_url: string } | null;
  inserted_at?: string;
};

type CatalogResponse = {
  items: CatalogItemDTO[];
  pagination: { page: number; per_page: number; total: number };
};

export class HttpCatalogRepository implements ICatalogRepository {
  private readonly baseUrl = '/api';

  async fetch(filter: Filter): Promise<Item[]> {
    const params = new URLSearchParams();
    if (filter.size) params.set('size', filter.size);
    if (filter.category) params.set('category', filter.category);
    if (filter.gender) params.set('gender', filter.gender);
    if (filter.condition) params.set('condition', filter.condition);

    const res = await fetch(`${this.baseUrl}/catalog?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Catalog fetch failed: ${res.status}`);
    }

    const body = (await res.json()) as CatalogResponse;
    return body.items.map(mapCatalogItem);
  }
}

function mapCatalogItem(dto: CatalogItemDTO): Item {
  return {
    id: String(dto.id),
    sellerId: dto.seller ? String(dto.seller.id) : '',
    title: dto.title,
    description: '',
    category: dto.category,
    gender: dto.gender,
    clothingSize: dto.clothing_size,
    condition: dto.condition,
    priceCents: dto.price_cents,
    status: 'active',
    photoUrls: dto.photo_url ? [dto.photo_url] : [],
  };
}
```

Nota: `description: ''` e `status: 'active'` são fixos porque o endpoint de catálogo não retorna esses campos e só lista itens ativos.

- [ ] **Step 4: Rodar testes e type check**

Run: `yarn test:web` — Expected: PASS (todos, incluindo os 3 novos).
Run: `yarn check:web` — Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/infrastructure/http/HttpCatalogRepository.ts apps/web/src/lib/infrastructure/http/HttpCatalogRepository.test.ts
git commit -m "fix(web): align HttpCatalogRepository with real API contract"
```

---

### Task 2: API — incluir seller em `GET /items/:id`

A página de detalhe precisa de nome/avatar do vendedor, mas `Items.get_item/1` só faz preload de `:photos` e `item_json/1` não serializa seller.

**Files:**
- Modify: `apps/api/lib/api/items/items.ex` (função `get_item/1`, ~linha 52-59)
- Modify: `apps/api/lib/api/controllers/items_controller.ex` (função `item_json/1`, ~linha 200)
- Test: `apps/api/test/api/controllers/items_controller_test.exs` (adicionar teste no describe `GET /items/:id`)

**Interfaces:**
- Produces: `GET /items/:id` passa a incluir `"seller": {"id", "name", "avatar_url", "verified"}` quando o seller existir. `verified` = campo `is_seller` do usuário. As Tasks 3 e 4 dependem desse shape.

- [ ] **Step 1: Escrever o teste que falha**

Em `apps/api/test/api/controllers/items_controller_test.exs`, dentro do `describe "GET /items/:id"`, adicionar:

```elixir
test "returns item with seller info" do
  seller = insert(:user, name: "Maria Vendedora", is_seller: true)
  item = insert(:item, seller: seller)

  conn = conn(:get, "/items/#{item.id}") |> Api.Router.call([])

  assert conn.status == 200
  body = Jason.decode!(conn.resp_body)
  assert body["seller"]["name"] == "Maria Vendedora"
  assert body["seller"]["verified"] == true
  assert body["seller"]["avatar_url"] == seller.avatar_url
end
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `yarn test:api`
Expected: FAIL — `body["seller"]` é `nil`.

- [ ] **Step 3: Preload do seller no contexto**

Em `apps/api/lib/api/items/items.ex`, a função atual é:

```elixir
def get_item(id) do
  case Repo.get(Item, id) do
    nil -> {:error, :not_found}
    item -> {:ok, Repo.preload(item, :photos)}
  end
end
```

Trocar a linha do preload para:

```elixir
    item -> {:ok, Repo.preload(item, [:photos, :seller])}
```

E atualizar o `@doc` da função de "preloading photos" para mencionar photos e seller.

- [ ] **Step 4: Serializar o seller no controller**

Em `apps/api/lib/api/controllers/items_controller.ex`, a função `item_json/1` atual termina com:

```elixir
    if Ecto.assoc_loaded?(item.photos) do
      Map.put(base, :photos, Enum.map(item.photos, &photo_json/1))
    else
      base
    end
  end
```

Substituir esse bloco final por:

```elixir
    base
    |> put_photos(item)
    |> put_seller(item)
  end

  defp put_photos(json, %{photos: photos}) when is_list(photos) do
    Map.put(json, :photos, Enum.map(photos, &photo_json/1))
  end

  defp put_photos(json, _item), do: json

  defp put_seller(json, %{seller: %Api.Users.User{} = seller}) do
    Map.put(json, :seller, %{
      id: seller.id,
      name: seller.name,
      avatar_url: seller.avatar_url,
      verified: seller.is_seller
    })
  end

  defp put_seller(json, _item), do: json
```

Nota: o pattern match `when is_list(photos)` / `%Api.Users.User{}` garante que associações não carregadas (`%Ecto.Association.NotLoaded{}`) caem no fallback — assim `POST /items` (que não faz preload) continua funcionando sem mudanças.

- [ ] **Step 5: Rodar testes e credo**

Run: `yarn test:api` — Expected: PASS (incluindo o novo).
Run: `yarn api:credo` — Expected: sem warnings novos.

- [ ] **Step 6: Commit**

```bash
git add apps/api/lib/api/items/items.ex apps/api/lib/api/controllers/items_controller.ex apps/api/test/api/controllers/items_controller_test.exs
git commit -m "feat(api): include seller info in GET /items/:id"
```

---

### Task 3: Corrigir HttpItemRepository — create via JSON + fotos via presigned URL

O `create` atual manda multipart (`photos[]`) que a API **rejeita** (router só aceita JSON), e o `findById` espera wrapper `{item: ...}` que não existe. O fluxo correto: `POST /items` (JSON) → para cada foto, `POST /items/:id/photos` → `PUT` do arquivo na presigned URL.

**Files:**
- Create: `apps/web/src/lib/infrastructure/http/apiItemMapper.ts` (mapper compartilhado — a Task 4 reutiliza)
- Modify: `apps/web/src/lib/domain/item/entities/Item.ts` (adicionar `'removed'` ao union `ItemStatus`)
- Modify: `apps/web/src/lib/infrastructure/http/HttpItemRepository.ts` (reescrever inteiro)
- Test: `apps/web/src/lib/infrastructure/http/HttpItemRepository.test.ts` (criar)

**Interfaces:**
- Consumes: `CreateItemInput` de `$lib/domain/item/repositories/IItemRepository` (`{title, description, category, gender, clothingSize, condition, priceCents, photos: File[]}`) — inalterado.
- Produces:
  - `apiItemMapper.ts` exporta: `type ApiItemDTO`, `function mapApiItem(dto: ApiItemDTO): Item`. A Task 4 importa ambos.
  - `HttpItemRepository.create/findById/delete` — assinaturas inalteradas (`IItemRepository`).
  - `ItemStatus` passa a ser `'active' | 'sold' | 'paused' | 'removed'`.

- [ ] **Step 1: Ampliar ItemStatus**

Em `apps/web/src/lib/domain/item/entities/Item.ts`, trocar:

```ts
export type ItemStatus = 'active' | 'sold' | 'paused';
```

por:

```ts
export type ItemStatus = 'active' | 'sold' | 'paused' | 'removed';
```

- [ ] **Step 2: Escrever o teste que falha**

Criar `apps/web/src/lib/infrastructure/http/HttpItemRepository.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { HttpItemRepository } from './HttpItemRepository';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

const createdItem = {
  id: 42,
  seller_id: 1,
  title: 'Body listrado',
  description: 'Novo',
  category: 'bodysuit',
  gender: 'unisex',
  clothing_size: 'M',
  condition: 'new',
  price_cents: 4500,
  status: 'active',
};

const validInput = {
  title: 'Body listrado',
  description: 'Novo',
  category: 'bodysuit',
  gender: 'unisex' as const,
  clothingSize: 'M',
  condition: 'new' as const,
  priceCents: 4500,
  photos: [] as File[],
};

describe('HttpItemRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates the item via JSON and uploads photos via presigned URL', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createdItem, 201))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            upload_url: 'https://bucket.example.com/put',
            photo: { id: 1, url: 'https://cdn.example.com/f.jpg', position: 0 },
          },
          201,
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const repo = new HttpItemRepository();
    const file = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' });
    const item = await repo.create({ ...validInput, photos: [file] });

    // 1a chamada: POST /api/items com JSON (nunca multipart)
    const [createUrl, createInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(createUrl).toBe('/api/items');
    expect((createInit.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
    expect(JSON.parse(createInit.body as string)).toMatchObject({
      title: 'Body listrado',
      clothing_size: 'M',
      price_cents: 4500,
    });

    // 2a chamada: registra a foto e recebe a presigned URL
    expect(fetchMock.mock.calls[1][0]).toBe('/api/items/42/photos');

    // 3a chamada: PUT direto na presigned URL (fora do proxy /api)
    const [putUrl, putInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(putUrl).toBe('https://bucket.example.com/put');
    expect(putInit.method).toBe('PUT');
    expect((putInit.headers as Record<string, string>)['Content-Type']).toBe('image/jpeg');

    expect(item.id).toBe('42');
    expect(item.photoUrls).toEqual(['https://cdn.example.com/f.jpg']);
  });

  it('parses findById without {item} wrapper and sorts photos by position', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          ...createdItem,
          photos: [
            { id: 1, url: 'https://cdn.example.com/b.jpg', position: 1 },
            { id: 2, url: 'https://cdn.example.com/a.jpg', position: 0 },
          ],
        }),
      ),
    );

    const repo = new HttpItemRepository();
    const item = await repo.findById('42');

    expect(item.photoUrls).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg',
    ]);
  });

  it('throws when photo upload PUT fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createdItem, 201))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            upload_url: 'https://bucket.example.com/put',
            photo: { id: 1, url: 'https://cdn.example.com/f.jpg', position: 0 },
          },
          201,
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);

    const repo = new HttpItemRepository();
    const file = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' });

    await expect(repo.create({ ...validInput, photos: [file] })).rejects.toThrow(
      'Photo upload failed: 403',
    );
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `yarn test:web`
Expected: FAIL — o create atual usa FormData e o findById procura `{item}`.

- [ ] **Step 4: Criar o mapper compartilhado**

Criar `apps/web/src/lib/infrastructure/http/apiItemMapper.ts`:

```ts
import type { Item } from '$lib/domain/item/entities/Item';

export type ApiPhotoDTO = {
  id: number | string;
  url: string;
  position: number | null;
};

export type ApiItemDTO = {
  id: number | string;
  seller_id: number | string;
  title: string;
  description: string | null;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  status: 'active' | 'sold' | 'removed';
  photos?: ApiPhotoDTO[];
  seller?: {
    id: number | string;
    name: string;
    avatar_url: string;
    verified: boolean;
  } | null;
};

export function mapApiItem(dto: ApiItemDTO): Item {
  return {
    id: String(dto.id),
    sellerId: String(dto.seller_id),
    title: dto.title,
    description: dto.description ?? '',
    category: dto.category,
    gender: dto.gender,
    clothingSize: dto.clothing_size,
    condition: dto.condition,
    priceCents: dto.price_cents,
    status: dto.status,
    photoUrls: sortedPhotoUrls(dto.photos),
  };
}

function sortedPhotoUrls(photos: ApiPhotoDTO[] | undefined): string[] {
  if (!photos) return [];
  return [...photos]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((photo) => photo.url);
}
```

- [ ] **Step 5: Reescrever HttpItemRepository**

Substituir TODO o conteúdo de `apps/web/src/lib/infrastructure/http/HttpItemRepository.ts` por:

```ts
import type {
  IItemRepository,
  CreateItemInput,
} from '$lib/domain/item/repositories/IItemRepository';
import type { Item } from '$lib/domain/item/entities/Item';
import { mapApiItem, type ApiItemDTO, type ApiPhotoDTO } from './apiItemMapper';

type PhotoUploadResponse = {
  upload_url: string;
  photo: ApiPhotoDTO;
};

export class HttpItemRepository implements IItemRepository {
  private readonly baseUrl = '/api';

  async create(data: CreateItemInput): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        category: data.category,
        gender: data.gender,
        clothing_size: data.clothingSize,
        condition: data.condition,
        price_cents: data.priceCents,
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `Create item failed: ${res.status}`);
    }

    const dto = (await res.json()) as ApiItemDTO;

    const photoUrls: string[] = [];
    for (const photo of data.photos) {
      photoUrls.push(await this.uploadPhoto(dto.id, photo));
    }

    return { ...mapApiItem(dto), photoUrls };
  }

  async findById(id: string): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items/${id}`);

    if (!res.ok) {
      throw new Error(`Item ${id} not found: ${res.status}`);
    }

    const dto = (await res.json()) as ApiItemDTO;
    return mapApiItem(dto);
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/items/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      throw new Error(`Delete item ${id} failed: ${res.status}`);
    }
  }

  private async uploadPhoto(itemId: number | string, file: File): Promise<string> {
    const res = await fetch(`${this.baseUrl}/items/${itemId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    if (!res.ok) {
      throw new Error(`Photo registration failed: ${res.status}`);
    }

    const { upload_url, photo } = (await res.json()) as PhotoUploadResponse;

    // PUT direto no bucket (presigned) — nao passa pelo proxy /api
    const put = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: file,
    });

    if (!put.ok) {
      throw new Error(`Photo upload failed: ${put.status}`);
    }

    return photo.url;
  }
}
```

- [ ] **Step 6: Rodar testes e type check**

Run: `yarn test:web` — Expected: PASS.
Run: `yarn check:web` — Expected: 0 errors. Se `ItemStatus` for referenciado em algum lugar que agora quebra, ajuste o consumidor para aceitar `'removed'`.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/domain/item/entities/Item.ts apps/web/src/lib/infrastructure/http/apiItemMapper.ts apps/web/src/lib/infrastructure/http/HttpItemRepository.ts apps/web/src/lib/infrastructure/http/HttpItemRepository.test.ts
git commit -m "fix(web): item repository uses JSON create + presigned photo upload"
```

---

### Task 4: Detalhe do item (`/catalog/[id]`) com dados reais

Hoje o `+page.server.ts` usa mocks incondicionalmente. Passar a buscar `GET /items/:id` (com fallback para mocks quando `PUBLIC_MOCK_DATA==='true'`) e corrigir o bug do `conditionVariant` (`'like_new'` nunca vira `'semi'` no código atual).

**Files:**
- Modify: `apps/web/src/routes/catalog/[id]/+page.server.ts` (reescrever inteiro)
- Modify: `apps/web/src/routes/catalog/[id]/+page.svelte` (2 edits pequenos)
- Test: `apps/web/src/routes/catalog/[id]/page.server.test.ts` (criar)

**Interfaces:**
- Consumes: `mapApiItem` e `ApiItemDTO` de `$lib/infrastructure/http/apiItemMapper` (Task 3); seller shape da API (Task 2).
- Produces: `load` retorna `{ item: Item, seller: { name: string; avatarUrl: string; verified: boolean } | null }`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/web/src/routes/catalog/[id]/page.server.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { load } from './+page.server';

const dto = {
  id: 7,
  seller_id: 2,
  title: 'Vestido tutu',
  description: null,
  category: 'dress',
  gender: 'female',
  clothing_size: 'G',
  condition: 'new',
  price_cents: 12900,
  status: 'active',
  photos: [{ id: 1, url: 'https://cdn.example.com/v.jpg', position: 0 }],
  seller: { id: 2, name: 'Maria', avatar_url: '', verified: true },
};

type LoadEvent = Parameters<typeof load>[0];

function makeEvent(fetchImpl: unknown, id = '7'): LoadEvent {
  return { params: { id }, fetch: fetchImpl } as unknown as LoadEvent;
}

describe('catalog/[id] +page.server load', () => {
  it('fetches the item from the API and maps item + seller', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(dto), { status: 200 }));

    const result = await load(makeEvent(fetchMock));

    expect(fetchMock).toHaveBeenCalledWith('/api/items/7');
    expect(result.item.title).toBe('Vestido tutu');
    expect(result.item.photoUrls).toEqual(['https://cdn.example.com/v.jpg']);
    expect(result.seller).toEqual({ name: 'Maria', avatarUrl: '', verified: true });
  });

  it('throws 404 when the API returns 404', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 404 }));

    await expect(load(makeEvent(fetchMock, '999'))).rejects.toMatchObject({ status: 404 });
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `yarn test:web`
Expected: FAIL — o load atual nem chama fetch.

- [ ] **Step 3: Reescrever o +page.server.ts**

Substituir TODO o conteúdo de `apps/web/src/routes/catalog/[id]/+page.server.ts` por:

```ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_MOCK_DATA } from '$lib/env';
import { mockItems, mockSellers } from '$lib/mocks/data';
import { mapApiItem, type ApiItemDTO } from '$lib/infrastructure/http/apiItemMapper';
import type { Item } from '$lib/domain/item/entities/Item';

export type SellerInfo = {
  name: string;
  avatarUrl: string;
  verified: boolean;
};

type ItemDetail = { item: Item; seller: SellerInfo | null };

export const load: PageServerLoad = async ({ params, fetch }): Promise<ItemDetail> => {
  if (PUBLIC_MOCK_DATA === 'true') {
    return loadFromMocks(params.id);
  }

  const res = await fetch(`/api/items/${params.id}`);
  if (res.status === 404) throw error(404, 'Item not found');
  if (!res.ok) throw error(502, 'Failed to load item');

  const dto = (await res.json()) as ApiItemDTO;
  return { item: mapApiItem(dto), seller: mapSeller(dto) };
};

function mapSeller(dto: ApiItemDTO): SellerInfo | null {
  if (!dto.seller) return null;
  return {
    name: dto.seller.name,
    avatarUrl: dto.seller.avatar_url,
    verified: dto.seller.verified,
  };
}

function loadFromMocks(id: string): ItemDetail {
  const item = mockItems.find((mock) => mock.id === id);
  if (!item) throw error(404, 'Item not found');

  const seller = mockSellers[item.sellerId];
  return {
    item,
    seller: seller
      ? { name: seller.name, avatarUrl: seller.avatarUrl, verified: seller.verified }
      : null,
  };
}
```

- [ ] **Step 4: Ajustar o +page.svelte**

Em `apps/web/src/routes/catalog/[id]/+page.svelte`:

Edit 1 — corrigir o mapeamento do variant (linha ~8). Trocar:

```ts
  const conditionVariant = $derived<'new' | 'semi' | 'used'>(data.item.condition as 'new' | 'semi' | 'used')
```

por:

```ts
  const conditionVariant = $derived<'new' | 'semi' | 'used'>(
    data.item.condition === 'like_new' ? 'semi' : data.item.condition === 'new' ? 'new' : 'used',
  )
```

Edit 2 — o novo seller não tem `listingsCount`. Remover esta linha do `<ProductTray ...>`:

```
      sellerListings={data.seller?.listingsCount ? $t('product.listings', { count: data.seller.listingsCount }) : undefined}
```

- [ ] **Step 5: Rodar testes e type check**

Run: `yarn test:web` — Expected: PASS.
Run: `yarn check:web` — Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add "apps/web/src/routes/catalog/[id]/+page.server.ts" "apps/web/src/routes/catalog/[id]/+page.svelte" "apps/web/src/routes/catalog/[id]/page.server.test.ts"
git commit -m "feat(web): item detail page loads real data from API"
```

---

### Task 5: Fluxo de venda persistindo de verdade

Hoje `/sell` faz `console.log` e navega. Além disso, o `ItemForm` usa **labels traduzidos como valores** (ex.: condition `"Novo"` em vez de `"new"`), o que quebraria a API. Corrigir o form para valores canônicos e ligar o submit ao caso de uso `CreateItem`.

**Files:**
- Create: `apps/web/src/lib/application/item/mapItemFormToCreateInput.ts`
- Test: `apps/web/src/lib/application/item/mapItemFormToCreateInput.test.ts` (criar)
- Modify: `apps/web/src/lib/presentation/components/ItemForm.svelte` (chips com value/label + prop `submitting`)
- Modify: `apps/web/src/routes/sell/+page.svelte` (reescrever inteiro)
- Modify: `apps/web/src/lib/i18n/en.json` e `apps/web/src/lib/i18n/pt.json` (novas chaves `sell.*`)

**Interfaces:**
- Consumes: `CreateItem` de `$lib/application/item/CreateItem` (`new CreateItem(repo).execute(input): Promise<Item>` — valida com Zod e lança `ZodError` se inválido); `HttpItemRepository` (Task 3).
- Produces:
  - `type ItemFormData = { title: string; category: string; size: string; condition: string; gender: string; photos: File[]; price: number; description: string }` (price em **reais**, ex.: `35.9`).
  - `mapItemFormToCreateInput(data: ItemFormData): CreateItemInput` (converte price para centavos).
  - `ItemForm` passa a emitir `onSubmit` com valores canônicos (`category: 'romper' | 'bodysuit' | 'dress' | 'coat' | 'set' | 'accessory'`, `condition: 'new' | 'like_new' | 'used'`, `gender: 'female' | 'male' | 'unisex'`) e aceita prop opcional `submitting?: boolean`.

- [ ] **Step 1: Escrever o teste do mapper (falha)**

Criar `apps/web/src/lib/application/item/mapItemFormToCreateInput.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mapItemFormToCreateInput } from './mapItemFormToCreateInput';

describe('mapItemFormToCreateInput', () => {
  it('converts price in reais to integer cents', () => {
    const input = mapItemFormToCreateInput({
      title: '  Body listrado  ',
      category: 'bodysuit',
      size: 'M',
      condition: 'new',
      gender: 'unisex',
      photos: [],
      price: 19.9,
      description: 'Novo, nunca usado ',
    });

    expect(input.priceCents).toBe(1990);
    expect(input.title).toBe('Body listrado');
    expect(input.description).toBe('Novo, nunca usado');
    expect(input.clothingSize).toBe('M');
    expect(input.gender).toBe('unisex');
    expect(input.condition).toBe('new');
  });

  it('rounds float precision safely', () => {
    const input = mapItemFormToCreateInput({
      title: 'x',
      category: 'dress',
      size: 'G',
      condition: 'used',
      gender: 'female',
      photos: [],
      price: 35.9,
      description: '',
    });

    expect(input.priceCents).toBe(3590);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `yarn test:web`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar o mapper**

Criar `apps/web/src/lib/application/item/mapItemFormToCreateInput.ts`:

```ts
import type { CreateItemInput } from '$lib/domain/item/repositories/IItemRepository';

export type ItemFormData = {
  title: string;
  category: string;
  size: string;
  condition: string;
  gender: string;
  photos: File[];
  price: number;
  description: string;
};

export function mapItemFormToCreateInput(data: ItemFormData): CreateItemInput {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    gender: data.gender as CreateItemInput['gender'],
    clothingSize: data.size,
    condition: data.condition as CreateItemInput['condition'],
    priceCents: Math.round(data.price * 100),
    photos: data.photos,
  };
}
```

Nota: os casts são seguros porque `CreateItem.execute` valida tudo com Zod logo em seguida — valores inválidos viram `ZodError`, não corrupção silenciosa.

Run: `yarn test:web` — Expected: PASS.

- [ ] **Step 4: ItemForm com valores canônicos**

Em `apps/web/src/lib/presentation/components/ItemForm.svelte`:

Edit 1 — trocar as três listas derivadas (linhas ~39-57). De:

```ts
  const categories = $derived([
    $t('item_form.category_romper'),
    $t('item_form.category_bodysuit'),
    $t('item_form.category_dress'),
    $t('item_form.category_coat'),
    $t('item_form.category_set'),
    $t('item_form.category_accessory'),
  ])
  const sizes = ['RN', 'P', 'M', 'G', 'GG', '1', '2']
  const conditions = $derived([
    $t('item_form.condition_new'),
    $t('item_form.condition_like_new'),
    $t('item_form.condition_used'),
  ])
  const genders = $derived([
    $t('item_form.gender_girl'),
    $t('item_form.gender_boy'),
    $t('item_form.gender_unisex'),
  ])
```

para:

```ts
  const categories = $derived([
    { value: 'romper', label: $t('item_form.category_romper') },
    { value: 'bodysuit', label: $t('item_form.category_bodysuit') },
    { value: 'dress', label: $t('item_form.category_dress') },
    { value: 'coat', label: $t('item_form.category_coat') },
    { value: 'set', label: $t('item_form.category_set') },
    { value: 'accessory', label: $t('item_form.category_accessory') },
  ])
  const sizes = ['RN', 'P', 'M', 'G', 'GG', '1', '2']
  const conditions = $derived([
    { value: 'new', label: $t('item_form.condition_new') },
    { value: 'like_new', label: $t('item_form.condition_like_new') },
    { value: 'used', label: $t('item_form.condition_used') },
  ])
  const genders = $derived([
    { value: 'female', label: $t('item_form.gender_girl') },
    { value: 'male', label: $t('item_form.gender_boy') },
    { value: 'unisex', label: $t('item_form.gender_unisex') },
  ])
```

Edit 2 — adicionar a prop `submitting`. Na desestruturação de `$props()` adicionar `submitting = false,` e no tipo inline adicionar `submitting?: boolean`.

Edit 3 — atualizar os três loops de chips no template para usar value/label:

Categoria (era `{#each categories as cat (cat)}` ... `category === cat` ... `{cat}`):

```svelte
          {#each categories as cat (cat.value)}
            <button
              type="button"
              class="itemform__chip"
              class:itemform__chip--on={category === cat.value}
              onclick={() => (category = category === cat.value ? '' : cat.value)}
            >
              {cat.label}
            </button>
          {/each}
```

Condição (mesma transformação, mantendo a classe `itemform__chip--pkon`):

```svelte
          {#each conditions as cond (cond.value)}
            <button
              type="button"
              class="itemform__chip"
              class:itemform__chip--pkon={condition === cond.value}
              onclick={() => (condition = condition === cond.value ? '' : cond.value)}
            >
              {cond.label}
            </button>
          {/each}
```

Gênero:

```svelte
          {#each genders as g (g.value)}
            <button
              type="button"
              class="itemform__chip"
              class:itemform__chip--on={gender === g.value}
              onclick={() => (gender = gender === g.value ? '' : g.value)}
            >
              {g.label}
            </button>
          {/each}
```

Edit 4 — desabilitar botões durante submit. Nos dois botões do footer (`itemform__btn--primary` e `itemform__btn--dark`) adicionar `disabled={submitting}`, e no botão publish trocar o texto para:

```svelte
          {submitting ? $t('sell.publishing') : $t('item_form.publish')}
```

- [ ] **Step 5: Adicionar chaves i18n**

Em `apps/web/src/lib/i18n/en.json`, adicionar uma seção `"sell"` no nível raiz (ao lado de `"item_form"`):

```json
  "sell": {
    "publishing": "Publishing...",
    "error_publish": "Could not publish your listing. Please try again."
  }
```

Em `apps/web/src/lib/i18n/pt.json`, mesma posição:

```json
  "sell": {
    "publishing": "Publicando...",
    "error_publish": "Nao foi possivel publicar o anuncio. Tente novamente."
  }
```

(Se os demais valores do pt.json usam acentos, use acentos aqui também: "Não foi possível publicar o anúncio. Tente novamente.")

- [ ] **Step 6: Reescrever a página /sell**

Substituir TODO o conteúdo de `apps/web/src/routes/sell/+page.svelte` por:

```svelte
<script lang="ts">
  import { goto } from '$app/navigation'
  import { t, get } from '$lib/i18n'
  import { ZodError } from 'zod'
  import ItemForm from '$lib/presentation/components/ItemForm.svelte'
  import { CreateItem } from '$lib/application/item/CreateItem'
  import { HttpItemRepository } from '$lib/infrastructure/http/HttpItemRepository'
  import {
    mapItemFormToCreateInput,
    type ItemFormData,
  } from '$lib/application/item/mapItemFormToCreateInput'
  import { PUBLIC_MOCK_DATA } from '$lib/env'

  const mockMode = PUBLIC_MOCK_DATA === 'true'
  const createItem = new CreateItem(new HttpItemRepository())

  let currentStep = $state<1 | 2>(1)
  let submitting = $state(false)
  let errorMessage = $state<string | null>(null)

  async function handleSubmit(data: ItemFormData) {
    if (currentStep === 1) {
      currentStep = 2
      return
    }

    errorMessage = null

    if (mockMode) {
      goto('/catalog')
      return
    }

    submitting = true
    try {
      const item = await createItem.execute(mapItemFormToCreateInput(data))
      goto(`/catalog/${item.id}`)
    } catch (e) {
      errorMessage = extractErrorMessage(e)
    } finally {
      submitting = false
    }
  }

  function extractErrorMessage(e: unknown): string {
    if (e instanceof ZodError) {
      return e.issues[0]?.message ?? get(t)('sell.error_publish')
    }
    return get(t)('sell.error_publish')
  }

  function handleBack() {
    if (currentStep === 2) {
      currentStep = 1
      return
    }
    goto('/catalog')
  }
</script>

<svelte:head>
  <title>{$t('item_form.new_listing')} | BabyClothes</title>
</svelte:head>

<div class="sell-page">
  {#if errorMessage}
    <p class="sell-page__error" role="alert">{errorMessage}</p>
  {/if}

  <ItemForm
    {currentStep}
    totalSteps={2}
    {submitting}
    onSubmit={handleSubmit}
    onBack={handleBack}
  />
</div>

<style>
  .sell-page {
    min-height: 100vh;
    background: var(--wh);
    padding-bottom: 5rem;
  }

  .sell-page__error {
    max-width: 44rem;
    margin: 0 0 0.8rem;
    padding: 0.6rem 0.9rem;
    border-radius: 0.8rem;
    background: rgba(239, 68, 68, 0.08);
    border: 0.1rem solid rgba(239, 68, 68, 0.3);
    color: var(--color-error);
    font-size: 0.8rem;
  }
</style>
```

Nota importante: o `ItemForm` é uma única instância que mantém estado interno entre os steps (o step só muda o que é renderizado dentro dele) — por isso não é preciso guardar os dados do step 1 na página; o `onSubmit` do step 2 entrega o formulário completo.

- [ ] **Step 7: Rodar testes, type check e lint**

Run: `yarn test:web` — Expected: PASS.
Run: `yarn check:web` — Expected: 0 errors.
Run: `yarn lint:web` e `yarn stylelint:web` — Expected: sem erros novos.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/application/item/mapItemFormToCreateInput.ts apps/web/src/lib/application/item/mapItemFormToCreateInput.test.ts apps/web/src/lib/presentation/components/ItemForm.svelte apps/web/src/routes/sell/+page.svelte apps/web/src/lib/i18n/en.json apps/web/src/lib/i18n/pt.json
git commit -m "feat(web): sell flow creates real listings via CreateItem"
```

---

### Task 6: Catálogo com filtros funcionais + grid de 2 colunas + pills sólidas

A página atual tem filtros decorativos (arrays hardcoded, "M · Sofia atual" fixo) e 5 carrosséis horizontais. O gap analysis (P0) pede: grid de 2 colunas, pills sólidas (inativa `#F3F4F6`/`#374151`, ativa `#111`/branco, radius `99rem`), pill de gênero (`#FFE8F5` bg / `#FF3CAC` texto). Os filtros passam a disparar refetch com query params reais.

**Files:**
- Modify: `apps/web/src/routes/catalog/+page.svelte` (reescrever inteiro)

**Interfaces:**
- Consumes: `HttpCatalogRepository.fetch(filter)` (Task 1); chaves i18n existentes `catalog.*`, `item_form.category_*`, `item_card.*`; componentes `Card`, `CategoryTabNav`, `EmptyState` do design system. `CategoryTabNav` recebe `categories: string[]` (labels), `active: string`, `onSelect: (label: string) => void`.
- Produces: página de catálogo definitiva. Nenhuma outra task depende dela.

- [ ] **Step 1: Reescrever a página**

Substituir TODO o conteúdo de `apps/web/src/routes/catalog/+page.svelte` por:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { t, get } from '$lib/i18n'
  import { HttpCatalogRepository } from '$lib/infrastructure/http/HttpCatalogRepository'
  import type { Item } from '$lib/domain/item/entities/Item'
  import type { Filter } from '$lib/domain/catalog/value-objects/Filter'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { mockItems } from '$lib/mocks/data'
  import { Card, CategoryTabNav, EmptyState } from '@babyclothes/design-system'
  import { RefreshCw, AlertCircle } from 'lucide-svelte'

  const catalogRepo = new HttpCatalogRepository()
  const mockMode = PUBLIC_MOCK_DATA === 'true'

  type Option = { value: string; label: string }

  const categoryOptions = $derived<Option[]>([
    { value: '', label: $t('catalog.all') },
    { value: 'romper', label: $t('item_form.category_romper') },
    { value: 'bodysuit', label: $t('item_form.category_bodysuit') },
    { value: 'dress', label: $t('item_form.category_dress') },
    { value: 'coat', label: $t('item_form.category_coat') },
    { value: 'set', label: $t('item_form.category_set') },
    { value: 'accessory', label: $t('item_form.category_accessory') },
  ])

  const sizeOptions = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3']

  const genderOptions = $derived<Option[]>([
    { value: 'female', label: $t('item_card.gender_girl') },
    { value: 'male', label: $t('item_card.gender_boy') },
    { value: 'unisex', label: $t('item_card.gender_unisex') },
  ])

  const conditionOptions = $derived<Option[]>([
    { value: 'new', label: $t('item_card.condition_new') },
    { value: 'like_new', label: $t('item_card.condition_like_new') },
    { value: 'used', label: $t('item_card.condition_used') },
  ])

  let selectedCategory = $state('')
  let selectedSize = $state('')
  let selectedGender = $state('')
  let selectedCondition = $state('')

  let items = $state<Item[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)

  const activeCategoryLabel = $derived(
    categoryOptions.find((option) => option.value === selectedCategory)?.label ??
      categoryOptions[0].label,
  )

  function currentFilter(): Filter {
    return {
      category: selectedCategory || undefined,
      size: selectedSize || undefined,
      gender: selectedGender || undefined,
      condition: selectedCondition || undefined,
    }
  }

  function applyFilterToMocks(): Item[] {
    return mockItems.filter(
      (item) =>
        (!selectedCategory || item.category === selectedCategory) &&
        (!selectedSize || item.clothingSize === selectedSize) &&
        (!selectedGender || item.gender === selectedGender) &&
        (!selectedCondition || item.condition === selectedCondition),
    )
  }

  async function fetchCatalog() {
    loading = true
    error = null
    try {
      items = mockMode ? applyFilterToMocks() : await catalogRepo.fetch(currentFilter())
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load catalog'
    } finally {
      loading = false
    }
  }

  onMount(fetchCatalog)

  function selectCategory(label: string) {
    const option = categoryOptions.find((candidate) => candidate.label === label)
    selectedCategory = option?.value ?? ''
    fetchCatalog()
  }

  function toggleSize(size: string) {
    selectedSize = selectedSize === size ? '' : size
    fetchCatalog()
  }

  function toggleGender(value: string) {
    selectedGender = selectedGender === value ? '' : value
    fetchCatalog()
  }

  function toggleCondition(value: string) {
    selectedCondition = selectedCondition === value ? '' : value
    fetchCatalog()
  }

  function conditionLabel(condition: string) {
    const translate = get(t)
    if (condition === 'new') return translate('item_card.condition_new')
    if (condition === 'like_new') return translate('item_card.condition_like_new')
    return translate('item_card.condition_used')
  }

  function genderLabel(gender: string) {
    const translate = get(t)
    if (gender === 'female') return translate('item_card.gender_girl')
    if (gender === 'male') return translate('item_card.gender_boy')
    return translate('item_card.gender_unisex')
  }

  function formatPrice(cents: number) {
    return `R$ ${(cents / 100).toFixed(0)}`
  }
</script>

<svelte:head>
  <title>{$t('catalog.title')} | BabyClothes</title>
</svelte:head>

<div class="catalog-page">
  <CategoryTabNav
    categories={categoryOptions.map((option) => option.label)}
    active={activeCategoryLabel}
    onSelect={selectCategory}
  />

  <div class="catalog-page__filters">
    {#each genderOptions as option (option.value)}
      <button
        class="catalog-page__pill catalog-page__pill--gender"
        class:catalog-page__pill--on={selectedGender === option.value}
        onclick={() => toggleGender(option.value)}
      >
        {option.label}
      </button>
    {/each}
    {#each conditionOptions as option (option.value)}
      <button
        class="catalog-page__pill"
        class:catalog-page__pill--on={selectedCondition === option.value}
        onclick={() => toggleCondition(option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>

  <div class="catalog-page__sizes">
    {#each sizeOptions as size (size)}
      <button
        class="catalog-page__pill"
        class:catalog-page__pill--on={selectedSize === size}
        onclick={() => toggleSize(size)}
      >
        {size}
      </button>
    {/each}
  </div>

  <div class="catalog-page__content">
    {#if loading}
      <div class="catalog-page__status">
        <p>{$t('catalog.loading') ?? 'Loading catalog...'}</p>
      </div>
    {:else if error}
      <div class="catalog-page__status catalog-page__status--error">
        <div class="catalog-page__status-icon">
          <AlertCircle size={32} />
        </div>
        <h2 class="catalog-page__status-title">{$t('catalog.error_title')}</h2>
        <p class="catalog-page__status-desc">{$t('catalog.error_description')}</p>
        <button class="catalog-page__status-btn" onclick={fetchCatalog}>
          <RefreshCw size={14} />
          {$t('catalog.error_retry')}
        </button>
      </div>
    {:else if items.length === 0}
      <EmptyState
        variant="centered"
        title={$t('catalog.empty_title')}
        description={$t('catalog.empty_description')}
        accent="pink"
        action={{ label: $t('catalog.error_retry'), variant: 'pk', onclick: fetchCatalog }}
      />
    {:else}
      <div class="catalog-page__grid">
        {#each items as item (item.id)}
          <div class="catalog-page__cell">
            <Card
              image={item.photoUrls[0] ?? ''}
              title={item.title}
              detail={`Tam. ${item.clothingSize} · ${genderLabel(item.gender)}`}
              price={formatPrice(item.priceCents)}
              condition={conditionLabel(item.condition)}
              pinkPrice={true}
              size="md"
              onClick={() => goto(`/catalog/${item.id}`)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .catalog-page {
    min-height: 100vh;
    background: var(--color-bg);
  }

  /* Pills sólidas (spec DS: sem glassmorphism) */
  .catalog-page__filters,
  .catalog-page__sizes {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
    padding: 0.6rem 0.7rem 0;
  }

  .catalog-page__sizes {
    padding-bottom: 0.2rem;
  }

  .catalog-page__pill {
    background: #F3F4F6;
    border: none;
    border-radius: 99rem;
    padding: 0.35rem 0.75rem;
    font-family: var(--ld);
    font-size: 0.8rem;
    font-weight: 700;
    color: #374151;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .catalog-page__pill--on {
    background: #111;
    color: #fff;
  }

  .catalog-page__pill--gender {
    background: #FFE8F5;
    color: #FF3CAC;
  }

  .catalog-page__pill--gender.catalog-page__pill--on {
    background: #FF3CAC;
    color: #fff;
  }

  .catalog-page__content {
    padding-bottom: 2rem;
  }

  /* Grid de 2 colunas (spec do mock) */
  .catalog-page__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.2rem 1.4rem;
  }

  @media (min-width: 76.8rem) {
    .catalog-page__grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .catalog-page__cell {
    min-width: 0;
    display: flex;
  }

  .catalog-page__status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 3rem 1.4rem;
    text-align: center;
  }

  .catalog-page__status-icon {
    color: var(--color-error);
  }

  .catalog-page__status-title {
    font-family: var(--ld);
    font-size: 1rem;
    margin: 0;
  }

  .catalog-page__status-desc {
    font-size: 0.8rem;
    color: var(--gr);
    margin: 0;
  }

  .catalog-page__status-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--bk);
    color: var(--wh);
    border: none;
    border-radius: 99rem;
    padding: 0.45rem 1rem;
    font-family: var(--ld);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 2: Type check, lint e testes**

Run: `yarn check:web` — Expected: 0 errors.
Run: `yarn lint:web` e `yarn stylelint:web` — Expected: sem erros novos.
Run: `yarn test:web` — Expected: PASS (nenhum teste referencia a página antiga).

- [ ] **Step 3: Verificação visual em mock mode**

Com `PUBLIC_MOCK_DATA=true` no `.env`, rodar `yarn dev` e abrir `http://localhost:5173/catalog`. Verificar:
- Grid de 2 colunas com os itens mock.
- Clicar em "Vestidos" (tab) filtra só os 2 vestidos mock.
- Clicar num tamanho (ex.: "M") filtra; clicar de novo desmarca.
- Pill de gênero rosa (`#FFE8F5`), pill ativa preta.
- Se o componente `Card` estourar a célula do grid, envolver com largura: adicionar `.catalog-page__cell > :global(*) { width: 100%; }` ao style.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/catalog/+page.svelte
git commit -m "feat(web): functional catalog filters with 2-column grid and solid pills"
```

---

## Fase 2 — Chat IA de ponta a ponta

### Task 7: Chat com sessão real + proxy da API encaminhando contexto da criança

Dois problemas: (a) a página de chat tem `childRepo.findAll('TODO')` — precisa do userId da sessão; (b) o `AgentController` da API só encaminha `message` para o serviço de agents, descartando `child_id` e `context` que o web envia.

**Files:**
- Modify: `apps/api/lib/api/controllers/agent_controller.ex`
- Test: `apps/api/test/api/controllers/agent_controller_test.exs` (adicionar describe)
- Modify: `apps/web/src/lib/domain/chat/repositories/IChatRepository.ts` (4º parâmetro opcional)
- Modify: `apps/web/src/lib/infrastructure/sse/SseChatRepository.ts` (enviar context)
- Modify: `apps/web/src/routes/chat/+page.svelte` (sessão real + empty state)
- Modify: `apps/web/src/lib/i18n/en.json` e `pt.json` (chaves `chat.no_children_*`)

**Interfaces:**
- Consumes: `$page.data.session` (shape `{ userId: string, ... }` — já populado por `hooks.server.ts` + `+layout.server.ts`); `HttpChildRepository.findAll(userId: string): Promise<Child[]>`.
- Produces:
  - `Api.Controllers.AgentController.agents_payload/1` (pública, testável): filtra o body para `["message", "child_id", "context"]` e retorna JSON string.
  - `IChatRepository.sendMessage(userId, childId, message, context?: ChatContext)` onde `ChatContext = { name?: string; birth_date?: string }`.

- [ ] **Step 1: Teste Elixir que falha**

Em `apps/api/test/api/controllers/agent_controller_test.exs`, adicionar no final do módulo (antes do `end` final):

```elixir
describe "agents_payload/1" do
  test "forwards only message, child_id and context" do
    payload =
      Api.Controllers.AgentController.agents_payload(%{
        "message" => "oi",
        "child_id" => "5",
        "context" => %{"name" => "Sofia"},
        "authorization" => "should-be-dropped"
      })

    assert Jason.decode!(payload) == %{
             "message" => "oi",
             "child_id" => "5",
             "context" => %{"name" => "Sofia"}
           }
  end

  test "omits keys that are absent" do
    payload = Api.Controllers.AgentController.agents_payload(%{"message" => "oi"})

    assert Jason.decode!(payload) == %{"message" => "oi"}
  end
end
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `yarn test:api`
Expected: FAIL — função `agents_payload/1` não existe.

- [ ] **Step 3: Implementar no AgentController**

Em `apps/api/lib/api/controllers/agent_controller.ex`:

Edit 1 — adicionar a função pública (logo após a função `chat/1`):

```elixir
  @doc """
  Builds the JSON payload forwarded to the agents service.

  Only whitelisted keys are forwarded: message, child_id, context.
  """
  @spec agents_payload(map()) :: String.t()
  def agents_payload(body_params) do
    body_params
    |> Map.take(["message", "child_id", "context"])
    |> Jason.encode!()
  end
```

Edit 2 — na função `chat/1`, trocar a chamada `stream_to_agents(conn, message, token)` por `stream_to_agents(conn, token)` (o `message` já foi validado pelo `extract_message`, só não é mais passado adiante). O `with` fica:

```elixir
    with {:ok, _message} <- extract_message(conn),
         {:ok, token} <- extract_bearer_token(conn) do
      stream_to_agents(conn, token)
```

Edit 3 — em `stream_to_agents`, trocar a assinatura e o body. De:

```elixir
  defp stream_to_agents(conn, message, token) do
    agents_endpoint = "#{agents_url()}/chat"

    body = Jason.encode!(%{message: message})
```

para:

```elixir
  defp stream_to_agents(conn, token) do
    agents_endpoint = "#{agents_url()}/chat"

    body = agents_payload(conn.body_params)
```

- [ ] **Step 4: Rodar testes da API**

Run: `yarn test:api` — Expected: PASS (novos + existentes do agent_controller).
Run: `yarn api:credo` — Expected: sem warnings novos.

- [ ] **Step 5: Interface e repositório SSE no web**

Em `apps/web/src/lib/domain/chat/repositories/IChatRepository.ts`, adicionar o tipo e o 4º parâmetro opcional. O arquivo deve exportar (mantendo o que já existe):

```ts
export type ChatContext = {
  name?: string;
  birth_date?: string;
};
```

e a assinatura de `sendMessage` na interface vira:

```ts
  sendMessage(
    userId: string,
    childId: string,
    message: string,
    context?: ChatContext,
  ): AsyncIterable<AgentResponse>;
```

Em `apps/web/src/lib/infrastructure/sse/SseChatRepository.ts`:

Edit 1 — importar o tipo: adicionar `ChatContext` ao import de `IChatRepository`:

```ts
import type { IChatRepository, ChatContext } from '$lib/domain/chat/repositories/IChatRepository';
```

Edit 2 — assinatura e body do `sendMessage`. De:

```ts
  async *sendMessage(
    userId: string,
    childId: string,
    message: string,
  ): AsyncIterable<AgentResponse> {
```

para:

```ts
  async *sendMessage(
    userId: string,
    childId: string,
    message: string,
    context?: ChatContext,
  ): AsyncIterable<AgentResponse> {
```

e o body do fetch de:

```ts
      body: JSON.stringify({ user_id: userId, child_id: childId, message }),
```

para:

```ts
      body: JSON.stringify({ user_id: userId, child_id: childId, message, context }),
```

- [ ] **Step 6: Página de chat com sessão real**

Em `apps/web/src/routes/chat/+page.svelte`:

Edit 1 — adicionar imports no topo do script:

```ts
  import { page } from '$app/stores'
```

e adicionar `EmptyState` ao import do design system:

```ts
  import { Card, ChatInput, ChatBubble, ChatHeader, GrowthChart, EmptyState } from '@babyclothes/design-system'
```

Edit 2 — logo após `const mockMode = ...`, adicionar:

```ts
  const session = $derived($page.data.session)
```

Edit 3 — no `onMount`, substituir o branch real (o bloco `else` com os comentários TODO):

```ts
      } else {
        // TODO: Get userId from page data session and pass to findAll(userId)
        // For now, this will fail without auth — needs a +page.server.ts to provide session
        const [loadedChildren, loadedItems] = await Promise.all([
          childRepo.findAll('TODO'),
          catalogRepo.fetch({}),
        ])
        children = loadedChildren
        items = loadedItems
      }
```

por:

```ts
      } else {
        const userId = session?.userId
        if (!userId) throw new Error('Not authenticated')
        const [loadedChildren, loadedItems] = await Promise.all([
          childRepo.findAll(userId),
          catalogRepo.fetch({}),
        ])
        children = loadedChildren
        items = loadedItems
      }
```

Edit 4 — em `handleSend`, substituir:

```ts
    // Get userId from session (populated by hooks.server.ts)
    const userId = mockMode ? 'mock-user-1' : undefined
    // TODO: Get userId from page data session when available
    if (!userId || !activeChild) return
```

por:

```ts
    const userId = mockMode ? 'mock-user-1' : session?.userId
    if (!userId || !activeChild) return
```

Edit 5 — na chamada do stream, trocar:

```ts
      for await (const chunk of chatRepo.sendMessage(userId, activeChild.id, msg)) {
```

por:

```ts
      const context = {
        name: activeChild.name,
        birth_date: activeChild.birthDate.toISOString().slice(0, 10),
      }
      for await (const chunk of chatRepo.sendMessage(userId, activeChild.id, msg, context)) {
```

Edit 6 — empty state quando o usuário real não tem crianças cadastradas (o agente precisa de uma criança para contexto). No template, logo APÓS o fechamento do `<div class="chat-page__messages">...</div>`... na verdade DENTRO dele, antes do `{#each messages ...}`, adicionar:

```svelte
    {#if !loading && !mockMode && children.length === 0}
      <EmptyState
        variant="centered"
        title={$t('chat.no_children_title')}
        description={$t('chat.no_children_description')}
        accent="pink"
        action={{ label: $t('chat.no_children_action'), variant: 'pk', onclick: () => goto('/child/register') }}
      />
    {/if}
```

- [ ] **Step 7: Chaves i18n**

Em `apps/web/src/lib/i18n/en.json`, dentro da seção `"chat"` existente, adicionar:

```json
    "no_children_title": "Register a child to chat",
    "no_children_description": "The assistant uses your child's profile to recommend sizes and clothes.",
    "no_children_action": "Register child"
```

Em `pt.json`, mesma seção:

```json
    "no_children_title": "Cadastre uma crianca para conversar",
    "no_children_description": "O assistente usa o perfil da crianca para recomendar tamanhos e roupas.",
    "no_children_action": "Cadastrar crianca"
```

(Use acentos se o restante do arquivo usa: "criança".)

- [ ] **Step 8: Rodar tudo**

Run: `yarn test:web` — Expected: PASS.
Run: `yarn check:web` — Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add apps/api/lib/api/controllers/agent_controller.ex apps/api/test/api/controllers/agent_controller_test.exs apps/web/src/lib/domain/chat/repositories/IChatRepository.ts apps/web/src/lib/infrastructure/sse/SseChatRepository.ts apps/web/src/routes/chat/+page.svelte apps/web/src/lib/i18n/en.json apps/web/src/lib/i18n/pt.json
git commit -m "feat(chat): real session userId and child context forwarded to agents"
```

---

### Task 8: Agents — atualizar modelos Claude e alinhar categorias

Os três nós usam `claude-sonnet-4-20250514` (desatualizado). E o prompt do `fetch-items` lista categorias que **não existem** no banco (`body, macacao, vestido...`) — as reais são `romper, bodysuit, dress, coat, set, accessory`.

**Files:**
- Modify: `apps/agents/src/nodes/interpret-intent.ts` (linha ~28)
- Modify: `apps/agents/src/nodes/fetch-items.ts` (linhas ~18 e ~28)
- Modify: `apps/agents/src/nodes/format-response.ts` (linha ~26)

**Interfaces:**
- Produces: nenhuma mudança de assinatura — só valores de configuração.

- [ ] **Step 1: interpret-intent (classificação barata → Haiku)**

Em `apps/agents/src/nodes/interpret-intent.ts`, trocar:

```ts
  modelName: 'claude-sonnet-4-20250514',
```

por:

```ts
  modelName: 'claude-haiku-4-5-20251001',
```

- [ ] **Step 2: fetch-items (extração de parâmetros → Haiku; categorias corretas)**

Em `apps/agents/src/nodes/fetch-items.ts`:

Trocar a linha do modelo:

```ts
  modelName: 'claude-sonnet-4-20250514',
```

por:

```ts
  modelName: 'claude-haiku-4-5-20251001',
```

E no `EXTRACT_PARAMS_PROMPT`, trocar a linha:

```
Available categories: body, macacao, vestido, calca, blusa, saia, short, pijama, agasalho, acessorio
```

por:

```
Available categories: romper, bodysuit, dress, coat, set, accessory
```

- [ ] **Step 3: format-response (geração da resposta → Sonnet 5)**

Em `apps/agents/src/nodes/format-response.ts`, trocar:

```ts
  modelName: 'claude-sonnet-4-20250514',
```

por:

```ts
  modelName: 'claude-sonnet-5',
```

- [ ] **Step 4: Rodar testes**

Run: `yarn test:agents`
Expected: PASS (os testes existentes usam mocks — nenhuma chamada real de API deve ocorrer).

Confirmar que não sobrou nenhuma referência antiga: `grep -rn "claude-sonnet-4" apps/agents/src` deve retornar vazio.

- [ ] **Step 5: Commit**

```bash
git add apps/agents/src/nodes/interpret-intent.ts apps/agents/src/nodes/fetch-items.ts apps/agents/src/nodes/format-response.ts
git commit -m "feat(agents): upgrade Claude models and align catalog categories"
```

---

## Fase 3 — Polish visual P0

### Task 9: Fundo `#F8F5F2` nas páginas (gap P0 #1)

O body já usa `var(--of)` (= `#F8F5F2` via `--color-bg`), mas 3 páginas sobrescrevem o root com `var(--of2)` (`#ECEAE6`). Trocar SOMENTE o seletor raiz de cada página — os `--of2` internos (hover, ícones) ficam.

**Files:**
- Modify: `apps/web/src/routes/catalog/[id]/+page.svelte` (linha ~74)
- Modify: `apps/web/src/routes/profile/+page.svelte` (linha ~113)
- Modify: `apps/web/src/routes/child/[id]/+page.svelte` (linha ~150)

**Interfaces:** nenhuma — só CSS.

- [ ] **Step 1: Confirmar que o token existe**

Run: `grep -n '\-\-of:' packages/design-system/src/tokens/tokens.css && grep -n 'color-bg:' packages/design-system/src/tokens/tokens.css`
Expected: `--color-bg: #F8F5F2;` e um alias `--of`. Use `var(--color-bg)` nas trocas abaixo.

- [ ] **Step 2: Trocar os 3 fundos de página**

Em cada arquivo, localizar o seletor RAIZ da página e trocar `background: var(--of2);` por `background: var(--color-bg);`:

1. `apps/web/src/routes/catalog/[id]/+page.svelte` — seletor `.item-detail-page` (linha ~72-75).
2. `apps/web/src/routes/profile/+page.svelte` — seletor `.profile-page` (linha ~111-114). NÃO tocar nos `var(--of2)` das linhas ~195 e ~202 (são hover/ícone).
3. `apps/web/src/routes/child/[id]/+page.svelte` — seletor `.child-detail-page` (linha ~148-151). NÃO tocar na linha ~177.

- [ ] **Step 3: Verificar**

Run: `yarn stylelint:web` — Expected: sem erros.
Run: `grep -rn "background: var(--of2)" apps/web/src/routes` — Expected: só ocorrências em elementos internos (hover/ícones), nenhuma em seletor raiz de página (`.item-detail-page`, `.profile-page`, `.child-detail-page` não aparecem).

- [ ] **Step 4: Commit**

```bash
git add "apps/web/src/routes/catalog/[id]/+page.svelte" apps/web/src/routes/profile/+page.svelte "apps/web/src/routes/child/[id]/+page.svelte"
git commit -m "fix(web): page backgrounds use DS content background (#F8F5F2)"
```

---

### Task 10: Chat — header sólido e avatar com ícone (gap P0 #6 e #7)

O `ChatHeader` usa glassmorphism onde o DS especifica branco sólido; o avatar do agente na página de chat é um quadradinho abstrato onde o mock usa ícone de gota.

**Files:**
- Modify: `packages/design-system/src/patterns/ChatHeader/ChatHeader.svelte` (linhas ~65-68)
- Modify: `apps/web/src/routes/chat/+page.svelte` (avatar do agente — 3 ocorrências no template + CSS)

**Interfaces:** nenhuma mudança de props.

- [ ] **Step 1: ChatHeader sólido**

Em `packages/design-system/src/patterns/ChatHeader/ChatHeader.svelte`, localizar o bloco (linhas ~65-68):

```css
    background: rgba(255, 255, 255, 0.38);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-bottom: 0.1rem solid var(--glass-brd);
```

e trocar por:

```css
    background: var(--wh);
    border-bottom: 0.1rem solid rgba(10, 10, 10, 0.06);
```

(remover as duas linhas de `backdrop-filter`).

- [ ] **Step 2: Avatar do agente com ícone de gota**

Em `apps/web/src/routes/chat/+page.svelte`:

Edit 1 — adicionar `Droplets` ao import do lucide (se não houver import do lucide, criar):

```ts
  import { Droplets } from 'lucide-svelte'
```

Edit 2 — substituir TODAS as ocorrências (são 4: carousel, itemList, growthAlert e bolha normal do agente + typing indicator) de:

```svelte
          <div class="chat-page__av">
            <div class="chat-page__av-dot"></div>
          </div>
```

por:

```svelte
          <div class="chat-page__av">
            <Droplets size={13} color="var(--pk)" />
          </div>
```

(Atenção à indentação de cada ocorrência — use replace-all do bloco exato.)

Edit 3 — remover a regra CSS `.chat-page__av-dot` inteira (não é mais usada):

```css
  .chat-page__av-dot {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 0.2rem;
    background: var(--pk);
  }
```

- [ ] **Step 3: Rodar checks**

Run: `yarn test:ui` — Expected: PASS (ChatHeader não tem testes de estilo; nada deve quebrar).
Run: `yarn check:web` e `yarn stylelint:web` e `yarn stylelint:ui` — Expected: sem erros. Se o stylelint reclamar de regra vazia/seletor não usado, confirme que a regra `.chat-page__av-dot` foi removida por completo.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/patterns/ChatHeader/ChatHeader.svelte apps/web/src/routes/chat/+page.svelte
git commit -m "fix(ds): solid chat header and droplet agent avatar per DS spec"
```

---

### Task 11: Footer + rotas /terms e /privacy (gap P0 #8 e P1 #23)

Não existe componente Footer no design system novo, e as rotas de termos/privacidade não existem (o footer e a tela de login apontam para elas). Criar o Footer como pattern do DS, renderizar no layout, criar as duas rotas estáticas e torná-las públicas no guard de auth.

**Files:**
- Create: `packages/design-system/src/patterns/Footer/Footer.svelte`
- Create: `packages/design-system/src/patterns/Footer/index.ts`
- Create: `packages/design-system/src/patterns/Footer/Footer.stories.ts`
- Create: `packages/design-system/src/patterns/Footer/Footer.test.ts`
- Modify: `packages/design-system/src/patterns/index.ts` (export)
- Modify: `apps/web/src/routes/+layout.svelte` (renderizar Footer)
- Create: `apps/web/src/routes/terms/+page.svelte`
- Create: `apps/web/src/routes/privacy/+page.svelte`
- Modify: `apps/web/src/hooks.server.ts` (publicRoutes)
- Modify: `apps/web/src/lib/i18n/en.json` e `pt.json` (seções `footer`, `terms`, `privacy`)

**Interfaces:**
- Produces: `Footer` exportado de `@babyclothes/design-system` com props `{ links: { href: string; label: string }[]; copyright: string }`.

- [ ] **Step 1: Teste do Footer (falha)**

Criar `packages/design-system/src/patterns/Footer/Footer.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Footer from './Footer.svelte'

const props = {
  links: [
    { href: '/terms', label: 'Termos de uso' },
    { href: '/privacy', label: 'Privacidade' },
  ],
  copyright: '© 2026 BabyClothes',
}

describe('Footer', () => {
  it('renders a link for each entry', () => {
    render(Footer, { props })
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(2)
    expect(links[0]).toHaveAttribute('href', '/terms')
  })

  it('renders the copyright text', () => {
    render(Footer, { props })
    expect(screen.getByText('© 2026 BabyClothes')).toBeInTheDocument()
  })
})
```

Run: `yarn test:ui` — Expected: FAIL (componente não existe).

- [ ] **Step 2: Criar o componente**

Criar `packages/design-system/src/patterns/Footer/Footer.svelte`:

```svelte
<script lang="ts">
  let {
    links,
    copyright,
  }: {
    links: { href: string; label: string }[]
    copyright: string
  } = $props()
</script>

<footer class="footer">
  <nav class="footer__links">
    {#each links as link (link.href)}
      <a class="footer__link" href={link.href}>{link.label}</a>
    {/each}
  </nav>
  <p class="footer__copyright">{copyright}</p>
</footer>

<style>
  .footer {
    background: var(--wh);
    border-top: 0.075rem solid rgba(10, 10, 10, 0.08);
    padding: 1.2rem 1.4rem 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: center;
  }

  .footer__links {
    display: flex;
    gap: 1.2rem;
  }

  .footer__link {
    font-family: var(--ld);
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--gr);
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer__link:hover {
    color: var(--pk);
  }

  .footer__copyright {
    margin: 0;
    font-size: 0.62rem;
    color: var(--color-gray-2);
  }
</style>
```

Criar `packages/design-system/src/patterns/Footer/index.ts` (siga o padrão dos outros patterns — abra `packages/design-system/src/patterns/TopBar/index.ts` e copie o formato; tipicamente):

```ts
export { default as Footer } from './Footer.svelte'
```

Adicionar em `packages/design-system/src/patterns/index.ts` (ordem alfabética, depois de `EmptyState`):

```ts
export { Footer } from './Footer/index.js'
```

Criar `packages/design-system/src/patterns/Footer/Footer.stories.ts` — abra `packages/design-system/src/patterns/PageHeader/PageHeader.stories.ts` e copie a ESTRUTURA exata (imports/meta/export), adaptando:

```ts
// Siga o formato do PageHeader.stories.ts. Conteúdo equivalente a:
import type { Meta, StoryObj } from '@storybook/svelte'
import Footer from './Footer.svelte'

const meta: Meta<typeof Footer> = {
  title: 'Patterns/Footer',
  component: Footer,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    links: [
      { href: '/terms', label: 'Termos de uso' },
      { href: '/privacy', label: 'Privacidade' },
    ],
    copyright: '© 2026 BabyClothes',
  },
}
```

Run: `yarn test:ui` — Expected: PASS.

- [ ] **Step 3: Chaves i18n**

Em `apps/web/src/lib/i18n/en.json`, adicionar no nível raiz:

```json
  "footer": {
    "terms": "Terms of use",
    "privacy": "Privacy policy",
    "copyright": "© 2026 BabyClothes"
  },
  "terms": {
    "title": "Terms of use",
    "body": "BabyClothes is a marketplace for buying and selling baby clothes between families. By using the platform you agree to list only items you own, describe them accurately, and treat other members with respect. Transactions are agreed directly between buyer and seller. This is a pre-release version: features and terms may change."
  },
  "privacy": {
    "title": "Privacy policy",
    "body": "We store only the data needed to run your account: your Google profile (name, email, avatar), the children profiles and measurements you register, and your listings. We never sell your data. Chat messages with the AI assistant are processed to generate recommendations. You can request deletion of your account and data at any time."
  }
```

Em `pt.json` (com acentuação consistente com o restante do arquivo):

```json
  "footer": {
    "terms": "Termos de uso",
    "privacy": "Política de privacidade",
    "copyright": "© 2026 BabyClothes"
  },
  "terms": {
    "title": "Termos de uso",
    "body": "O BabyClothes é um marketplace de compra e venda de roupas de bebê entre famílias. Ao usar a plataforma você concorda em anunciar apenas itens seus, descrevê-los com precisão e tratar os demais membros com respeito. As transações são combinadas diretamente entre comprador e vendedor. Esta é uma versão de pré-lançamento: recursos e termos podem mudar."
  },
  "privacy": {
    "title": "Política de privacidade",
    "body": "Armazenamos apenas os dados necessários para a sua conta: seu perfil Google (nome, e-mail, avatar), os perfis e medidas das crianças que você cadastra e seus anúncios. Nunca vendemos seus dados. As mensagens de chat com o assistente de IA são processadas para gerar recomendações. Você pode solicitar a exclusão da sua conta e dados a qualquer momento."
  }
```

- [ ] **Step 4: Rotas /terms e /privacy**

Criar `apps/web/src/routes/terms/+page.svelte`:

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
</script>

<svelte:head>
  <title>{$t('terms.title')} | BabyClothes</title>
</svelte:head>

<div class="legal-page">
  <h1 class="legal-page__title">{$t('terms.title')}</h1>
  <p class="legal-page__body">{$t('terms.body')}</p>
</div>

<style>
  .legal-page {
    max-width: 72rem;
    margin: 0 auto;
    padding: 2.4rem 1.6rem 4rem;
  }

  .legal-page__title {
    font-family: var(--ld);
    font-size: 1.6rem;
    font-weight: 900;
    margin: 0 0 1.2rem;
    color: var(--bk);
  }

  .legal-page__body {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--bk);
    white-space: pre-line;
    margin: 0;
  }
</style>
```

Criar `apps/web/src/routes/privacy/+page.svelte` — mesmo arquivo, trocando as duas chaves `terms.title`/`terms.body` por `privacy.title`/`privacy.body`.

- [ ] **Step 5: Tornar as rotas públicas**

Em `apps/web/src/hooks.server.ts`, trocar:

```ts
const publicRoutes = ['/login'];
```

por:

```ts
const publicRoutes = ['/login', '/terms', '/privacy'];
```

- [ ] **Step 6: Renderizar o Footer no layout**

Em `apps/web/src/routes/+layout.svelte`:

Edit 1 — adicionar `Footer` ao import do design system:

```ts
  import { TopBar, BottomNav, Footer } from '@babyclothes/design-system'
```

Edit 2 — adicionar o derived dos links (junto aos outros derived no script):

```ts
  const footerLinks = $derived([
    { href: '/terms', label: $t('footer.terms') },
    { href: '/privacy', label: $t('footer.privacy') },
  ])
```

Edit 3 — no template, entre `</main>` e `<BottomNav`, adicionar (o chat é full-height, então não recebe footer):

```svelte
    {#if !isChatRoute}
      <Footer links={footerLinks} copyright={$t('footer.copyright')} />
    {/if}
```

- [ ] **Step 7: Rodar tudo**

Run: `yarn test:ui` e `yarn test:web` — Expected: PASS. (Se `hooks.server.test.ts` tiver assertions sobre redirect de rotas, verifique que continuam passando — as novas rotas públicas não afetam os casos existentes de `/login`.)
Run: `yarn check` — Expected: 0 errors.
Run: `yarn stylelint` — Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add packages/design-system/src/patterns/Footer packages/design-system/src/patterns/index.ts apps/web/src/routes/+layout.svelte apps/web/src/routes/terms apps/web/src/routes/privacy apps/web/src/hooks.server.ts apps/web/src/lib/i18n/en.json apps/web/src/lib/i18n/pt.json
git commit -m "feat(web): footer with terms and privacy routes"
```

---

## Fase 4 — Validação de ponta a ponta

### Task 12: Smoke test manual do fluxo completo

Sem código novo — validar a v1 rodando. **Pré-requisito (humano):** `.env` na raiz preenchido a partir do `.env.example` com valores reais de `GOOGLE_CLIENT_ID` (guia em `docs/setup/google-oauth.md`), `JWT_SECRET`, `INTERNAL_API_KEY`, `S3_*` (Cloudflare R2) e `ANTHROPIC_API_KEY`. Se algum segredo não estiver disponível, execute os passos que não dependem dele e reporte os bloqueados.

- [ ] **Step 1: Subir o ambiente**

```bash
yarn dev          # sobe postgres + api + agents + web
yarn api:migrate  # migrations
yarn api:seed     # popula usuários/itens/crianças de exemplo
```

- [ ] **Step 2: Health checks**

```bash
curl -s http://localhost:4000/health          # esperado: {"status":"ok"}
curl -s http://localhost:50052/health         # esperado: {"status":"ok"}
curl -s "http://localhost:4000/catalog?category=dress" | head -c 400
# esperado: {"items":[...só vestidos...],"pagination":{...}}
curl -s http://localhost:4000/items/1 | head -c 400
# esperado: item com "photos" e "seller":{"name":...}
```

- [ ] **Step 3: Fluxo no browser (PUBLIC_MOCK_DATA=false no .env)**

Abrir `http://localhost:5173` e validar, na ordem:
1. Redireciona para `/login`; login com Google real funciona; registro PF/PJ com CPF/CNPJ.
2. `/catalog` mostra os itens do seed em grid de 2 colunas; tabs e pills filtram (a URL da API recebe os query params — conferir em `yarn logs:api`).
3. Clicar em um item abre `/catalog/[id]` com fotos, preço e vendedor reais.
4. `/sell`: preencher os 2 steps com foto; publicar; deve navegar para o detalhe do item criado; conferir a foto no bucket R2.
5. `/child/register`: cadastrar criança + medidas; `/child` lista.
6. `/chat`: enviar "procuro vestido tamanho G" — resposta deve chegar em streaming (SSE) e refletir itens reais do catálogo.
7. `/notifications` carrega (vazia ou com seeds).
8. Footer aparece com links funcionais para `/terms` e `/privacy` (acessíveis sem login).

- [ ] **Step 4: Gates de qualidade completos**

```bash
yarn test        # web + ui + agents + api
yarn check       # type check web + ui
yarn lint
yarn stylelint
yarn api:credo
```

Expected: tudo verde. Reportar qualquer falha com o output completo em vez de marcar como concluído.

- [ ] **Step 5: Relatório final**

Escrever um resumo em `.superpowers/v1-smoke-report.md` com: o que passou, o que falhou, e o que ficou bloqueado por falta de credenciais. Não commitar `.env`.

---

## Self-Review (executado na escrita do plano)

- **Cobertura:** bloqueadores P0 do relatório → Task 1 (catálogo real), 2+3+4 (detalhe + upload presigned), 5 (venda), 6 (filtros), 7+8 (chat IA), 9-11 (visual P0 + footer/terms/privacy), 12 (env/validação). Notificações e `/child` já usam sessão real (verificado no código) — sem task.
- **Tipos consistentes:** `ApiItemDTO`/`mapApiItem` definidos na Task 3 e consumidos na Task 4; `ItemFormData` definida na Task 5 e usada no sell; `ChatContext` definida na Task 7 e usada no SSE repo; `agents_payload/1` definida e testada na Task 7.
- **Ordem:** Task 2 (API seller) antes da Task 4 (web consome seller). Task 3 (mapper) antes da Task 4. Task 1 antes da Task 6 (grid consome fetch corrigido). Tasks 9-11 independentes.
