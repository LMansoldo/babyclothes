# Gap Analysis: /chat Page — ChatBubble Component

> **Source**: DS v1.0 `#chatbubble` (line 940)
> **Correction note**: Agent bubble glassmorphism is **per DS spec** — the original analysis incorrectly flagged it.

---

## Background

| Element | DS v1.0 | Current Implementation |
|---------|---------|----------------------|
| Page background | `#F8F5F2` (DS section `#chatbubble` sits on `#111`, but page bg is `#F8F5F2` per DS `#notifications` and `#growth` sections) | Needs verification |

**Status**: ⚠️ Needs verification
**Action**: Set `background: #F8F5F2` on chat page.

---

## Agent Avatar

| Element | DS v1.0 | Current Implementation |
|---------|---------|----------------------|
| Container | 1.75rem circle, `background: #111`, `border: 1px solid rgba(255,255,255,.2)` | Abstract pink dot on dark bg ❌ |
| Icon | Droplet SVG (BabyClothes logo), `fill="#FF3CAC"`, 9×11px viewBox | Missing droplet ❌ |

**Status**: ❌ Needs alignment
**Action**: Match DS spec: 1.75rem circle, `#111` bg, 1px `rgba(255,255,255,.2)` border, droplet SVG centered.

---

## Chat Bubbles

| Element | DS v1.0 | Current Implementation |
|---------|---------|----------------------|
| **Agent bubble** bg | `rgba(255,255,255,.12)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,.15)` | Glassmorphism — **matches DS spec** ✅ |
| Agent bubble radius | `1rem 1rem 1rem 0.25rem` (top-left flat) | Needs verification |
| Agent bubble padding | `0.75rem 1rem` | Needs verification |
| Agent text color | `#fff` | ✅ White text |
| Agent timestamp | `0.62rem`, `color: rgba(255,255,255,.4)` | Needs verification |
| **User bubble** bg | `background: #fff` (solid white) | Glassmorphism `rgba(10,10,10,0.92)` ❌ |
| User bubble radius | `1rem 1rem 0.25rem 1rem` (bottom-right flat) | Needs verification |
| User bubble padding | `0.75rem 1rem` | Needs verification |
| User text color | `#111` | Needs verification |
| User timestamp | `0.62rem`, `color: #9CA3AF`, `text-align: right` | Needs verification |
| **System badge** bg | `rgba(255,232,245,.12)` + `border: 1px solid rgba(255,60,172,.3)` | `rgba(255,60,172,0.08)` — close but verify |
| System badge radius | `99rem` | Needs verification |
| System badge padding | `0.3rem 0.875rem` | Needs verification |
| System text color | `#FF85CC` | Needs verification |

**Status**: ❌ Partial — user bubble needs solid white. Agent bubble is DS-correct.
**Action**: User bubble → solid `#fff` with `#111` text right-aligned. Verify agent bubble values match DS exactly. Verify system badge styling.

---

## Chat Header

| Element | DS v1.0 | Current Implementation |
|---------|---------|----------------------|
| Background | Solid white (inferred — DS doesn't specify a separate chat header) | Glassmorphism ❌ |
| Agent avatar | Droplet icon in dark circle | Missing droplet ❌ |
| SSE live pill | Present | Present ✅ (green pulse) |

**Status**: ❌ Background and avatar need alignment
**Action**: Solid white background. Replace avatar with droplet per DS spec (1.75rem circle, `#111` bg, droplet icon).

---

## Summary

| Priority | Item | Difficulty |
|----------|------|-----------|
| P0 | Page background → `#F8F5F2` | Easy |
| P0 | User bubble → solid `#fff` with `#111` text | Easy |
| P1 | Agent avatar → droplet icon in dark circle | Medium |
| P1 | Chat header → solid white | Easy |
| P2 | Audit agent bubble values against DS spec | Easy |
| P2 | Audit system badge styling | Easy |
