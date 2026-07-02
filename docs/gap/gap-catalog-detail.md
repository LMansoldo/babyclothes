# Gap Analysis: /catalog/[id] Page (Section 04)

> **Source**: DS v1.0 `#itemcard` (line 910)
> **Correction note**: ItemCard uses **solid white** per DS spec (`background: #fff; border: 1.5px solid #EDE9E4; border-radius: 1.25rem;`) — the original analysis incorrectly suggested glassmorphism.

---

## Background

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Page background | `#F8F5F2` | `var(--of2)` — verify equivalence ❌ |

**Status**: ❌ Needs alignment
**Action**: Set explicit `#F8F5F2` to match DS v1.0 exactly.

---

## ItemCard Component

The detail page delegates to `ItemCard.svelte`. DS v1.0 line 910 specifies:

> `background: #fff; border: 1.5px solid #EDE9E4; border-radius: 1.25rem;`

| Element | DS v1.0 | Current Implementation |
|---------|---------|----------------------|
| Card background | `#fff` (solid white) | Solid white — **matches DS spec** ✅ |
| Card border | `1.5px solid #EDE9E4` | Needs verification |
| Card radius | `1.25rem` | Needs verification |
| Photo area | Full-width top section | Full-width ✅ |
| Photo gradients | Gradient overlay per mock | Needs verification |
| Info section | Seller avatar, name, item details | Present ✅ |
| Token usage | `--wh`, `--bk`, `--pk` standard tokens | Uses `var(--color-white)`, `var(--color-black)`, `var(--color-pink)` ❌ |
| Heart button bg | `rgba(255,255,255,.9)` — per DS line 913 | Near-spec (verify) ⚠️ |
| Action buttons | Ghost (`--of2` bg) and primary (`--pk` bg) | Present ✅ |

**Status**: ⚠️ Partial — token mapping needs fixing, heart button/photo gradient need verification
**Action**: Replace non-standard tokens (`var(--color-white)` → `var(--wh)`, etc.). Verify heart button bg matches `rgba(255,255,255,.9)`. Verify border and radius values match DS. Verify gradient overlay matches mock.

---

## Summary

| Priority | Item | Difficulty |
|----------|------|-----------|
| P1 | Fix background to `#F8F5F2` | Easy |
| P1 | Fix ItemCard token references (color-white → wh, etc.) | Medium |
| P2 | Verify heart button bg = `rgba(255,255,255,.9)` | Easy |
| P2 | Verify border/radius values match DS spec | Easy |
| P2 | Verify photo gradient matches mock | Easy |
