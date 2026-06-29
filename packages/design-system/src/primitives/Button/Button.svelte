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
    gap: 0.5rem;
    border: none;
    border-radius: 0.5rem;
    font-family: var(--font-lato);
    font-weight: 700;
    cursor: pointer;
    transition: transform var(--transition-base), opacity var(--transition-base), box-shadow var(--transition-base);
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .btn:not(:disabled):hover {
    transform: translateY(-0.1rem);
  }

  /* Sizes */
  .btn--sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .btn--md {
    padding: 0.6rem 1.1rem;
    font-size: 0.875rem;
  }

  .btn--lg {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
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
    background: #F3F4F6;
    color: var(--color-black);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-black);
    border: 1.5px solid #111;
  }

  .btn--ghost-pk {
    background: transparent;
    color: var(--color-pink);
    border: 1.5px solid var(--color-pink);
  }

  /* Dark canvas variants */
  .btn--primary-inv {
    background: var(--color-white);
    color: var(--color-black);
  }

  .btn--ghost-inv {
    background: transparent;
    color: var(--color-white);
    border: 1.5px solid rgba(255, 255, 255, .4);
  }

  /* Spinner */
  .btn__spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid;
    border-radius: 50%;
    animation: bc-spin .6s linear infinite;
    flex-shrink: 0;
  }

  /* Spinner border colors per variant */
  .btn--primary .btn__spinner {
    border-color: rgba(255,255,255,.25);
    border-top-color: #fff;
  }

  .btn--pk .btn__spinner {
    border-color: rgba(255,255,255,.25);
    border-top-color: #fff;
  }

  .btn--secondary .btn__spinner {
    border-color: rgba(10,10,10,.2);
    border-top-color: #0A0A0A;
  }

  .btn--ghost .btn__spinner {
    border-color: rgba(10,10,10,.2);
    border-top-color: #0A0A0A;
  }

  .btn--ghost-pk .btn__spinner {
    border-color: rgba(255,60,172,.2);
    border-top-color: #FF3CAC;
  }

  .btn--primary-inv .btn__spinner {
    border-color: rgba(10,10,10,.2);
    border-top-color: #0A0A0A;
  }

  .btn--ghost-inv .btn__spinner {
    border-color: rgba(255,255,255,.2);
    border-top-color: #fff;
  }
</style>
