<script lang="ts">
  import type { Snippet } from 'svelte'

  type Variant = 'default' | 'danger' | 'pk'

  let {
    open = $bindable(false),
    title,
    variant = 'default',
    onclose,
    children,
    footer,
  }: {
    open?: boolean
    title?: string
    variant?: Variant
    onclose?: () => void
    children?: Snippet
    footer?: Snippet
  } = $props()

  function handleClose() {
    open = false
    onclose?.()
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose()
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
  >
    <div class="modal modal--{variant}" role="dialog" aria-modal="true" aria-label={title}>
      <div class="modal__header">
        {#if variant === 'danger'}
          <span class="modal__icon modal__icon--danger" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </span>
        {:else if variant === 'pk'}
          <span class="modal__icon modal__icon--pk" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </span>
        {/if}

        {#if title}
          <h2 class="modal__title">{title}</h2>
        {/if}

        <button
          class="modal__close"
          type="button"
          onclick={handleClose}
          aria-label="Fechar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {#if children}
        <div class="modal__body">
          {@render children()}
        </div>
      {/if}

      {#if footer}
        <div class="modal__footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(0.4rem);
    -webkit-backdrop-filter: blur(0.4rem);
    padding: 1.6rem;
    animation: modal-fade-in 0.2s ease;
  }

  .modal {
    background: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 36rem;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-slide-up 0.25s ease;
  }

  /* ── Header ───────────────────────────────────── */
  .modal__header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1.6rem 1.6rem 1.2rem;
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.06);
  }

  .modal__icon {
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .modal__icon--danger {
    background: #FEE2E2;
    color: #DC2626;
  }

  .modal__icon--pk {
    background: var(--color-pink-soft);
    color: var(--color-pink);
  }

  .modal__title {
    flex: 1;
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-black);
    margin: 0;
    min-width: 0;
  }

  .modal__close {
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--transition-base);
  }

  .modal__close:hover {
    background: rgba(0, 0, 0, 0.12);
    color: var(--color-black);
  }

  /* ── Body ─────────────────────────────────────── */
  .modal__body {
    flex: 1;
    padding: 1.6rem;
    overflow-y: auto;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-black);
    line-height: 1.5;
  }

  /* ── Footer ───────────────────────────────────── */
  .modal__footer {
    display: flex;
    gap: 0.8rem;
    justify-content: flex-end;
    padding: 1.2rem 1.6rem;
    border-top: 0.1rem solid rgba(0, 0, 0, 0.06);
  }

  /* ── Animations ───────────────────────────────── */
  @keyframes modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modal-slide-up {
    from { opacity: 0; transform: translateY(1.6rem) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
