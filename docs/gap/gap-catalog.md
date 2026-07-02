# Gap Analysis: /catalog Page (Section 03)

**Mock coordinates**: Row 1, column 3 (~x=800, y=0, 390×880px)

## Background

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Page background | `#F8F5F2` (equivalent to `--of`) | Not set (transparent / inherited) ❌ |

**Status**: ❌ Needs alignment
**Action**: Set `background: #F8F5F2` or `var(--of)` on `.catalog-page`.

---

## Filter Bar / Size Row

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Filter bar bg | Solid `#F8F5F2` (inherits page bg) | Glassmorphism `rgba(255,255,255,0.32)` with `backdrop-filter: blur(1.6rem)` ❌ |
| Filter bar border-bottom | None visible | `0.1rem solid rgba(255,255,255,0.6)` ❌ |
| Filter pills bg (inactive) | `#F3F4F6` | `rgba(255,255,255,0.45)` with `backdrop-filter: blur(1rem)` ❌ |
| Filter pills border (inactive) | None | `0.1rem solid rgba(255,255,255,0.7)` ❌ |
| Filter pills text (inactive) | `#374151` | `#333` (approximate) |
| Filter pills bg (active) | `#111` (black) | `rgba(255,214,238,0.55)` with pink border ❌ |
| Filter pills text (active) | White | `var(--pk)` pink ❌ |
| Filter pills border-radius | 99rem (fully rounded) | `var(--r-xs)` ❌ |
| Filter pills padding | 8px 14px | `0.25rem 0.7rem` ❌ |
| Filter pills gap | 6px | `0.4rem` ❌ |
| Gender filter pill | Present: `#FFE8F5` bg, `#FF3CAC` text, 4px gap, icon | **Missing entirely** ❌ |

**Status**: ❌ Needs complete realignment
**Action**: Remove glassmorphism from all filter elements. Use `#F8F5F2` for page/filter bg. Inactive pills: `#F3F4F6` bg, `#374151` text. Active pills: `#111` bg, white text, 99rem border-radius. Add gender filter pill per mock.

---

## Catalog Grid

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Layout | **2-column grid**, 10px gap, 12px 14px padding | 5 horizontal scroll sections ❌ |
| Cards | Fixed width in grid, 130px gradient image, 8px 10px padding content | Variable width in horizontal scroll |
| Section headers | "Em alta esta semana", "Recém-nascido · RN", etc. | Same section headers (partial match) |
| "Ver todos" link | Present per section | Present ✅ |

**Status**: ❌ Needs layout restructure
**Action**: Replace horizontal scroll sections with a single 2-column grid layout per mock. Keep section headers but change layout from horizontal scroll to grid.

---

## Catalog Card (inside grid)

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Card image | 130px height, gradient overlay | Varies (horizontal scroll) |
| Card content padding | 8px 10px | Varies |
| Condition badge | 6px positioning from edges, 2px 7px padding, 99rem border-radius | Uses Badge component from @babyclothes/ui |
| Price | `0.9rem`, 900 weight, `#FF3CAC` color | Needs verification |

**Status**: ⚠️ Partial match (card internals need verification against mock)
**Action**: Audit card rendering in grid context. Match price styling, badge positioning, and gradient image height.

---

## Section Headers (Category Nav)

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Tabs | "Todos, Camisetas, Bodies, Calças, Vestidos" (5) | 11 different categories ❌ |
| Active tab | 2.5px pink bottom border | 0.2rem pink bottom border ❌ |
| Separator dots | None | Present between categories ❌ |

**Status**: ❌ Needs alignment
**Action**: Match mock categories (5 items). Remove separator dots.

---

## Summary

| Priority | Item | Difficulty |
|----------|------|-----------|
| P0 | Background color → `#F8F5F2` | Easy |
| P0 | Replace glassmorphism with solid colors on filters | Easy |
| P0 | Match filter pill spec (bg, text, padding, radius, gap) | Medium |
| P0 | Add gender filter pill | Easy |
| P0 | 2-column grid layout instead of horizontal scroll | Medium |
| P1 | Match category names to mock (5 items) | Easy |
| P1 | Remove separator dots in category nav | Easy |
| P2 | Audit card price/badge styling | Easy |
