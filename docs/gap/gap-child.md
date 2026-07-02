# Gap Analysis: /child, /child/register, /child/[id] Pages (Sections 06-08)

> **Source**: DS v1.0 `#growth` (line 983)
> **Correction note**: GrowthChart glassmorphism is **per DS spec** — `background: rgba(255,255,255,.75); backdrop-filter: blur(12px); border: 1.5px solid #EDE9E4;`. The original analysis incorrectly flagged it.

---

## /child — Children List (Section 06)

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Background | `#F8F5F2` | `var(--of2)` (~`#EDE9E4`) ❌ |
| List items | Children cards with name, age, size prediction | Needs verification |
| GrowthChart | Glassmorphism per DS spec | Likely matches ✅ |

**Status**: ❌ Background needs fixing
**Action**: Change background to `#F8F5F2`.

---

## /child/register — Register Form (Section 07)

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Background | `#F8F5F2` | Needs verification |
| Form fields | Name, birthdate, gender, weight, height, head, CPF | Same fields ✅ |
| Form styling | Clean white cards on off-white bg | Needs verification |

**Status**: ⚠️ Form fields match, styling needs verification

---

## /child/[id] — Child Detail (Section 08)

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Page background | `#F8F5F2` | `var(--of2)` ❌ |
| Header | White bg with back button, child name | White bg, ArrowLeft button ✅ |
| GrowthChart | `rgba(255,255,255,.75)` + `blur(12px)` + `1.5px solid #EDE9E4` — per DS spec | Glassmorphism — **matches DS spec** ✅ |
| History section | White bg, border-radius | White bg, 1.6rem border-radius ✅ |

**Status**: ⚠️ Background needs fixing. GrowthChart glassmorphism is DS-correct.
**Action**: Fix page background → `#F8F5F2`.

---

## GrowthChart Component

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Container bg | `rgba(255,255,255,.75)` + `backdrop-filter: blur(12px)` — per DS spec | Glassmorphism — **matches DS spec** ✅ |
| Size blocks | Arrow progression through sizes | Arrow progression ✅ |
| Measurements | Weight, height, head circumference with percentiles | Same measurements ✅ |

**Status**: ✅ DS-correct. No changes needed.

---

## Summary

| Priority | Item | Difficulty |
|----------|------|-----------|
| P1 | Fix /child list background → `#F8F5F2` | Easy |
| P1 | Fix /child/[id] background → `#F8F5F2` | Easy |
| P2 | Verify /child/register form styling | Easy |
