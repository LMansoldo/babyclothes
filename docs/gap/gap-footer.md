# Gap Analysis: Footer Component

## Footer

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| Footer presence | Present in all content screens | **Never imported anywhere** ❌ |
| Columns | 4 columns: Sobre, Ajuda, Legal, Social | Implemented ✅ |
| Background | Dark (`var(--bk)`) | `var(--bk)` ✅ |
| Heading color | White | White ✅ |
| Link color | Gray | Gray ✅ |
| Responsive | 4 → 2 → 1 columns at breakpoints | 4 → 2 → 1 at 76.8rem and 48rem ✅ |
| Copyright bar | Present at bottom | Present ✅ |

**Status**: ⚠️ Component is fully implemented but **unused**
**Action**: Import and render `Footer.svelte` in the root layout (`+layout.svelte`) so it appears on all content screens.

---

## Related: /terms and /privacy Routes

| Element | Mock (DS v1.0) | Current Implementation |
|---------|----------------|----------------------|
| /terms route | Linked from AuthScreen footer | **Does not exist** ❌ |
| /privacy route | Linked from AuthScreen footer | **Does not exist** ❌ |

**Status**: ❌ Missing
**Action**: Create static `/terms` and `/privacy` routes with basic legal content matching DS style.

---

## Summary

| Priority | Item | Difficulty |
|----------|------|-----------|
| P0 | Integrate Footer into root layout | Easy |
| P1 | Create /terms and /privacy static routes | Easy |
