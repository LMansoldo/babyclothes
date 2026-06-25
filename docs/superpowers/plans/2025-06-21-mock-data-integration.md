# Mock Data Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect 7 SvelteKit pages to existing mock data in `src/lib/mocks/data.ts`, toggled via `PUBLIC_MOCK_DATA=true` env var.

**Architecture:** Each page checks `$env/dynamic/public.PUBLIC_MOCK_DATA === 'true'` at the top of its script block. When true, data is read directly from mock arrays instead of calling HTTP repositories. No new classes, no DI, no factory — just inline `if (mock)` branches.

**Tech Stack:** SvelteKit 2, Svelte 5 runes, TypeScript

## Global Constraints

- Use `$env/dynamic/public.PUBLIC_MOCK_DATA` — NOT `import.meta.env`
- Do NOT modify `mocks/data.ts`, domain entities, interfaces, or HTTP repository classes
- Convert `MockChild.birthDate` (string) → `Date` via `{ ...c, birthDate: new Date(c.birthDate) }`
- BEM CSS naming, lucide-svelte icons, no emojis
- All user-facing strings via `$t('key')` i18n

---

### Task 1: child/+page.svelte — mock data for children list

**Files:**
- Modify: `apps/web/src/routes/child/+page.svelte`

**Interfaces:**
- Consumes: `mockChildren` (MockChild[]), `mockGrowthRecords` (GrowthRecord[]) from `$lib/mocks/data`
- Produces: N/A — this task is self-contained

- [ ] **Step 1: Read the current file**

Run: `cat apps/web/src/routes/child/+page.svelte`
Expected: 154 lines, imports HttpChildRepository, uses childRepo.findAll() and childRepo.getMeasurements()

- [ ] **Step 2: Add mock imports and env var check**

Add after the existing imports:
```ts
import { PUBLIC_MOCK_DATA } from '$env/dynamic/public'
import { mockChildren as mockChildrenRaw, mockGrowthRecords } from '$lib/mocks/data'
import type { MockChild } from '$lib/mocks/data'

const mockMode = PUBLIC_MOCK_DATA === 'true'
```

- [ ] **Step 3: Wrap onMount with mock branch**

Replace the `onMount` block:

Old code (lines 50-62):
```ts
onMount(async () => {
  try {
    const loadedChildren = await childRepo.findAll()
    children = loadedChildren
    if (loadedChildren.length > 0) {
      activeChildId = loadedChildren[0].id
    }
  } catch (e) {
    console.error('Failed to load children:', e)
  } finally {
    loading = false
  }
})
```

New code:
```ts
onMount(async () => {
  try {
    if (mockMode) {
      const loaded = mockChildrenRaw.map((c: MockChild) => ({
        ...c,
        birthDate: new Date(c.birthDate),
      }))
      children = loaded
      if (loaded.length > 0) {
        activeChildId = loaded[0].id
      }
    } else {
      const loadedChildren = await childRepo.findAll()
      children = loadedChildren
      if (loadedChildren.length > 0) {
        activeChildId = loadedChildren[0].id
      }
    }
  } catch (e) {
    console.error('Failed to load children:', e)
  } finally {
    loading = false
  }
})
```

- [ ] **Step 4: Wrap loadMeasurements with mock branch**

Replace the `loadMeasurements` function:

Old code (lines 64-72):
```ts
async function loadMeasurements(childId: string) {
  if (measurements[childId]) return
  try {
    const records = await childRepo.getMeasurements(childId)
    measurements = { ...measurements, [childId]: records }
  } catch (e) {
    console.error('Failed to load measurements:', e)
  }
}
```

New code:
```ts
async function loadMeasurements(childId: string) {
  if (measurements[childId]) return
  try {
    if (mockMode) {
      measurements = { ...measurements, [childId]: mockGrowthRecords.filter((r) => r.childId === childId) }
    } else {
      const records = await childRepo.getMeasurements(childId)
      measurements = { ...measurements, [childId]: records }
    }
  } catch (e) {
    console.error('Failed to load measurements:', e)
  }
}
```

- [ ] **Step 5: Verify the file**

Run: `npx svelte-check --tsconfig ./tsconfig.json` (from apps/web)
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/child/+page.svelte
git commit -m "feat(web): add mock data toggle to child list page"
```

---

### Task 2: child/[id]/+page.svelte — mock data for child detail

**Files:**
- Modify: `apps/web/src/routes/child/[id]/+page.svelte`

**Interfaces:**
- Consumes: `mockChildren`, `mockGrowthRecords`, `MockChild` from `$lib/mocks/data`
- Produces: N/A

- [ ] **Step 1: Read the current file**

Run: `cat apps/web/src/routes/child/\[id\]/+page.svelte`
Expected: 254 lines, imports HttpChildRepository, uses childRepo.findById() and childRepo.getMeasurements()

- [ ] **Step 2: Add mock imports and env var check**

Add after existing imports:
```ts
import { PUBLIC_MOCK_DATA } from '$env/dynamic/public'
import { mockChildren, mockGrowthRecords } from '$lib/mocks/data'

const mockMode = PUBLIC_MOCK_DATA === 'true'
```

- [ ] **Step 3: Wrap onMount with mock branch**

Replace the `onMount` block:

Old code (lines 19-35):
```ts
onMount(async () => {
  const childId = $page.params.id ?? ''
  if (!childId) { errorMsg = 'No child ID'; loading = false; return }
  try {
    const [found, measurements] = await Promise.all([
      childRepo.findById(childId),
      childRepo.getMeasurements(childId),
    ])
    child = found
    records = measurements.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
  } catch (e) {
    console.error('Failed to load child:', e)
    errorMsg = 'Failed to load child data'
  } finally {
    loading = false
  }
})
```

New code:
```ts
onMount(async () => {
  const childId = $page.params.id ?? ''
  if (!childId) { errorMsg = 'No child ID'; loading = false; return }
  try {
    if (mockMode) {
      const found = mockChildren.find((c) => c.id === childId)
      if (found) {
        child = { ...found, birthDate: new Date(found.birthDate) }
      }
      records = mockGrowthRecords
        .filter((r) => r.childId === childId)
        .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
    } else {
      const [found, measurements] = await Promise.all([
        childRepo.findById(childId),
        childRepo.getMeasurements(childId),
      ])
      child = found
      records = measurements.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
    }
  } catch (e) {
    console.error('Failed to load child:', e)
    errorMsg = 'Failed to load child data'
  } finally {
    loading = false
  }
})
```

Note: `getAge()` already accepts `birthDate: string | Date` — no changes needed there.

- [ ] **Step 4: Verify the file**

Run: `npx svelte-check --tsconfig ./tsconfig.json`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/child/\[id\]/+page.svelte
git commit -m "feat(web): add mock data toggle to child detail page"
```

---

### Task 3: catalog/+page.svelte — mock data for catalog

**Files:**
- Modify: `apps/web/src/routes/catalog/+page.svelte`

**Interfaces:**
- Consumes: `mockItems` from `$lib/mocks/data`
- Produces: N/A

- [ ] **Step 1: Read the current file**

Run: `cat apps/web/src/routes/catalog/+page.svelte`
Expected: Imports HttpCatalogRepository, uses catalogRepo.fetch()

- [ ] **Step 2: Add mock imports and env var check**

Add after existing imports:
```ts
import { PUBLIC_MOCK_DATA } from '$env/dynamic/public'
import { mockItems } from '$lib/mocks/data'

const mockMode = PUBLIC_MOCK_DATA === 'true'
```

- [ ] **Step 3: Wrap the data loading with mock branch**

Find the `onMount` block that calls `catalogRepo.fetch()` and add an if/else branch. The mock branch assigns `mockItems` directly:

```ts
if (mockMode) {
  items = mockItems
} else {
  items = await catalogRepo.fetch(filter)
}
```

- [ ] **Step 4: Verify the file**

Run: `npx svelte-check --tsconfig ./tsconfig.json`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/catalog/+page.svelte
git commit -m "feat(web): add mock data toggle to catalog page"
```

---

### Task 4: chat/+page.svelte — mock data for chat

**Files:**
- Modify: `apps/web/src/routes/chat/+page.svelte`

**Interfaces:**
- Consumes: `mockChildren`, `mockGrowthRecords`, `mockItems`, `mockMessages`, `MockChild` from `$lib/mocks/data`
- Produces: N/A

- [ ] **Step 1: Read the current file**

Run: `cat apps/web/src/routes/chat/+page.svelte`
Expected: Complex page with 3 repos (HttpChildRepository, HttpCatalogRepository, SseChatRepository), message streaming, and component rendering

- [ ] **Step 2: Add mock imports and env var check**

Add after existing imports:
```ts
import { PUBLIC_MOCK_DATA } from '$env/dynamic/public'
import { mockChildren, mockGrowthRecords, mockItems, mockMessages } from '$lib/mocks/data'

const mockMode = PUBLIC_MOCK_DATA === 'true'
```

- [ ] **Step 3: Wrap data loading in onMount with mock branch**

In the `onMount` block, wrap each repository call:
- `childRepo.findAll()` → `mockChildren` (with birthDate conversion)
- `childRepo.getMeasurements()` → `mockGrowthRecords.filter()`
- `catalogRepo.fetch()` → `mockItems`
- Chat history load → `mockMessages` for initial messages

- [ ] **Step 4: Wrap handleSend with a mock branch**

When mock mode is active, instead of calling `sseChatRepo.send()`, push the user message and then simulate an agent response after a short timeout:

```ts
if (mockMode) {
  const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: new Date() }
  messages = [...messages, userMsg]
  inputText = ''
  setTimeout(() => {
    const agentMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Simulated response for: ' + text,
      createdAt: new Date(),
    }
    messages = [...messages, agentMsg]
  }, 1000)
  return
}
```

- [ ] **Step 5: Verify the file**

Run: `npx svelte-check --tsconfig ./tsconfig.json`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/chat/+page.svelte
git commit -m "feat(web): add mock data toggle to chat page"
```

---

### Task 5: notifications/+page.svelte — mock data for notifications

**Files:**
- Modify: `apps/web/src/routes/notifications/+page.svelte`

**Interfaces:**
- Consumes: `mockNotifications` from `$lib/mocks/data`
- Produces: N/A

- [ ] **Step 1: Read the current file**

Run: `cat apps/web/src/routes/notifications/+page.svelte`
Expected: 311 lines, imports HttpNotificationRepository, uses notifRepo.findAll() and notifRepo.markAsRead()

- [ ] **Step 2: Add mock imports and env var check**

Add after existing imports:
```ts
import { PUBLIC_MOCK_DATA } from '$env/dynamic/public'
import { mockNotifications } from '$lib/mocks/data'

const mockMode = PUBLIC_MOCK_DATA === 'true'
```

- [ ] **Step 3: Wrap onMount with mock branch**

Replace the `onMount` block:

Old code (lines 13-21):
```ts
onMount(async () => {
  try {
    notifications = await notifRepo.findAll()
  } catch (e) {
    console.error('Failed to load notifications:', e)
  } finally {
    loading = false
  }
})
```

New code:
```ts
onMount(async () => {
  try {
    if (mockMode) {
      notifications = [...mockNotifications]
    } else {
      notifications = await notifRepo.findAll()
    }
  } catch (e) {
    console.error('Failed to load notifications:', e)
  } finally {
    loading = false
  }
})
```

- [ ] **Step 4: Wrap markAsRead calls with mock branches**

In `handleMarkAllRead`, the `notifRepo.markAsRead(n.id)` calls should be skipped in mock mode (the local state mutation already handles it).

Wrap the `Promise.allSettled` line:
```ts
if (!mockMode) {
  await Promise.allSettled(unread.map((n) => notifRepo.markAsRead(n.id)))
}
```

In `handleItemClick`, wrap the `notifRepo.markAsRead(id)` call:
```ts
if (!mockMode) {
  try {
    await notifRepo.markAsRead(id)
  } catch (e) {
    console.error('Failed to mark notification read:', e)
  }
}
```

- [ ] **Step 5: Verify the file**

Run: `npx svelte-check --tsconfig ./tsconfig.json`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/notifications/+page.svelte
git commit -m "feat(web): add mock data toggle to notifications page"
```

---

### Task 6: profile/+page.svelte — mock data for profile

**Files:**
- Modify: `apps/web/src/routes/profile/+page.svelte`

**Interfaces:**
- Consumes: `mockSession` from `$lib/mocks/data`
- Produces: N/A

- [ ] **Step 1: Read the current file**

Run: `cat apps/web/src/routes/profile/+page.svelte`
Expected: 249 lines, imports HttpAuthRepository, uses authRepo.getSession() and authRepo.logout()

- [ ] **Step 2: Add mock imports and env var check**

Add after existing imports:
```ts
import { PUBLIC_MOCK_DATA } from '$env/dynamic/public'
import { mockSession } from '$lib/mocks/data'

const mockMode = PUBLIC_MOCK_DATA === 'true'
```

- [ ] **Step 3: Wrap onMount with mock branch**

Replace the `onMount` block:

Old code (lines 14-26):
```ts
onMount(async () => {
  try {
    session = await authRepo.getSession()
    if (!session) {
      goto('/login')
    }
  } catch (e) {
    console.error('Failed to load session:', e)
    goto('/login')
  } finally {
    loading = false
  }
})
```

New code:
```ts
onMount(async () => {
  try {
    if (mockMode) {
      session = mockSession
    } else {
      session = await authRepo.getSession()
      if (!session) {
        goto('/login')
      }
    }
  } catch (e) {
    console.error('Failed to load session:', e)
    goto('/login')
  } finally {
    loading = false
  }
})
```

- [ ] **Step 4: Wrap handleLogout with a mock branch**

```ts
async function handleLogout() {
  if (!mockMode) {
    await authRepo.logout()
  }
  goto('/login')
}
```

- [ ] **Step 5: Verify the file**

Run: `npx svelte-check --tsconfig ./tsconfig.json`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/profile/+page.svelte
git commit -m "feat(web): add mock data toggle to profile page"
```

---

### Task 7: +layout.svelte — mock session in app shell

**Files:**
- Modify: `apps/web/src/routes/+layout.svelte`

**Interfaces:**
- Consumes: `mockSession` from `$lib/mocks/data`
- Produces: N/A

- [ ] **Step 1: Read the current file**

Run: `cat apps/web/src/routes/+layout.svelte`
Expected: Imports data.session from server, creates writable session store via setContext

- [ ] **Step 2: Add mock imports and env var check**

Add after existing imports:
```ts
import { PUBLIC_MOCK_DATA } from '$env/dynamic/public'
import { mockSession } from '$lib/mocks/data'

const mockMode = PUBLIC_MOCK_DATA === 'true'
```

- [ ] **Step 3: Inject mock session when mock mode is active**

Where the layout sets the session from server data, add an override:
```ts
const initialSession = mockMode ? mockSession : (data.session ?? null)
```

- [ ] **Step 4: Verify the file**

Run: `npx svelte-check --tsconfig ./tsconfig.json`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/+layout.svelte
git commit -m "feat(web): add mock session toggle to app layout"
```
