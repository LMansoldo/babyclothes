<script lang="ts">
  import { t } from '$lib/i18n'
  import { mockMessages, mockChildren } from '$lib/mocks/data'
  import ChatBubble from '$lib/presentation/components/ChatBubble.svelte'
  import ChatHeader from '$lib/presentation/components/ChatHeader.svelte'
  import ChildSelector from '$lib/presentation/components/ChildSelector.svelte'

  let activeChildId = $state(mockChildren[0]?.id ?? '')
  let chatState = $state<'idle' | 'streaming' | 'error'>('idle')
  let inputValue = $state('')

  const activeChild = $derived(mockChildren.find((c) => c.id === activeChildId))

  function handleSend() {
    if (!inputValue.trim()) return
    console.log('Send message:', inputValue)
    inputValue = ''
  }

  function handleRetry() {
    chatState = 'idle'
    console.log('Retry connection')
  }

  function handleMore() {
    console.log('More options')
  }
</script>

<svelte:head>
  <title>{$t('chat.title')} | BabyClothes</title>
</svelte:head>

<div class="chat-page">
  <ChatHeader
    variant="agent"
    name={$t('chat.title')}
    subtitle={$t('chat_header.seller_online_verified')}
    {chatState}
    avatarGradient="linear-gradient(135deg, var(--pk), #7b2ff7)"
    childContext={activeChild?.name}
    onRetry={handleRetry}
    onMore={handleMore}
  />

  <div class="chat-page__messages">
    {#each mockMessages as message (message.id)}
      <ChatBubble
        role={message.role}
        content={message.content.type === 'text' ? message.content.content : ''}
        timestamp={message.createdAt}
      />
    {/each}
  </div>

  <div class="chat-page__input">
    <div class="chat-page__input-wrapper">
      <input
        type="text"
        class="chat-page__input-field"
        placeholder={$t('chat.placeholder')}
        bind:value={inputValue}
        onkeydown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button class="chat-page__send-btn" onclick={handleSend}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  .chat-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 800px;
    margin: 0 auto;
    background: var(--wh);
  }

  .chat-page__messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .chat-page__input {
    padding: 0.75rem 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.07);
    background: var(--wh);
  }

  .chat-page__input-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .chat-page__input-field {
    flex: 1;
    background: var(--of2);
    border: 1.5px solid rgba(0, 0, 0, 0.09);
    border-radius: 100px;
    padding: 0.6rem 1rem;
    font-family: var(--vd);
    font-size: 0.85rem;
    color: var(--bk);
    outline: none;
    transition: border-color 0.2s;
  }

  .chat-page__input-field:focus {
    border-color: var(--pk);
    background: var(--wh);
  }

  .chat-page__input-field::placeholder {
    color: rgba(0, 0, 0, 0.25);
  }

  .chat-page__send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--pk);
    color: var(--wh);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  .chat-page__send-btn:hover {
    opacity: 0.9;
  }
</style>
