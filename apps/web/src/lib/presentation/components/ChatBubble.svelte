<script lang="ts">
  let {
    role,
    content,
    timestamp,
  }: {
    role: 'user' | 'agent'
    content: string
    timestamp?: Date
  } = $props()

  const isUser = $derived(role === 'user')

  const timeLabel = $derived(
    timestamp
      ? timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : ''
  )
</script>

<div class="chat-bubble" class:chat-bubble--user={isUser} class:chat-bubble--agent={!isUser}>
  <p class="chat-bubble__text">{content}</p>
  {#if timeLabel}
    <span class="chat-bubble__time">{timeLabel}</span>
  {/if}
</div>

<style>
  .chat-bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 16px;
    font-family: var(--vd);
    font-size: 0.82rem;
    line-height: 1.55;
    position: relative;
  }

  .chat-bubble--user {
    align-self: flex-end;
    background: var(--pk);
    color: var(--wh);
    border-bottom-right-radius: 4px;
  }

  .chat-bubble--agent {
    align-self: flex-start;
    background: var(--wh);
    color: var(--bk);
    border-bottom-left-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .chat-bubble__text {
    margin: 0;
    white-space: pre-wrap;
  }

  .chat-bubble__time {
    display: block;
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.58rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.3rem;
    text-align: right;
  }

  .chat-bubble--agent .chat-bubble__time {
    color: rgba(0, 0, 0, 0.3);
  }
</style>
