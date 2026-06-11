<script lang="ts">
  import type { Snippet } from 'svelte'

  type Variant = 'primary' | 'pk' | 'secondary' | 'ghost' | 'ghost-pk' | 'primary-inv' | 'ghost-inv'
  type Size = 'sm' | 'md' | 'lg'

  let {
    label,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    onclick,
    children,
  }: {
    label?: string
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    onclick?: (e: MouseEvent) => void
    children?: Snippet
  } = $props()

  function handleClick(e: MouseEvent) {
    if (disabled || loading) return
    onclick?.(e)
  }
</script>

<button
  {type}
  class="btn btn--{variant} btn--{size}"
  disabled={disabled || loading}
  onclick={handleClick}
>
  {#if loading}
    <span class="btn__spinner" aria-hidden="true"></span>
  {/if}
  {#if children}
    {@render children()}
  {:else}
    {label}
  {/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: var(--radius-pill);
    font-family: var(--font-ui);
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform var(--transition-base), opacity var(--transition-base), box-shadow var(--transition-base);
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .btn:not(:disabled):hover {
    transform: translateY(-1px);
  }

  /* Sizes */
  .btn--sm {
    padding: 6px 16px;
    font-size: .72rem;
  }

  .btn--md {
    padding: 10px 24px;
    font-size: .82rem;
  }

  .btn--lg {
    padding: 14px 32px;
    font-size: .9rem;
  }

  /* Variants */
  .btn--primary {
    background: var(--color-black);
    color: var(--color-white);
  }

  .btn--primary:not(:disabled):hover {
    box-shadow: var(--shadow-md);
  }

  .btn--pk {
    background: var(--color-pink);
    color: var(--color-white);
  }

  .btn--pk:not(:disabled):hover {
    box-shadow: var(--shadow-pk);
  }

  .btn--secondary {
    background: var(--color-white);
    color: var(--color-black);
    border: 1.5px solid var(--color-black);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-black);
    border: 1.5px solid rgba(10, 10, 10, .2);
  }

  .btn--ghost-pk {
    background: transparent;
    color: var(--color-pink);
    border: 1.5px solid var(--color-pink-light);
  }

  /* Dark canvas variants */
  .btn--primary-inv {
    background: var(--color-white);
    color: var(--color-black);
  }

  .btn--ghost-inv {
    background: transparent;
    color: var(--color-white);
    border: 1.5px solid rgba(255, 255, 255, .35);
  }

  /* Spinner */
  .btn__spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: btn-spin .6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes btn-spin {
    to { transform: rotate(360deg); }
  }
</style>
