<script lang="ts">
  let {
    role,
    content,
    timestamp,
    surface = 'dark',
  }: {
    role: 'user' | 'agent' | 'system'
    content: string
    timestamp?: string
    surface?: 'light' | 'dark'
  } = $props()
</script>

<div
  class="chat-bubble"
  class:chat-bubble--user={role === 'user'}
  class:chat-bubble--agent={role === 'agent'}
  class:chat-bubble--system={role === 'system'}
  class:chat-bubble--light={surface === 'light'}
  class:chat-bubble--dark={surface === 'dark'}
>
  <p class="chat-bubble__text">{content}</p>
  {#if timestamp}
    <span class="chat-bubble__time">{timestamp}</span>
  {/if}
</div>

<style>
  .chat-bubble {
    padding: 0.75rem 1rem;
    font-family: var(--font-lato);
    font-size: 0.78rem;
    line-height: 1.5;
    position: relative;
    max-width: 80%;
  }

  /* ========== DARK SURFACE (default — /chat) ========== */

  .chat-bubble--dark.chat-bubble--agent {
    align-self: flex-start;
    background: rgba(255, 255, 255, .12);
    backdrop-filter: blur(0.6rem);
    -webkit-backdrop-filter: blur(0.6rem);
    border: 1px solid rgba(255, 255, 255, .15);
    border-radius: 1rem 1rem 1rem 0.25rem;
    color: #fff;
  }

  .chat-bubble--dark.chat-bubble--user {
    align-self: flex-end;
    background: #fff;
    color: #111;
    border-radius: 1rem 1rem 0.25rem 1rem;
    border: none;
  }

  .chat-bubble--dark.chat-bubble--system {
    align-self: center;
    max-width: 90%;
    background: rgba(255, 232, 245, .12);
    border: 1px solid rgba(255, 60, 172, .3);
    border-radius: 99rem;
    color: #FF85CC;
    text-align: center;
  }

  .chat-bubble--dark .chat-bubble__time {
    color: rgba(255, 255, 255, .4);
  }

  .chat-bubble--dark.chat-bubble--user .chat-bubble__time {
    color: #9CA3AF;
  }

  /* ========== LIGHT SURFACE (/agent mock 04/05/07) ========== */

  .chat-bubble--light.chat-bubble--agent {
    align-self: flex-start;
    background: #fff;
    color: #111;
    border-radius: 0.75rem 0.75rem 0.75rem 0.2rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .06);
    border: none;
    max-width: 80%;
  }

  .chat-bubble--light.chat-bubble--user {
    align-self: flex-end;
    background: #111;
    color: #fff;
    border-radius: 0.75rem 0.75rem 0.2rem 0.75rem;
    border: none;
    max-width: 75%;
  }

  .chat-bubble--light.chat-bubble--system {
    align-self: center;
    max-width: 90%;
    background: #FFE8F5;
    color: #FF3CAC;
    border: none;
    border-radius: 99rem;
    padding: 0.4rem 1.2rem;
    font-size: 0.65rem;
    font-weight: 600;
    text-align: center;
  }

  .chat-bubble--light .chat-bubble__time {
    font-size: 0.6rem;
    color: #9CA3AF;
  }

  .chat-bubble--light.chat-bubble--user .chat-bubble__time {
    color: rgba(255, 255, 255, .6);
  }

  /* ========== SHARED ========== */

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
</style>
