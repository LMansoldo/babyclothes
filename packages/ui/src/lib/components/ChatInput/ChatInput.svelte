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
    gap: 0.8rem;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.1rem solid var(--glass-brd);
    border-radius: var(--r);
    padding: 1rem 1.2rem;
    box-shadow: var(--glass-shadow);
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
    padding: 0.5rem 1.2rem;
    border: 0.15rem solid rgba(255, 110, 199, 0.3);
    background: rgba(255, 214, 238, 0.3);
    color: var(--pk);
    font-family: var(--ld);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: 99.9rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .chat-input__chip:hover {
    background: rgba(255, 214, 238, 0.55);
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
    border: none;
    outline: none;
    background: transparent;
    border-radius: var(--r-sm);
    padding: 0.8rem 1.2rem;
    font-family: var(--ld);
    font-size: 0.85rem;
    color: var(--bk);
    resize: none;
    min-height: 3.6rem;
    max-height: 12rem;
    line-height: 1.4;
  }

  .chat-input__textarea::placeholder {
    color: var(--gr);
  }

  /* ── Add button ───────────────────────────────── */
  .chat-input__add-btn {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    border: 0.1rem solid var(--glass-brd);
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(1rem);
    -webkit-backdrop-filter: blur(1rem);
    color: var(--gr);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
    box-shadow: inset 0 0.1rem 0 rgba(255, 255, 255, 0.8);
  }

  .chat-input__add-btn:hover {
    border-color: var(--pk);
    color: var(--pk);
  }

  /* ── Send button ──────────────────────────────── */
  .chat-input__send {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    border: none;
    background: var(--pk);
    color: var(--wh);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .chat-input__send:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0.4rem 1.6rem rgba(255, 60, 172, 0.3);
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
    background: var(--gr);
    animation: chat-dot 1.2s ease-in-out infinite;
  }

  .chat-input__dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-input__dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes chat-dot {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  }
</style>
