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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
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
    gap: 8px;
    background: rgba(244, 243, 240, 0.82);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: var(--radius-lg);
    padding: 10px 12px;
  }

  /* ── Quick action chips ───────────────────────── */
  .chat-input__actions {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 2px;
  }

  .chat-input__actions::-webkit-scrollbar {
    display: none;
  }

  .chat-input__chip {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border: 1.5px solid var(--color-pink-light);
    background: var(--color-pink-soft);
    color: var(--color-pink);
    font-family: var(--font-ui);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: var(--radius-pill);
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--transition-base);
    flex-shrink: 0;
  }

  .chat-input__chip:hover {
    background: var(--color-pink-light);
  }

  /* ── Input row ────────────────────────────────── */
  .chat-input__row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  .chat-input__textarea {
    flex: 1;
    border: none;
    outline: none;
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 8px 12px;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-black);
    resize: none;
    min-height: 36px;
    max-height: 120px;
    line-height: 1.4;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .chat-input__textarea::placeholder {
    color: var(--color-gray-2);
  }

  .chat-input__textarea:focus {
    border-color: var(--color-pink);
    box-shadow: 0 0 0 2px rgba(255, 60, 172, 0.1);
  }

  /* ── Add button ───────────────────────────────── */
  .chat-input__add-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1.5px solid rgba(0, 0, 0, 0.12);
    background: var(--color-white);
    color: var(--color-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color var(--transition-base), color var(--transition-base);
  }

  .chat-input__add-btn:hover {
    border-color: var(--color-pink);
    color: var(--color-pink);
  }

  /* ── Send button ──────────────────────────────── */
  .chat-input__send {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: var(--color-pink);
    color: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }

  .chat-input__send:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: var(--shadow-pk);
  }

  .chat-input__send:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ── Typing dots ──────────────────────────────── */
  .chat-input__typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    height: 36px;
    flex-shrink: 0;
  }

  .chat-input__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-gray);
    animation: chat-dot 1.2s ease-in-out infinite;
  }

  .chat-input__dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-input__dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes chat-dot {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  }
</style>
