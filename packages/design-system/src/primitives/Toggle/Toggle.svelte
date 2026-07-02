<script lang="ts">
  type Variant = 'switch' | 'chip'
  type Size = 'sm' | 'md'

  let {
    checked = false,
    disabled = false,
    size = 'md',
    variant = 'switch',
    onLabel,
    offLabel,
    ariaLabel,
    onchange,
  }: {
    checked?: boolean
    disabled?: boolean
    size?: Size
    variant?: Variant
    onLabel?: string
    offLabel?: string
    ariaLabel?: string
    onchange?: (checked: boolean) => void
  } = $props()

  function toggle() {
    if (disabled) return
    onchange?.(!checked)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }
</script>

{#if variant === 'switch'}
  <button
    class="toggle toggle--switch toggle--{size}"
    class:toggle--checked={checked}
    disabled={disabled}
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onclick={toggle}
    onkeydown={handleKeydown}
    type="button"
  >
    <span class="toggle__knob"></span>
  </button>
{:else}
  <div
    class="toggle toggle--chip-group"
    role="radiogroup"
    aria-label={ariaLabel}
  >
    <button
      class="toggle__chip"
      class:toggle__chip--active={!checked}
      class:toggle__chip--disabled={disabled}
      disabled={disabled}
      role="radio"
      aria-checked={!checked}
      aria-label={offLabel}
      onclick={() => onchange?.(false)}
      type="button"
    >
      {offLabel}
    </button>
    <button
      class="toggle__chip"
      class:toggle__chip--active={checked}
      class:toggle__chip--disabled={disabled}
      disabled={disabled}
      role="radio"
      aria-checked={checked}
      aria-label={onLabel}
      onclick={() => onchange?.(true)}
      type="button"
    >
      {onLabel}
    </button>
  </div>
{/if}

<style>
  /* Switch toggle */
  .toggle--switch {
    display: inline-block;
    position: relative;
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: background var(--transition-fast);
    flex-shrink: 0;
  }

  .toggle--switch:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink);
  }

  .toggle--switch:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .toggle--sm {
    width: 3.2rem;
    height: 1.8rem;
  }

  .toggle--md {
    width: 4.4rem;
    height: 2.4rem;
  }

  .toggle--switch {
    background: #D1D5DB;
  }

  .toggle--checked {
    background: var(--color-pink);
  }

  .toggle__knob {
    position: absolute;
    top: 50%;
    left: 0.2rem;
    transform: translateY(-50%);
    background: var(--color-white);
    border-radius: 50%;
    transition: left var(--transition-fast);
    box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.15);
  }

  .toggle--sm .toggle__knob {
    width: 1.4rem;
    height: 1.4rem;
  }

  .toggle--md .toggle__knob {
    width: 1.8rem;
    height: 1.8rem;
  }

  .toggle--sm.toggle--checked .toggle__knob {
    left: 1.6rem;
  }

  .toggle--md.toggle--checked .toggle__knob {
    left: 2.4rem;
  }

  /* Chip toggle */
  .toggle--chip-group {
    display: inline-flex;
    gap: 0.2rem;
  }

  .toggle__chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--radius-pill);
    font-family: var(--font-lato);
    font-weight: 600;
    cursor: pointer;
    background: #F3F4F6;
    color: var(--color-gray);
    padding: 0.5rem 0.9rem;
    font-size: 0.75rem;
    transition: background var(--transition-fast), color var(--transition-fast);
    line-height: 1;
  }

  .toggle__chip:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink);
  }

  .toggle__chip--active {
    background: var(--color-black);
    color: var(--color-white);
  }

  .toggle__chip--disabled {
    opacity: 0.35;
    pointer-events: none;
  }
</style>
