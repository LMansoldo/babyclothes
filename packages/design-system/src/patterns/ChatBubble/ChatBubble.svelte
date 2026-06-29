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
</script>

<div
  class="chat-bubble"
  class:chat-bubble--user={role === 'user'}
  class:chat-bubble--agent={role === 'agent'}
  class:chat-bubble--system={role === 'system'}
>
  <p class="chat-bubble__text">{content}</p>
  {#if timestamp}
    <span class="chat-bubble__time">{timestamp}</span>
  {/if}
</div>

<style>
  .chat-bubble {
    padding: 0.75rem 1rem;
    font-family: var(--vd);
    font-size: 0.875rem;
    line-height: 1.55;
    position: relative;
    max-width: 80%;
  }

  /* Agent bubble — glass translúcido sobre fundo escuro */
  .chat-bubble--agent {
    align-self: flex-start;
    background: rgba(255, 255, 255, .12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, .15);
    border-radius: 1rem 1rem 1rem 0.25rem;
    color: #fff;
  }

  /* User bubble — branco */
  .chat-bubble--user {
    align-self: flex-end;
    background: #fff;
    color: #111;
    border-radius: 1rem 1rem 0.25rem 1rem;
    border: none;
  }

  /* System message — pill rosa translúcido */
  .chat-bubble--system {
    align-self: center;
    max-width: 90%;
    background: rgba(255, 232, 245, .12);
    border: 1px solid rgba(255, 60, 172, .3);
    border-radius: 99rem;
    color: #FF85CC;
    text-align: center;
  }

  .chat-bubble__text {
    margin: 0;
    white-space: pre-wrap;
  }

  .chat-bubble__time {
    display: block;
    font-size: 0.62rem;
    margin-top: 0.3rem;
    text-align: right;
  }

  .chat-bubble--agent .chat-bubble__time {
    color: rgba(255, 255, 255, .4);
  }

  .chat-bubble--user .chat-bubble__time {
    color: #9CA3AF;
  }
</style>
