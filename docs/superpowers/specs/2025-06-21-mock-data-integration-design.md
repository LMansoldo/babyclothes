# Mock Data Integration — Web App

## Summary

Connect the SvelteKit web app pages to the existing mock data in `src/lib/mocks/data.ts`, toggled via environment variable `PUBLIC_MOCK_DATA=true`.

## Toggle Mechanism

Each page checks `$env/dynamic/public.PUBLIC_MOCK_DATA === 'true'` at the top of its `<script>` block. When true, data is read directly from the `mocks/data.ts` arrays instead of calling HTTP repository classes.

## Pages and Their Mock Adaptations

### child/+page.svelte
- `childRepo.findAll()` → `mockChildren` (no userId filtering — all mock children belong to user-1)
- `childRepo.getMeasurements(id)` → `mockGrowthRecords.filter(r => r.childId === id)`

### child/[id]/+page.svelte
- `childRepo.findById(id)` → `mockChildren.find(c => c.id === id)`
- `childRepo.getMeasurements(id)` → `mockGrowthRecords.filter(r => r.childId === id)`
- Convert `MockChild.birthDate` (string) → `Date` for the domain `Child` type

### child/register/+page.svelte
- No repository calls today — only console.log. No changes needed for mock mode.

### catalog/+page.svelte
- `catalogRepo.fetch(filter)` → `mockItems.filter(...)` applying size/category/gender/condition

### chat/+page.svelte
- `childRepo.findAll()` → `mockChildren`
- `childRepo.getMeasurements(id)` → `mockGrowthRecords`
- `catalogRepo.fetch()` → `mockItems`
- Chat messages → `mockMessages` for initial history; new user messages get a simulated agent response

### notifications/+page.svelte
- `notifRepo.findAll()` → `mockNotifications` (which are already typed `Notification[]`)
- `notifRepo.markAsRead(id)` → mutate `readAt` in the array

### profile/+page.svelte
- `authRepo.getSession()` → `mockSession`

### +layout.svelte
- Session store → `mockSession` when mock mode is active

### catalog/[id]/+page.server.ts
- Already uses mock data. No changes.

## Type Mapping

`MockChild` has `birthDate: string`, but the domain `Child` type expects `Date`. Pages that need `Child` objects convert:
```ts
const child: Child = { ...c, birthDate: new Date(c.birthDate) }
```

`GrowthRecord` in `data.ts` already has `recordedAt: Date` — matches the domain type.

## Files to Modify

1. `apps/web/src/routes/child/+page.svelte`
2. `apps/web/src/routes/child/[id]/+page.svelte`
3. `apps/web/src/routes/catalog/+page.svelte`
4. `apps/web/src/routes/chat/+page.svelte`
5. `apps/web/src/routes/notifications/+page.svelte`
6. `apps/web/src/routes/profile/+page.svelte`
7. `apps/web/src/routes/+layout.svelte`

## What NOT to Do

- Do NOT create Mock*Repository classes
- Do NOT create a DI/factory mechanism
- Do NOT modify `mocks/data.ts`
- Do NOT modify domain entities or interfaces
- Do NOT modify HTTP repository classes

## Future Considerations

When the real API is ready, set `PUBLIC_MOCK_DATA=false` (or unset) and the app uses HTTP repos again. Mock mode can be removed once the API is stable by deleting the `if (mock)` branches.
