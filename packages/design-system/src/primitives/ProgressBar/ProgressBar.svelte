<script lang="ts">
  type Variant = 'pink' | 'gray' | 'dark'

  let {
    value = 0,
    max = 100,
    variant = 'pink',
    showLabel = false,
    labelFormat,
    ariaLabel,
    ariaValueText,
    height = 0.6,
    animated = true,
  }: {
    value?: number
    max?: number
    variant?: Variant
    showLabel?: boolean
    labelFormat?: (value: number, max: number) => string
    ariaLabel?: string
    ariaValueText?: string
    height?: number
    animated?: boolean
  } = $props()

  const percent = $derived(Math.min(100, Math.max(0, (value / max) * 100)))
  const displayLabel = $derived(
    labelFormat ? labelFormat(value, max) : `${Math.round(percent)}%`
  )
</script>

<div
  class="progressbar progressbar--{variant}"
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuetext={ariaValueText}
  aria-label={ariaLabel}
>
  {#if showLabel}
    <span class="progressbar__label">{displayLabel}</span>
  {/if}
  <div
    class="progressbar__track"
    style="height: {height}rem"
  >
    <div
      class="progressbar__fill"
      class:progressbar__fill--animated={animated}
      style="width: {percent}%; height: {height}rem"
    ></div>
  </div>
</div>

<style>
  .progressbar {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;
  }

  .progressbar__label {
    font-family: var(--font-lato);
    font-size: 0.7rem;
    color: var(--color-gray);
  }

  .progressbar__track {
    width: 100%;
    border-radius: var(--radius-pill);
    background: #F3F4F6;
    overflow: hidden;
  }

  .progressbar__fill {
    border-radius: var(--radius-pill);
  }

  .progressbar__fill--animated {
    transition: width var(--transition-base);
  }

  /* Pink variant */
  .progressbar--pink .progressbar__fill {
    background: linear-gradient(90deg, #FF3CAC, #B03EFF);
  }

  /* Gray variant */
  .progressbar--gray .progressbar__fill {
    background: #D1D5DB;
  }

  /* Dark variant */
  .progressbar--dark .progressbar__fill {
    background: var(--color-black);
  }
</style>
