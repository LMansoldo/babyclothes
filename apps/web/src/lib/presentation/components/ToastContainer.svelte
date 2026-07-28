<script lang="ts">
  import { Toast } from '@babyclothes/design-system'
  import { toast } from '$lib/stores/toast'

  const toasts = $derived.by(() => {
    let items: Array<{ id: string; type: 'info' | 'success' | 'warning' | 'error' | 'pk'; title?: string; message: string }> = []
    toast.subscribe((value) => { items = value })()
    return items
  })
</script>

<div class="toast-container" aria-live="polite">
  {#each toasts as t (t.id)}
    <div class="toast-container__item">
      <Toast
        type={t.type}
        title={t.title}
        message={t.message}
        onclose={() => toast.dismiss(t.id)}
      />
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 0.8rem;
    right: 0.8rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    pointer-events: none;
    max-width: min(36rem, calc(100vw - 2rem));
  }

  .toast-container__item {
    pointer-events: auto;
  }

  @media (max-width: 40rem) {
    .toast-container {
      left: 0.8rem;
      right: 0.8rem;
      max-width: none;
    }
  }
</style>
