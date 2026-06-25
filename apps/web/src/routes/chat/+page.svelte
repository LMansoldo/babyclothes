<script lang="ts">
  import { onMount } from 'svelte'
  import { t, get } from '$lib/i18n'
  import { HttpChildRepository } from '$lib/infrastructure/http/HttpChildRepository'
  import { HttpCatalogRepository } from '$lib/infrastructure/http/HttpCatalogRepository'
  import { SseChatRepository } from '$lib/infrastructure/sse/SseChatRepository'
  import { getUserId } from '$lib/infrastructure/http/HttpAuthRepository'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { mockChildren, mockGrowthRecords, mockItems, mockMessages } from '$lib/mocks/data'
  import type { Child } from '$lib/domain/child/entities/Child'
  import type { Item } from '$lib/domain/item/entities/Item'
  import type { Message } from '$lib/domain/chat/entities/Message'
  import type { AgentResponse } from '$lib/domain/chat/value-objects/AgentResponse'
  import ChatBubble from '$lib/presentation/components/ChatBubble.svelte'
  import ChatHeader from '$lib/presentation/components/ChatHeader.svelte'
  import GrowthChart from '$lib/presentation/components/GrowthChart.svelte'
  import { Card, ChatInput } from '@babyclothes/ui'

  const childRepo = new HttpChildRepository()
  const catalogRepo = new HttpCatalogRepository()
  const chatRepo = new SseChatRepository()

  const mockMode = PUBLIC_MOCK_DATA === 'true'

  let children = $state<Child[]>([])
  let items = $state<Item[]>([])
  let messages = $state<Message[]>([])
  let chatState = $state<'idle' | 'streaming' | 'error'>('idle')
  let loading = $state(true)

  const activeChild = $derived(children[0])
  const isTyping = $derived(chatState === 'streaming')

  const carouselItems = $derived(items.filter((item) => item.clothingSize === 'G').slice(0, 4))

  const listItems = $derived(
    items
      .filter((item) => item.condition === 'new' && item.clothingSize === 'G' && item.priceCents < 10000)
      .slice(0, 4)
  )

  onMount(async () => {
    try {
      if (mockMode) {
        children = mockChildren.map((c) => ({ ...c, birthDate: new Date(c.birthDate) }))
        items = [...mockItems]
        messages = [...mockMessages]
      } else {
        const [loadedChildren, loadedItems] = await Promise.all([
          childRepo.findAll(),
          catalogRepo.fetch({}),
        ])
        children = loadedChildren
        items = loadedItems
      }
    } catch (e) {
      console.error('Failed to load chat data:', e)
    } finally {
      loading = false
    }
  })

  const quickActions = $derived([
    { label: $t('chat.quick_send_item'), value: $t('chat.quick_send_item') },
    { label: $t('chat.quick_search_size'), value: $t('chat.quick_search_size') },
    { label: $t('chat.quick_make_offer'), value: $t('chat.quick_make_offer') },
    { label: $t('chat.quick_update_measurement'), value: $t('chat.quick_update_measurement') },
    { label: $t('chat.quick_ask_agent'), value: $t('chat.quick_ask_agent') },
  ])

  function conditionLabel(c: string) {
    const translate = get(t)
    if (c === 'new') return translate('item_card.condition_new')
    if (c === 'like_new') return translate('item_card.condition_like_new')
    return translate('item_card.condition_used')
  }

  function formatPrice(cents: number) {
    return `R$ ${(cents / 100).toFixed(0)}`
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  async function handleSend(msg: string) {
    const userId = getUserId()
    if (!userId || !activeChild) return

    // Add user message to UI
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: { type: 'text', content: msg },
      createdAt: new Date(),
    }
    messages = [...messages, userMsg]

    if (mockMode) {
      setTimeout(() => {
        const agentMsg: Message = {
          id: `msg-${Date.now()}-agent`,
          role: 'agent',
          content: { type: 'text', content: 'Simulated response for: ' + msg },
          createdAt: new Date(),
        }
        messages = [...messages, agentMsg]
      }, 1000)
      return
    }

    // Stream agent response
    chatState = 'streaming'
    let agentContent = ''
    const agentMsgId = `msg-${Date.now()}-agent`
    const agentMsg: Message = {
      id: agentMsgId,
      role: 'agent',
      content: { type: 'text', content: '' },
      createdAt: new Date(),
    }
    messages = [...messages, agentMsg]

    try {
      for await (const chunk of chatRepo.sendMessage(userId, activeChild.id, msg)) {
        if (chunk.type === 'text') {
          agentContent += chunk.content
          messages = messages.map((m) =>
            m.id === agentMsgId
              ? { ...m, content: { type: 'text' as const, content: agentContent } }
              : m
          )
        }
        // TODO: handle 'component' type chunks from agent
      }
      chatState = 'idle'
    } catch (e) {
      chatState = 'error'
      console.error('Chat stream error:', e)
    }
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
    title="Agente BabyClothes"
    subtitle="assistente de descoberta e crescimento"
    childContext={activeChild ? `${activeChild.name} · M` : undefined}
    onMore={handleMore}
  />

  <div class="chat-page__messages">
    <!-- Date divider -->
    <div class="chat-page__date-div">hoje · 17 jun 2026</div>

    {#each messages as message (message.id)}
      <!-- Dynamic components rendered inline when agent sends them -->
      {#if message.components}
        {#each message.components as component}
          {#if component.type === 'carousel'}
            <div class="chat-page__row" style="max-width: 100%">
              <div class="chat-page__av">
                <div class="chat-page__av-dot"></div>
              </div>
              <div class="chat-page__bwrap">
                <span class="chat-page__chunk-tag">component:Carousel</span>
                <div class="chat-page__carousel">
                  <div class="chat-page__carousel-label">{component.label ?? 'pecas disponiveis'}</div>
                  <div class="chat-page__carousel-track">
                    {#each component.items as item (item.id)}
                      <Card
                        image={item.photoUrls[0] ?? ''}
                        title={item.title}
                        detail={`Tam. ${item.clothingSize} · ${item.gender === 'female' ? $t('item_card.gender_girl') : item.gender === 'male' ? $t('item_card.gender_boy') : $t('item_card.gender_unisex')}`}
                        price={formatPrice(item.priceCents)}
                        condition={conditionLabel(item.condition)}
                        pinkPrice={true}
                        size="md"
                        onAdd={() => console.log('View item:', item.id)}
                      />
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {:else if component.type === 'itemList'}
            <div class="chat-page__row" style="max-width: 100%">
              <div class="chat-page__av">
                <div class="chat-page__av-dot"></div>
              </div>
              <div class="chat-page__bwrap">
                <span class="chat-page__chunk-tag">component:ItemList</span>
                <ChatBubble
                  role="agent"
                  content={component.label ?? $t('chat.filter_result', { count: component.items.length })}
                />
                <div class="chat-page__list">
                  <div class="chat-page__list-label">{$t('chat.items_new_label')}</div>
                  {#each component.items as item (item.id)}
                    <button class="chat-page__list-row" onclick={() => console.log('View item:', item.id)}>
                      <div class="chat-page__list-img"></div>
                      <div class="chat-page__list-info">
                        <span class="chat-page__list-name">{item.title}</span>
                        <span class="chat-page__list-detail">{$t('item_card.condition_new')} · Tam. {item.clothingSize} · {item.category}</span>
                      </div>
                      <span class="chat-page__list-price">{formatPrice(item.priceCents)}</span>
                      <span class="chat-page__list-arrow">&rarr;</span>
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {:else if component.type === 'growthAlert'}
            <div class="chat-page__row" style="max-width: 100%">
              <div class="chat-page__av">
                <div class="chat-page__av-dot"></div>
              </div>
              <div class="chat-page__bwrap">
                <span class="chat-page__chunk-tag">component:GrowthAlert</span>
                <GrowthChart
                  variant="compact"
                  childName={component.childName ?? activeChild?.name ?? ''}
                  currentSize={component.currentSize}
                  nextSize={component.nextSize}
                  daysUntil={component.daysUntil}
                  progress={component.progress}
                  eyebrow={component.eyebrow ?? 'Previsao de crescimento'}
                  description={component.description ?? ''}
                  sizes={component.sizes ?? []}
                  primaryAction={component.primaryAction}
                  secondaryAction={component.secondaryAction}
                />
              </div>
            </div>
          {/if}
        {/each}
      {/if}

      <!-- Normal bubble -->
      {#if message.role === 'agent'}
        <div class="chat-page__row">
          <div class="chat-page__av">
            <div class="chat-page__av-dot"></div>
          </div>
          <div class="chat-page__bwrap">
            <ChatBubble
              role="agent"
              content={message.content.type === 'text' ? message.content.content : ''}
              timestamp={formatTime(message.createdAt)}
            />
          </div>
        </div>
      {:else if message.role === 'user'}
        <div class="chat-page__row chat-page__row--me">
          <div class="chat-page__bwrap">
            <ChatBubble
              role="user"
              content={message.content.type === 'text' ? message.content.content : ''}
              timestamp={formatTime(message.createdAt)}
            />
          </div>
        </div>
      {:else}
        <ChatBubble
          role="system"
          content={message.content.type === 'text' ? message.content.content : ''}
        />
      {/if}
    {/each}

    <!-- Typing indicator -->
    {#if isTyping}
      <div class="chat-page__row">
        <div class="chat-page__av">
          <div class="chat-page__av-dot"></div>
        </div>
        <div class="chat-page__typing">
          <span class="chat-page__typing-dot"></span>
          <span class="chat-page__typing-dot"></span>
          <span class="chat-page__typing-dot"></span>
        </div>
      </div>
    {/if}
  </div>

  <div class="chat-page__input">
    <ChatInput
      placeholder={$t('chat.placeholder')}
      loading={isTyping}
      {quickActions}
      onsend={handleSend}
    />
  </div>
</div>

<style>
  .chat-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* ── Messages ── */
  .chat-page__messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.75rem 5vw;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
  }

  .chat-page__messages::-webkit-scrollbar {
    width: 0.3rem;
  }

  .chat-page__messages::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.2rem;
  }

  /* ── Date divider ── */
  .chat-page__date-div {
    display: flex;
    align-items: center;
    align-self: center;
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.25);
    background: rgba(255, 255, 255, 0.45);
    border: 0.1rem solid rgba(255, 255, 255, 0.7);
    border-radius: var(--r-xs);
    padding: 0.2rem 0.75rem;
    backdrop-filter: blur(1rem);
  }

  /* ── Row (bubble + avatar) ── */
  .chat-page__row {
    display: flex;
    gap: 0.6rem;
    align-items: flex-end;
    max-width: 68%;
  }

  .chat-page__row--me {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  /* ── Avatar ── */
  .chat-page__av {
    width: 2.6rem;
    height: 2.6rem;
    border-radius: var(--r-sm);
    flex-shrink: 0;
    background: var(--bk);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-page__av-dot {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 0.2rem;
    background: var(--pk);
  }

  .chat-page__bwrap {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  /* ── Chunk tag ── */
  .chat-page__chunk-tag {
    font-family: var(--ld);
    font-size: 0.56rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--pk2);
  }

  /* ── Typing indicator ── */
  .chat-page__typing {
    background: var(--glass);
    backdrop-filter: var(--glass-blur);
    border: 0.1rem solid var(--glass-brd);
    border-radius: var(--r) var(--r) var(--r) 0.2rem;
    padding: 0.6rem 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.28rem;
    box-shadow: var(--glass-shadow);
  }

  .chat-page__typing-dot {
    width: 0.5rem;
    height: 0.5rem;
    background: rgba(0, 0, 0, 0.22);
    border-radius: 50%;
    animation: typing 0.9s ease-in-out infinite;
  }

  .chat-page__typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .chat-page__typing-dot:nth-child(3) { animation-delay: 0.3s; }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-0.5rem); }
  }

  /* ── Carousel ── */
  .chat-page__carousel {
    max-width: 58rem;
  }

  .chat-page__carousel-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pk);
  }

  .chat-page__carousel-label::before {
    content: '';
    width: 1.4rem;
    height: 0.1rem;
    background: var(--pk);
  }

  .chat-page__carousel-track {
    display: flex;
    gap: 0.65rem;
    overflow-x: auto;
    padding: 0.15rem 0 0.6rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
  }

  .chat-page__carousel-track::-webkit-scrollbar {
    height: 0.3rem;
  }

  .chat-page__carousel-track::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.2rem;
  }

  /* ── Item list ── */
  .chat-page__list {
    max-width: 50rem;
  }

  .chat-page__list-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pk);
  }

  .chat-page__list-label::before {
    content: '';
    width: 1.4rem;
    height: 0.1rem;
    background: var(--pk);
  }

  .chat-page__list-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: var(--glass);
    backdrop-filter: var(--glass-blur);
    border: 0.1rem solid var(--glass-brd);
    border-radius: var(--r-sm);
    padding: 0.6rem 0.85rem;
    margin-bottom: 0.4rem;
    cursor: pointer;
    box-shadow: var(--glass-shadow);
    transition: border-color 0.15s, transform 0.15s;
    width: 100%;
    text-align: left;
    font: inherit;
    color: inherit;
  }

  .chat-page__list-row:hover {
    border-color: rgba(255, 110, 199, 0.5);
    transform: translateX(0.3rem);
  }

  .chat-page__list-img {
    width: 4.4rem;
    height: 4.4rem;
    border-radius: var(--r-xs);
    flex-shrink: 0;
    background: rgba(226, 223, 217, 0.6);
    border: 0.1rem solid rgba(255, 255, 255, 0.5);
  }

  .chat-page__list-info {
    flex: 1;
    min-width: 0;
  }

  .chat-page__list-name {
    display: block;
    font-family: var(--ld);
    font-size: 0.78rem;
    font-weight: 900;
    color: var(--bk);
    margin-bottom: 0.08rem;
  }

  .chat-page__list-detail {
    display: block;
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.7rem;
    color: var(--gr);
  }

  .chat-page__list-price {
    font-family: var(--ld);
    font-size: 0.95rem;
    font-weight: 900;
    color: var(--pk);
    flex-shrink: 0;
  }

  .chat-page__list-arrow {
    font-family: var(--ld);
    font-size: 0.7rem;
    color: var(--pk);
    flex-shrink: 0;
    margin-left: 0.2rem;
  }

  /* ── Input dock ── */
  .chat-page__input {
    flex-shrink: 0;
    padding: 0.9rem 5vw 1.1rem;
  }
</style>
