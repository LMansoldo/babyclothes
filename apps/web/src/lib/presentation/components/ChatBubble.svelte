<script lang="ts">
  let {
    role,
    content,
    timestamp,
  }: {
    role: 'user' | 'agent' | 'system'
    content: string
    timestamp?: string
  } = $props()

  const timeLabel = $derived(
    timestamp ?? ''
  )
</script>

<div class="chat-bubble" class:chat-bubble--user={role === 'user'} class:chat-bubble--agent={role === 'agent'} class:chat-bubble--system={role === 'system'}>
  <p class="chat-bubble__text">{content}</p>
  {#if timeLabel}
    <span class="chat-bubble__time">{timeLabel}</span>
  {/if}
</div>

<style>
  .chat-bubble {
    padding: 10px 14px;
    font-family: var(--vd);
    font-size: 1.3rem;
    line-height: 1.5;
    position: relative;
  }

  /* Agent bubble — glass */
  .chat-bubble--agent {
    align-self: flex-start;
    max-width: 80%;
    background: var(--glass);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-brd);
    border-radius: var(--r) var(--r) var(--r) var(--r-xs);
    color: var(--bk);
    box-shadow: var(--glass-shadow);
  }

  /* User bubble — dark */
  .chat-bubble--user {
    align-self: flex-end;
    max-width: 80%;
    background: rgba(10, 10, 10, 0.92);
    color: rgba(255, 255, 255, 0.88);
    border-radius: var(--r) var(--r) var(--r-xs) var(--r);
    border: none;
  }

  /* System message — pink-tinted glass */
  .chat-bubble--system {
    align-self: center;
    max-width: 90%;
    background: rgba(255, 60, 172, 0.08);
    border: 1px solid rgba(255, 60, 172, 0.2);
    border-radius: var(--r);
    color: var(--pk);
    font-size: 1.2rem;
    text-align: center;
  }

  .chat-bubble__text {
    margin: 0;
    white-space: pre-wrap;
  }

  .chat-bubble__time {
    display: block;
    font-size: 1rem;
    color: var(--gr);
    margin-top: 4px;
    text-align: right;
  }
</style>
