# Gap Analysis: Shell Components (TopBar, BottomNav, CategoryTabNav)

> **Source**: DS v1.0 `#effects` (line 327) and `#navigation` (line 1060)
> **Correction note**: Glassmorphism on TopBar and BottomNav is **per DS spec** — these were NOT compared against the DS in the original analysis.

---

## TopBar

| Element | DS v1.0 | Current Implementation |
|---------|---------|----------------------|
| Container bg | `rgba(255,255,255,.88)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,.6)` + `border-radius: 1rem` | Glassmorphism (likely matches — verify values) ✅ |
| Container padding | `0.75rem 1.25rem` | Needs verification |
| Logo droplet | 12×15px droplet SVG + Londrina Solid 0.82rem | Needs verification |
| Search bar bg | `#F3F4F6` solid | Needs verification |
| Search bar radius | `99rem` | Needs verification |
| Search bar padding | `0.35rem 0.875rem` | Needs verification |
| Search bar placeholder | "Buscar roupas..." (pt) | Needs verification |
| Chat IA button | Ghost: `border: 1.5px solid #D1D5DB`, `color: #374151`, `border-radius: 99rem`, `padding: 0.4rem 0.75rem`, `font-size: 0.75rem` | Needs verification |
| Publicar button | `background: #FF3CAC`, `color: #fff`, `border-radius: 99rem`, `padding: 0.4rem 0.75rem`, `font-size: 0.75rem` | `var(--pk)` pink ✅ |
| Avatar | `2rem` (32px), `border-radius: 50%`, gradient `#FF3CAC → #B03EFF`, initials overlay | Needs verification |

**Status**: ⚠️ Glassmorphism is DS-spec correct. Search bar and button details need verification against DS values.

---

## BottomNav

| Element | DS v1.0 | Current Implementation |
|---------|---------|----------------------|
| Container bg | `rgba(255,255,255,.88)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,.6)` + `border-radius: 1rem` | Glassmorphism (likely matches — verify values) ✅ |
| Container padding | `0.625rem 0.25rem` | Needs verification |
| Items | 4: Catálogo (Home), Chat (MessageSquare), Crianças (Heart), Vender (Plus) | Same 4 items ✅ |
| Item layout | `flex-direction: column`, `gap: 0.25rem`, `padding: 0.35rem 0.75rem`, `border-radius: 0.5rem` | Needs verification |
| Icon size | 20×20px | Needs verification |
| Label font | `0.62rem`, `font-weight: 700` | Needs verification |
| Active color | `#FF3CAC` (icon + text) | Pink ✅ |
| Inactive color | `#9CA3AF` (icon + text) | Needs verification |

**Status**: ⚠️ Glassmorphism is DS-spec correct. Layout values need verification.

---

## CategoryTabNav

> **Note**: CategoryTabNav is **not defined in DS v1.0**. Comparison is against screen mocks only.

| Element | Mock layout | Current Implementation |
|---------|-------------|----------------------|
| Background | Solid white | Glassmorphism ❌ |
| Layout | Horizontal scroll, 10px 12px padding | Horizontal scroll ✅ |
| Active tab indicator | 2.5px pink bottom border | 0.2rem (~3.2px) ❌ |
| Separator dots | None in mock | Present between categories ❌ |
| Categories | "Todos, Camisetas, Bodies, Calças, Vestidos" (5) | 11 different categories ❌ |

**Status**: ❌ Needs alignment
**Action**: Solid white background. Remove separator dots. Match active border to 2.5px. Align categories to mock: Todos, Camisetas, Bodies, Calças, Vestidos.

---

## Summary

| Priority | Item | Difficulty |
|----------|------|-----------|
| P1 | Fix CategoryTabNav: solid bg, categories, dots, border | Medium |
| P2 | Verify TopBar/BottomNav DS values match implementation | Easy |
| P2 | Verify search bar styling against DS `#F3F4F6` `99rem` spec | Easy |
