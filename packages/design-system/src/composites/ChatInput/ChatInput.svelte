<script lang="ts">
  let {
    placeholder = 'Digite sua mensagem...',
    loading = false,
    quickActions = [],
    onsend,
    onadd,
  }: {
    placeholder?: string
    loading?: boolean
    quickActions?: Array<{ label: string; value: string }>
    onsend?: (message: string) => void
    onadd?: () => void
  } = $props()

  let message = $state('')
  let textareaEl: HTMLTextAreaElement | undefined = $state()

  function autoResize() {
    if (!textareaEl) return
    textareaEl.style.height = 'auto'
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, 120) + 'px'
  }

  function handleSend() {
    const trimmed = message.trim()
    if (!trimmed || loading) return
    onsend?.(trimmed)
    message = ''
    if (textareaEl) {
      textareaEl.style.height = 'auto'
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleQuickAction(value: string) {
    onsend?.(value)
  }

  $effect(() => {
    message
    autoResize()
  })
</script>

<div class="chat-input">
  {#if quickActions.length > 0}
    <div class="chat-input__actions">
      {#each quickActions as action (action.value)}
        <button
          class="chat-input__chip"
          type="button"
          onclick={() => handleQuickAction(action.value)}
        >
          {action.label}
        </button>
      {/each}
    </div>
  {/if}

  <div class="chat-input__row">
    <button
      class="chat-input__add-btn"
      type="button"
      onclick={onadd}
      aria-label="Adicionar"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <textarea
      bind:this={textareaEl}
      bind:value={message}
      {placeholder}
      rows="1"
      class="chat-input__textarea"
      onkeydown={handleKeydown}
    ></textarea>

    {#if loading}
      <div class="chat-input__typing" aria-label="Digitando">
        <span class="chat-input__dot"></span>
        <span class="chat-input__dot"></span>
        <span class="chat-input__dot"></span>
      </div>
    {:else}
      <button
        class="chat-input__send"
        type="button"
        disabled={!message.trim()}
        onclick={handleSend}
        aria-label="Enviar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      </button>
    {/if}
  </div>
</div>

<style>
  .chat-input {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    background: var(--color-white);
    border: 0.15rem solid #EDE9E4;
    border-radius: 1rem;
    padding: 1rem 1.2rem;
  }

  /* ── Quick action chips ───────────────────────── */
  .chat-input__actions {
    display: flex;
    gap: 0.6rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 0.2rem;
  }

  .chat-input__actions::-webkit-scrollbar {
    display: none;
  }

  .chat-input__chip {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.7rem;
    border: 1.5px solid #FFD0ED;
    background: #FFE8F5;
    color: var(--pk);
    font-family: var(--font-lato);
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 99.9rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .chat-input__chip:hover {
    background: #FFD0ED;
    border-color: var(--pk);
  }

  /* ── Input row ────────────────────────────────── */
  .chat-input__row {
    display: flex;
    align-items: flex-end;
    gap: 0.8rem;
  }

  .chat-input__textarea {
    flex: 1;
    border: 1.5px solid #D1D5DB;
    border-radius: 1.25rem;
    outline: none;
    background: transparent;
    padding: 0.65rem 1rem;
    font-family: var(--font-lato);
    font-size: 0.875rem;
    color: var(--bk);
    resize: none;
    min-height: 2.75rem;
    max-height: 12rem;
    line-height: 1.4;
  }

  .chat-input__textarea::placeholder {
    color: var(--gr);
  }

  /* ── Add button ───────────────────────────────── */
  .chat-input__add-btn {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    border: none;
    background: #F3F4F6;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
    margin-bottom: 0.3rem;
  }

  .chat-input__add-btn:hover {
    background: #E5E7EB;
    color: var(--pk);
  }

  /* ── Send button ──────────────────────────────── */
  .chat-input__send {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    background: #111;
    color: var(--wh);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.15s;
    margin-bottom: 0.3rem;
  }

  .chat-input__send:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.2);
  }

  .chat-input__send:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ── Typing dots ──────────────────────────────── */
  .chat-input__typing {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 0.8rem;
    height: 3.6rem;
    flex-shrink: 0;
  }

  .chat-input__dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: var(--pk);
    animation: bc-bounce 0.6s ease infinite;
  }

  .chat-input__dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-input__dot:nth-child(3) { animation-delay: 0.4s; }
</style>
