## WP10 — DS: primitive `Select`

Local: `packages/design-system/src/primitives/Select/`. Seguir a regra global 7 (`.svelte` + `index.ts` + `.stories.ts` + `.test.ts` + export no barrel). Não existe select no DS hoje — **ler `primitives/Input/Input.svelte` antes** e espelhar API e visual.

```ts
export interface SelectOption { value: string; label: string }
// Select props
{
  id: string
  options: SelectOption[]
  value?: string            // $bindable
  label?: string
  placeholder?: string      // vira <option value="" disabled>
  error?: string
  hint?: string
  disabled?: boolean
  name?: string
  onchange?: (value: string) => void
}
```

Render: `<select>` nativo com `appearance: none` e chevron SVG inline posicionado à direita. BEM: `.select`, `.select__label`, `.select__el`, `.select__el--error`, `.select__error`, `.select__hint`. Visual = Input: fundo `var(--wh)`, borda `1.5px solid #D1D5DB` (erro: `var(--color-error)`), radius igual ao Input, fonte `--font-lato`, mesmo padding. Com placeholder selecionado, texto `#9CA3AF`.

Testes: renderiza label e N options; `bind:value` reflete a seleção e dispara `onchange`; placeholder vira option disabled; erro aplica modifier e exibe mensagem; `disabled` bloqueia. Story: UFs brasileiras como options, variantes default/erro/disabled.

**DoD**: `yarn test:ds` e `yarn check:ds` verdes; `import { Select } from '@babyclothes/design-system'` funciona; story no Storybook.
