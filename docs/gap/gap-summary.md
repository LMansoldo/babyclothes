# Gap Analysis Summary — DS v1.0 vs Current Implementation

> Generated: 2026-06-26
> Mock source: `BabyClothes Mocks.dc.html` (12 screens)
> DS source: `BabyClothes Design System.dc.html` (authoritative component spec)
> All gap files: `docs/gap/gap-*.md`

---

## P0 Issues (Critical — visual fidelity broken)

| # | Screen | Issue | File |
|---|--------|-------|------|
| 1 | All content screens | Background should be `#F8F5F2` but uses `var(--of2)` (~`#EDE9E4`) | All pages |
| 2 | /catalog | Filter pills use glassmorphism instead of solid `#F3F4F6`/`#111` | `gap-catalog.md` |
| 3 | /catalog | Layout is 5 horizontal scroll sections instead of 2-column grid | `gap-catalog.md` |
| 4 | /catalog | No gender filter pill (`#FFE8F5` bg, `#FF3CAC` text) | `gap-catalog.md` |
| 5 | /chat | User chat bubble should be solid `#fff` (agent bubble glass IS spec) | `gap-chat.md` |
| 6 | /chat | Agent avatar uses abstract dot instead of droplet icon | `gap-chat.md` |
| 7 | /chat | Chat header uses glassmorphism instead of solid white | `gap-chat.md` |
| 8 | Footer | Footer component exists but is never rendered | `gap-footer.md` |

---

## P1 Issues (Important — needs fixing)

| # | Screen | Issue | File |
|---|--------|-------|------|
| 9 | TopBar | Search bar values: solid `#F3F4F6`, `99rem`, `0.35rem 0.875rem` (glass IS spec) | `gap-shell.md` |
| 10 | TopBar | Chat IA button: `1.5px solid #D1D5DB`, `99rem`, `0.4rem 0.75rem`, `0.75rem` | `gap-shell.md` |
| 11 | BottomNav | Layout values need verification against DS spec (glass IS spec) | `gap-shell.md` |
| 12 | CategoryTabNav | Glassmorphism → solid white, remove separator dots, 2.5px active border | `gap-shell.md` |
| 13 | CategoryTabNav | Match categories to mock: 5 items (Todos, Camisetas, Bodies, Calças, Vestidos) | `gap-shell.md` |
| 14 | /catalog | Filter pill spec: `0.35rem 0.75rem`, `99rem`, `0.8rem`, `font-weight: 700` | `gap-catalog.md` |
| 15 | /catalog | Active pill: `#111` bg with white text (not pink) | `gap-catalog.md` |
| 16 | /catalog | Inactive pill: `#F3F4F6` bg, `#374151` text | `gap-catalog.md` |
| 17 | /catalog/[id] | Background → `#F8F5F2` | `gap-catalog-detail.md` |
| 18 | /catalog/[id] | ItemCard uses non-standard tokens (color-white → wh, etc.) | `gap-catalog-detail.md` |
| 19 | /child | Background → `#F8F5F2` (GrowthChart glass IS spec) | `gap-child.md` |
| 20 | /child/[id] | Background → `#F8F5F2` (GrowthChart glass IS spec) | `gap-child.md` |
| 21 | /notifications | Background → `#F8F5F2` | `gap-notifications.md` |
| 22 | /profile | Background → `#F8F5F2` | `gap-profile.md` |
| 23 | Footer | Create /terms and /privacy static routes | `gap-footer.md` |

---

## P2 Issues (Minor — polish)

| # | Screen | Issue | File |
|---|--------|-------|------|
| 24 | /sell | Verify background and input styling | `gap-sell.md` |
| 25 | /child/register | Verify form styling against mock | `gap-child.md` |
| 26 | ItemCard | Heart button `rgba(255,255,255,.9)` — verify matches DS | `gap-catalog-detail.md` |
| 27 | Audit | Verify `var(--font-ui)` exists in tokens.css | `gap-shell.md` |
| 28 | Audit | Audit all non-standard token references across 28 components | — |

---

## Pervasive Patterns

### 1. Background Color Mismatch
Multiple screens use `var(--of2)` (~`#EDE9E4`) instead of `#F8F5F2` (DS-spec content background). This is the single biggest visual discrepancy.

**Pages affected**: /catalog, /catalog/[id], /child, /child/[id], /notifications, /profile, /chat.

### 2. Glassmorphism Where Solid Is Spec'd
Several components use glass effects where the DS specifies solid colors:
- **Filter pills**: glass → solid `#F3F4F6`/`#111`
- **User chat bubble**: glass → solid `#fff`
- **CategoryTabNav**: glass → solid white (per mocks)
- **Chat header**: glass → solid white

Glassmorphism that IS DS-correct: TopBar, BottomNav, Agent chat bubble, GrowthChart.

### 3. Unused Footer
`Footer.svelte` is fully implemented but never imported in any layout or page.

### 4. Non-Standard CSS Tokens
Several components reference tokens not defined in `tokens.css`:
- `var(--color-white)`, `var(--color-black)`, `var(--color-pink)` (ItemCard)
- `var(--font-ui)` (BottomNav, ItemCard, ItemForm)
- `var(--radius-md)` (ItemCard)

### 5. Horizontal Scroll Instead of Grid
The catalog page uses 5 horizontal scroll sections instead of the mock's single 2-column grid layout.
