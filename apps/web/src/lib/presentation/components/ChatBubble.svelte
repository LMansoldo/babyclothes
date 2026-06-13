<script lang="ts">
  import type { AgentResponse } from '$lib/domain/chat/value-objects/AgentResponse'

  let {
    role,
    content,
  }: {
    role: 'user' | 'agent'
    content: AgentResponse
  } = $props()

  const isUser = $derived(role === 'user')
</script>

<div class="chat-bubble" class:chat-bubble--user={isUser} class:chat-bubble--agent={!isUser}>
  {#if content.type === 'text'}
    <p class="chat-bubble__text">{content.content}</p>
  {:else}
    <div class="chat-bubble__component">
      <!-- Dynamic component rendering handled by parent -->
      <span class="chat-bubble__component-label">Component: {content.component}</span>
    </div>
  {/if}
</div>

<style>
  .chat-bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .chat-bubble--user {
    align-self: flex-end;
    background: var(--color-pink);
    color: var(--color-white);
    border-bottom-right-radius: var(--radius-sm);
  }

  .chat-bubble--agent {
    align-self: flex-start;
    background: var(--color-white);
    color: var(--color-black);
    border-bottom-left-radius: var(--radius-sm);
    border: 1px solid var(--color-bg-2);
  }

  .chat-bubble__text {
    margin: 0;
  }

  .chat-bubble__component {
    font-style: italic;
    color: var(--color-gray);
  }

  .chat-bubble__component-label {
    font-size: 0.75rem;
  }
</style>
