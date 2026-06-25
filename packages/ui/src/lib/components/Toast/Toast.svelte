<script lang="ts">
  type ToastType = 'info' | 'success' | 'warning' | 'error' | 'pk'

  let {
    message,
    title,
    type = 'info',
    closable = true,
    onclose,
  }: {
    message: string
    title?: string
    type?: ToastType
    closable?: boolean
    onclose?: () => void
  } = $props()
</script>

<div class="toast toast--{type}" role="alert" aria-live="polite">
  <span class="toast__bar" aria-hidden="true"></span>

  <div class="toast__body">
    {#if title}
      <span class="toast__title">{title}</span>
    {/if}
    <span class="toast__message">{message}</span>
  </div>

  {#if closable}
    <button
      class="toast__close"
      type="button"
      onclick={onclose}
      aria-label="Fechar notificação"
    >
      ×
    </button>
  {/if}
</div>

<style>
  .toast {
    display: flex;
    align-items: stretch;
    background: var(--color-white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    min-width: 28rem;
    max-width: 40rem;
    border: 0.1rem solid rgba(0, 0, 0, .06);
  }

  .toast__bar {
    width: 0.3rem;
    flex-shrink: 0;
    align-self: stretch;
  }

  .toast--info    .toast__bar { background: var(--color-info); }
  .toast--success .toast__bar { background: var(--color-success); }
  .toast--warning .toast__bar { background: var(--color-warning); }
  .toast--error   .toast__bar { background: var(--color-error); }
  .toast--pk      .toast__bar { background: var(--color-pink); }

  .toast__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 1.2rem 1rem 1.2rem 1.4rem;
  }

  .toast__title {
    font-family: var(--font-ui);
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .05em;
    color: var(--color-black);
  }

  .toast__message {
    font-family: var(--font-body);
    font-size: .82rem;
    color: var(--color-black);
    line-height: 1.4;
  }

  .toast__close {
    align-self: flex-start;
    margin: 0.8rem 0.8rem 0 0;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, .06);
    color: var(--color-black);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-base);
    flex-shrink: 0;
  }

  .toast__close:hover {
    background: rgba(0, 0, 0, .12);
  }
</style>
