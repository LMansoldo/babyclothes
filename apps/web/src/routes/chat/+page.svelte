<script lang="ts">
  import { t } from '$lib/i18n'
  import { mockMessages, mockItems, mockChildren } from '$lib/mocks/data'
  import ChatBubble from '$lib/presentation/components/ChatBubble.svelte'
  import ChatHeader from '$lib/presentation/components/ChatHeader.svelte'
  import GrowthChart from '$lib/presentation/components/GrowthChart.svelte'
  import { Card, ChatInput } from '@babyclothes/ui'

  const activeChild = mockChildren[0]
  const chatState = $state<'idle' | 'streaming' | 'error'>('idle')
  const isTyping = $derived(chatState === 'streaming')

  const quickActions = [
    { label: 'Enviar item', value: 'Enviar item' },
    { label: 'Buscar por tamanho', value: 'Buscar por tamanho' },
    { label: 'Fazer oferta', value: 'Fazer oferta' },
    { label: 'Atualizar medicao', value: 'Atualizar medicao' },
    { label: 'Perguntar ao agente', value: 'Perguntar ao agente' },
  ]

  /* items for the carousel (tam. G) */
  const carouselItems = mockItems.filter((i) => i.clothingSize === 'G').slice(0, 4)

  /* items for the list (new, tam. G, under R$100) */
  const listItems = mockItems
    .filter((i) => i.condition === 'new' && i.clothingSize === 'G' && i.priceCents < 10000)
    .slice(0, 4)

  function conditionLabel(c: string) {
    if (c === 'new') return 'Novo'
    if (c === 'like_new') return 'Seminovo'
    return 'Usado'
  }

  function formatPrice(cents: number) {
    return `R$ ${(cents / 100).toFixed(0)}`
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  function handleSend(msg: string) {
    console.log('Send message:', msg)
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

    {#each mockMessages as message, idx (message.id)}
      {#if idx === 4}
        <!-- Carousel after agent describes items -->
        <div class="chat-page__row" style="max-width: 100%">
          <div class="chat-page__av">
            <div class="chat-page__av-dot"></div>
          </div>
          <div class="chat-page__bwrap">
            <span class="chat-page__chunk-tag">component:Carousel</span>
            <div class="chat-page__carousel">
              <div class="chat-page__carousel-label">pecas tam. G · disponiveis agora</div>
              <div class="chat-page__carousel-track">
                {#each carouselItems as item (item.id)}
                  <Card
                    image={item.photoUrls[0] ?? ''}
                    title={item.title}
                    detail={`Tam. ${item.clothingSize} · ${item.gender === 'female' ? 'menina' : item.gender === 'male' ? 'menino' : 'unissex'}`}
                    price={formatPrice(item.priceCents)}
                    oldPrice={item.priceCents > 8000 ? formatPrice(item.priceCents + 5100) : undefined}
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
      {/if}

      {#if idx === 7}
        <!-- ItemList after user asks for filtered results -->
        <div class="chat-page__row" style="max-width: 100%">
          <div class="chat-page__av">
            <div class="chat-page__av-dot"></div>
          </div>
          <div class="chat-page__bwrap">
            <span class="chat-page__chunk-tag">component:ItemList</span>
            <ChatBubble
              role="agent"
              content="Filtrei por Novo · G · ate R$100 — encontrei {listItems.length} pecas:"
            />
            <div class="chat-page__list">
              <div class="chat-page__list-label">itens novos · tam. G · ate R$100</div>
              {#each listItems as item (item.id)}
                <button class="chat-page__list-row" onclick={() => console.log('View item:', item.id)}>
                  <div class="chat-page__list-img"></div>
                  <div class="chat-page__list-info">
                    <span class="chat-page__list-name">{item.title}</span>
                    <span class="chat-page__list-detail">Novo · Tam. {item.clothingSize} · {item.category}</span>
                  </div>
                  <span class="chat-page__list-price">{formatPrice(item.priceCents)}</span>
                  <span class="chat-page__list-arrow">&rarr;</span>
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      {#if idx === 9}
        <!-- GrowthAlert before last agent message -->
        <div class="chat-page__row" style="max-width: 100%">
          <div class="chat-page__av">
            <div class="chat-page__av-dot"></div>
          </div>
          <div class="chat-page__bwrap">
            <span class="chat-page__chunk-tag">component:GrowthAlert</span>
            <GrowthChart
              variant="compact"
              childName="Sofia"
              currentSize="M"
              nextSize="G"
              daysUntil={38}
              progress={72}
              eyebrow="Previsao de crescimento"
              description="Com base nas ultimas medicoes, o agente calculou que Sofia passara do tamanho M para G em cerca de 5 semanas."
              sizes={[
                { label: 'RN', status: 'past' },
                { label: 'P', status: 'past' },
                { label: 'M', status: 'current' },
                { label: 'G', status: 'next' },
                { label: 'GG', status: 'future' },
                { label: '1', status: 'future' },
              ]}
              primaryAction={{ label: 'Ver pecas tam. G', onclick: () => console.log('View G items') }}
              secondaryAction={{ label: 'Lembrar depois', onclick: () => console.log('Remind later') }}
            />
          </div>
        </div>
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
      placeholder="Mensagem, proposta ou pergunta ao agente…"
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
    width: 3px;
  }

  .chat-page__messages::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
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
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: var(--r-xs);
    padding: 0.2rem 0.75rem;
    backdrop-filter: blur(10px);
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
    width: 26px;
    height: 26px;
    border-radius: var(--r-sm);
    flex-shrink: 0;
    background: var(--bk);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-page__av-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
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
    border: 1px solid var(--glass-brd);
    border-radius: var(--r) var(--r) var(--r) 2px;
    padding: 0.6rem 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.28rem;
    box-shadow: var(--glass-shadow);
  }

  .chat-page__typing-dot {
    width: 5px;
    height: 5px;
    background: rgba(0, 0, 0, 0.22);
    border-radius: 50%;
    animation: typing 0.9s ease-in-out infinite;
  }

  .chat-page__typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .chat-page__typing-dot:nth-child(3) { animation-delay: 0.3s; }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
  }

  /* ── Carousel ── */
  .chat-page__carousel {
    max-width: 580px;
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
    width: 14px;
    height: 1px;
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
    height: 3px;
  }

  .chat-page__carousel-track::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  /* ── Item list ── */
  .chat-page__list {
    max-width: 500px;
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
    width: 14px;
    height: 1px;
    background: var(--pk);
  }

  .chat-page__list-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: var(--glass);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-brd);
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
    transform: translateX(3px);
  }

  .chat-page__list-img {
    width: 44px;
    height: 44px;
    border-radius: var(--r-xs);
    flex-shrink: 0;
    background: rgba(226, 223, 217, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.5);
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
