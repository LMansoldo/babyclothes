<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { t, get } from '$lib/i18n';
  import { HttpChildRepository } from '$lib/infrastructure/http/HttpChildRepository';
  import { SseChatRepository } from '$lib/infrastructure/sse/SseChatRepository';
  import { RegisterChild } from '$lib/application/child/RegisterChild';
  import { AddMeasurement } from '$lib/application/child/AddMeasurement';
  import { mapChildFormToCreateChildInput } from '$lib/application/child/mapChildFormToCreateChildInput';
  import { buildInitialMeasurementInput } from '$lib/application/child/buildInitialMeasurementInput';
  import type { Child } from '$lib/domain/child/entities/Child';
  import type { Message, ComponentPayload } from '$lib/domain/chat/entities/Message';
  import type { CreateChildInput } from '$lib/domain/child/schemas';
  import {
    ChatInput,
    ChatBubble,
    ChoiceChipGroup,
    AgentFormCard,
    MonthPicker,
    ChildInlineForm,
    Card,
  } from '@babyclothes/design-system';
  import { X } from 'lucide-svelte';
  import { mapAgentItem, type AgentItem } from '$lib/application/chat/mapAgentItem';
  import { loadItemDetail, type ItemDetail } from '$lib/infrastructure/http/loadItemDetail';
  import ItemDetailView from '$lib/presentation/components/ItemDetailView.svelte';
  import {
    reduceIntake,
    initialIntakeState,
    type IntakeState,
    type IntakeEvent,
    type HasChildrenAnswer,
  } from '$lib/application/chat/IntakeMachine';
  import { toast } from '$lib/stores/toast';

  const childRepo = new HttpChildRepository();
  const chatRepo = new SseChatRepository();
  const registerChild = new RegisterChild(childRepo);
  const addMeasurement = new AddMeasurement(childRepo);

  const session = $derived($page.data.session);

  let children = $state<Child[]>([]);
  let messages = $state<Message[]>([]);
  let chatState = $state<'idle' | 'streaming' | 'error'>('idle');
  let loading = $state(true);
  let searchQuery = $state('');
  let childFormSubmitting = $state(false);
  let itemSheetOpen = $state(false);
  let itemSheetDetail = $state<ItemDetail | null>(null);
  let itemSheetLoading = $state(false);

  function formatPrice(cents: number): string {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  }

  function closeItemSheet() {
    itemSheetOpen = false;
    itemSheetDetail = null;
  }

  async function openItemSheet(id: string) {
    itemSheetOpen = true;
    itemSheetLoading = true;
    itemSheetDetail = null;
    try {
      itemSheetDetail = await loadItemDetail(id);
    } catch (e) {
      console.error('Failed to load item detail:', e);
      toast.error(get(t)('agent.results.load_error'));
      itemSheetOpen = false;
    } finally {
      itemSheetLoading = false;
    }
  }

  // Default to the start of the intake for new users. initAgent (below) overrides
  // this to the search step when the user already has children (existing users skip
  // the registration forms). The step is intentionally NOT persisted in sessionStorage
  // — persisting it previously made the agent resume mid-flow (or land in free_chat
  // with no questions) on reload/return-to-tab, the intermittent wrong start.
  let intake = $state<IntakeState>(initialIntakeState);

  const isTyping = $derived(chatState === 'streaming');

  let messagesEl = $state<HTMLDivElement>()

  $effect(() => {
    // reexecuta quando chega mensagem nova ou o "digitando" muda
    messages.length
    isTyping
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight
    }
  })

  const todayPrefix = get(t)('agent.system.today')

  function isSystemMessage(message: Message): boolean {
    if (message.role !== 'agent' || message.components) return false
    if (message.content.type !== 'text') return false
    return message.content.content.startsWith(todayPrefix)
  }

  function dispatch(event: IntakeEvent): void {
    intake = reduceIntake(intake, event);
    buildIntakeMessages();
  }

  function agentMsg(content: string, components?: ComponentPayload[]): Message {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'agent',
      content: { type: 'text', content },
      components,
      createdAt: new Date(),
    };
  }

  function userMsg(content: string): Message {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: { type: 'text', content },
      createdAt: new Date(),
    };
  }

  function buildIntakeMessages(): void {
    const translate = get(t);
    const userName = session?.name?.split(' ')[0] ?? '';
    const newMessages: Message[] = [];

    // System date pill at the top
    const now = new Date();
    const time = formatTime(now);
    newMessages.push(
      agentMsg(`${translate('agent.system.today')} · ${time}`),
    );

    switch (intake.step) {
      case 'ask_has_children':
        newMessages.push(
          agentMsg(translate('agent.intake.greeting', { name: userName })),
          agentMsg(translate('agent.intake.has_children'), [
            {
              type: 'choiceChips',
              options: [
                { value: 'yes', label: translate('agent.intake.yes'), primary: true },
                { value: 'no', label: translate('agent.intake.no') },
                { value: 'expecting', label: translate('agent.intake.expecting') },
              ],
              onSelect: (value: string) => {
                dispatch({ type: 'ANSWER_HAS_CHILDREN', answer: value as HasChildrenAnswer });
              },
            },
          ]),
        );
        break;

      case 'ask_children_count':
        newMessages.push(
          agentMsg(translate('agent.intake.how_many'), [
            {
              type: 'choiceChips',
              options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: translate('agent.intake.count_3plus') },
              ],
              onSelect: (value: string) => {
                dispatch({ type: 'ANSWER_COUNT', count: parseInt(value, 10) });
              },
            },
          ]),
        );
        break;

      case 'fill_child_form':
        newMessages.push(
          agentMsg(translate('agent.intake.child_form_intro'), [
            {
              type: 'childForm',
              title: translate('agent.intake.child_form_title'),
              initial: intake.children.length > 0 ? intake.children[intake.children.length - 1] : undefined,
              onSubmit: async (input: CreateChildInput) => {
                const userId = session?.userId;
                if (!userId) {
                  toast.error(translate('agent.form.save_error'));
                  return;
                }
                childFormSubmitting = true;
                try {
                  const created = await registerChild.execute(input);
                  children = [...children, created];

                  const measurement = buildInitialMeasurementInput(input);
                  if (measurement) {
                    try {
                      await addMeasurement.execute(created.id, measurement);
                    } catch (measurementError) {
                      console.error('Failed to save initial measurement:', measurementError);
                    }
                  }

                  dispatch({ type: 'CHILD_SUBMITTED', child: input });
                } catch (e) {
                  console.error('Failed to register child:', e);
                  toast.error(translate('agent.form.save_error'));
                } finally {
                  childFormSubmitting = false;
                }
              },
            },
          ]),
        );
        break;

      case 'ask_due_date': {
        const months: { value: string; label: string }[] = [];
        for (let i = 0; i < 12; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
          const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          months.push({ value, label });
        }
        newMessages.push(
          agentMsg(translate('agent.intake.due_date_intro'), [
            {
              type: 'dueDate',
              title: translate('agent.intake.due_date_title'),
              months,
              onConfirm: (month: string) => {
                dispatch({ type: 'DUE_DATE_CONFIRMED', month });
              },
            },
          ]),
        );
        break;
      }

      case 'explain_platform':
        newMessages.push(agentMsg(translate('agent.intake.explain')));
        setTimeout(() => dispatch({ type: 'EXPLANATION_DONE' }), 0);
        break;

      case 'ask_search_intent':
        newMessages.push(
          agentMsg(translate('agent.intake.search_intent'), [
            {
              type: 'suggestions',
              heading: translate('agent.intake.suggestions_heading'),
              suggestions: [
                { id: 'bodies_m', label: translate('agent.suggestions.bodies_m'), primary: true },
                { id: 'winter', label: translate('agent.suggestions.winter') },
                { id: 'party', label: translate('agent.suggestions.party') },
                { id: 'pajamas', label: translate('agent.suggestions.pajamas') },
                { id: 'next_size', label: translate('agent.suggestions.next_size') },
              ],
              onSelect: (id: string) => {
                const label = translate(`agent.suggestions.${id}`);
                searchQuery = label;
                messages = [...messages, userMsg(label)];
                dispatch({ type: 'SEARCH_INTENT_CHOSEN' });
                handleSend(label);
              },
            },
          ]),
        );
        break;

      case 'free_chat':
        break;
    }

    messages = [...messages.filter((m) => m.role === 'user'), ...newMessages];
  }

  let agentInitialized = false;

  // Load children reactively once the session is available, rather than in a
  // one-shot onMount. This closes the race where $page.data.session isn't yet
  // populated at mount on a client-side navigation into /agent: the effect
  // re-runs the moment the session arrives, so children load reliably and the
  // new-vs-existing-user gate below never falls back to the wrong branch.
  $effect(() => {
    const userId = session?.userId;
    if (agentInitialized || !userId) return;
    agentInitialized = true;
    void initAgent(userId);
  });

  async function initAgent(userId: string) {
    try {
      children = await childRepo.findAll(userId);
    } catch (e) {
      console.error('Failed to load agent data:', e);
    } finally {
      loading = false;
      // Existing users (already have a child registered) skip the intake /
      // registration forms and land in free chat with no unprompted agent
      // message — they only see a message once they send one. New users (no
      // children) start at the greeting + "do you have children?" registration flow.
      if (children.length > 0) {
        intake = { ...initialIntakeState, step: 'free_chat', hasChildren: 'yes' };
      }
      buildIntakeMessages();
    }
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /** Check if the previous message in the list is also from the agent */
  function isConsecutiveAgent(messages: Message[], index: number): boolean {
    if (index === 0) return false;
    return messages[index - 1].role === 'agent';
  }

  async function handleSend(msg: string) {
    const userId = session?.userId;
    if (!userId) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || (lastMsg.content.type === 'text' && lastMsg.content.content !== msg)) {
      messages = [...messages, userMsg(msg)];
    }

    chatState = 'streaming';
    let agentContent = '';
    const agentMsgId = `msg-${Date.now()}-agent`;
    const streamingMsg: Message = {
      id: agentMsgId,
      role: 'agent',
      content: { type: 'text', content: '' },
      createdAt: new Date(),
    };
    messages = [...messages, streamingMsg];

    try {
      const childId = children[0]?.id ?? 'no-child';
      const context = children[0]
        ? {
            name: children[0].name,
            birth_date: children[0].birthDate.toISOString().slice(0, 10),
          }
        : undefined;

      for await (const chunk of chatRepo.sendMessage(userId, childId, msg, context)) {
        if (chunk.type === 'text') {
          agentContent += chunk.content;
          messages = messages.map((m) =>
            m.id === agentMsgId
              ? { ...m, content: { type: 'text' as const, content: agentContent } }
              : m,
          );
        } else if (chunk.type === 'component' && chunk.component === 'itemCarousel') {
          const rawItems = (chunk.props.items as AgentItem[]) ?? [];
          const items = rawItems.map(mapAgentItem);
          messages = messages.map((m) =>
            m.id === agentMsgId ? { ...m, components: [{ type: 'carousel' as const, items }] } : m,
          );
        }
      }
      chatState = 'idle';
    } catch (e) {
      chatState = 'error';
      console.error('Agent stream error:', e);
      toast.error(get(t)('errors.network'));
    }
  }
</script>

<svelte:head>
  <title>{$t('agent.topbar.title')} | BabyClothes</title>
</svelte:head>

<div class="agent-page">
  <div class="agent-page__messages" bind:this={messagesEl}>
    {#each messages as message, index (message.id)}
      {#if message.components}
        {#if message.role === 'agent' && message.content.type === 'text' && message.content.content && !message.components.some((c) => c.type === 'carousel')}
          <div class="agent-page__row">
            <!-- <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
              {#if !isConsecutiveAgent(messages, index)}
                <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                  <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                </svg>
              {/if}
            </div> -->
            <div class="agent-page__bwrap">
              <ChatBubble
                role="agent"
                surface="light"
                content={message.content.content}
                timestamp={formatTime(message.createdAt)}
              />
            </div>
          </div>
        {/if}
        {#each message.components as component}
          {#if component.type === 'choiceChips'}
            <div class="agent-page__row">
              <!-- <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
                {#if !isConsecutiveAgent(messages, index)}
                  <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                    <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                  </svg>
                {/if}
              </div> -->
              <div class="agent-page__bwrap">
                <ChoiceChipGroup
                  options={component.options}
                  onSelect={component.onSelect}
                  ariaLabel={$t('agent.intake.choice_placeholder')}
                />
              </div>
            </div>
          {:else if component.type === 'childForm'}
            <div class="agent-page__row">
              <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
                {#if !isConsecutiveAgent(messages, index)}
                  <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                    <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                  </svg>
                {/if}
              </div>
              <div class="agent-page__bwrap">
                <AgentFormCard title={component.title} maxWidth="26rem">
                  <ChildInlineForm
                    initial={component.initial
                      ? {
                          name: component.initial.name ?? '',
                          ageMonths: component.initial.ageMonths?.toString() ?? '',
                          currentHeightCm: component.initial.currentHeightCm?.toString() ?? '',
                          currentWeightKg: component.initial.currentWeightG
                            ? (component.initial.currentWeightG / 1000).toString()
                            : '',
                          birthHeightCm: component.initial.birthHeightCm?.toString() ?? '',
                          birthWeightG: component.initial.birthWeightG?.toString() ?? '',
                        }
                      : undefined}
                    submitLabel={$t('agent.form.submit')}
                    labels={{
                      name: $t('agent.form.name'),
                      ageMonths: $t('agent.form.age'),
                      currentHeight: $t('agent.form.height'),
                      currentWeight: $t('agent.form.weight'),
                      birthHeight: $t('agent.form.birth_height'),
                      birthWeight: $t('agent.form.birth_weight'),
                      submit: $t('agent.form.submit'),
                    }}
                    units={{ age: 'meses', height: 'cm', weight: 'kg', birthWeight: 'g' }}
                    loading={childFormSubmitting}
                    onSubmit={async (values) => {
                      const input = mapChildFormToCreateChildInput(values, new Date());
                      await component.onSubmit(input);
                    }}
                  />
                </AgentFormCard>
              </div>
            </div>
          {:else if component.type === 'dueDate'}
            <div class="agent-page__row">
              <!-- <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
                {#if !isConsecutiveAgent(messages, index)}
                  <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                    <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                  </svg>
                {/if}
              </div> -->
              <div class="agent-page__bwrap">
                <AgentFormCard title={component.title} maxWidth="26rem">
                  <MonthPicker
                    months={component.months}
                    onChange={component.onConfirm}
                    ariaLabel={$t('agent.intake.due_date_title')}
                  />
                </AgentFormCard>
              </div>
            </div>
          {:else if component.type === 'suggestions'}
            <div class="agent-page__row">
              <!-- <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
                {#if !isConsecutiveAgent(messages, index)}
                  <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                    <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                  </svg>
                {/if}
              </div> -->
              <div class="agent-page__bwrap">
                {#if component.heading}
                  <span class="agent-page__suggestions-label">{component.heading}</span>
                {/if}
                <ChoiceChipGroup
                  options={component.suggestions.map((s) => ({
                    value: s.id,
                    label: s.label,
                    primary: s.primary,
                  }))}
                  onSelect={component.onSelect}
                  ariaLabel={component.heading ?? $t('agent.intake.suggestions_heading')}
                  tone="soft"
                  size="sm"
                />
              </div>
            </div>
          {:else if component.type === 'carousel'}
            <div class="agent-page__row">
              <!-- <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
                {#if !isConsecutiveAgent(messages, index)}
                  <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                    <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                  </svg>
                {/if}
              </div> -->
              <div class="agent-page__bwrap agent-page__cards">
                {#each component.items ?? [] as item (item.id)}
                  <Card
                    image={item.photoUrls[0] ?? ''}
                    title={item.title}
                    detail={`Tam. ${item.clothingSize}`}
                    price={formatPrice(item.priceCents)}
                    condition={$t(`item_card.condition_${item.condition}`)}
                    pinkPrice={true}
                    size="sm"
                    onClick={() => openItemSheet(item.id)}
                  />
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      {/if}

      {#if message.role === 'agent' && (!message.components || message.components.some((c) => c.type === 'carousel'))}
        {#if isSystemMessage(message)}
          <ChatBubble
            role="system"
            surface="light"
            content={message.content.type === 'text' ? message.content.content : ''}
          />
        {:else}
          <div class="agent-page__row">
            <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
              {#if !isConsecutiveAgent(messages, index)}
                <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                  <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                </svg>
              {/if}
            </div>
            <div class="agent-page__bwrap">
              <ChatBubble
                role="agent"
                surface="light"
                content={message.content.type === 'text' ? message.content.content : ''}
                timestamp={formatTime(message.createdAt)}
              />
            </div>
          </div>
        {/if}
      {:else if message.role === 'user'}
        <div class="agent-page__row agent-page__row--me">
          <div class="agent-page__bwrap">
            <ChatBubble
              role="user"
              surface="light"
              content={message.content.type === 'text' ? message.content.content : ''}
              timestamp={formatTime(message.createdAt)}
            />
          </div>
        </div>
      {/if}
    {/each}

    {#if isTyping}
      <div class="agent-page__row">
        <div class="agent-page__av">
          <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
            <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
          </svg>
        </div>
        <div class="agent-page__typing">
          <span class="agent-page__typing-dot"></span>
          <span class="agent-page__typing-dot"></span>
          <span class="agent-page__typing-dot"></span>
        </div>
      </div>
    {/if}

    {#if isTyping && searchQuery}
      <ChatBubble
        role="system"
        surface="light"
        content={$t('agent.system.searching', { query: searchQuery, city: session?.city ?? '' })}
      />
    {/if}
  </div>

  <div class="agent-page__input">
    <ChatInput
      placeholder={intake.step === 'ask_has_children' || intake.step === 'ask_children_count'
        ? $t('agent.intake.choice_placeholder')
        : $t('agent.intake.input_placeholder')}
      loading={isTyping}
      onsend={handleSend}
    />
  </div>

  {#if itemSheetOpen}
    <div class="item-sheet" role="dialog" aria-modal="true" aria-label={$t('agent.results.modal_title')}>
      <button class="item-sheet__close" type="button" onclick={closeItemSheet} aria-label={$t('agent.results.close')}>
        <X size={20} strokeWidth={2.5} />
      </button>
      <div class="item-sheet__body">
        {#if itemSheetLoading}
          <div class="agent-page__modal-loading">
            <span class="agent-page__typing-dot"></span>
            <span class="agent-page__typing-dot"></span>
            <span class="agent-page__typing-dot"></span>
          </div>
        {:else if itemSheetDetail}
          <ItemDetailView item={itemSheetDetail.item} seller={itemSheetDetail.seller} />
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .agent-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--of);
  }

  .agent-page__messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
  }

  .agent-page__messages::-webkit-scrollbar {
    width: 0.3rem;
  }

  .agent-page__messages::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.2rem;
  }

  .agent-page__row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
    max-width: 85%;
  }

  .agent-page__row--me {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .agent-page__av {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .agent-page__av--hidden {
    visibility: hidden;
  }

  .agent-page__bwrap {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  .agent-page__cards {
    flex-direction: row;
    gap: 0.6rem;
    overflow-x: auto;
    padding-bottom: 0.3rem;
    max-width: 100%;
  }

  .agent-page__modal-loading {
    display: flex;
    gap: 0.3rem;
    justify-content: center;
    padding: 2rem 0;
  }

  .agent-page__suggestions-label {
    font-family: var(--font-lato);
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #9CA3AF;
    padding-left: 0.2rem;
    margin-bottom: 0.2rem;
  }

  .agent-page__typing {
    background: #fff;
    border-radius: 0.75rem 0.75rem 0.75rem 0.2rem;
    padding: 0.6rem 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.28rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .06);
  }

  .agent-page__typing-dot {
    width: 0.4rem;
    height: 0.4rem;
    background: #FF3CAC;
    border-radius: 50%;
    animation: typing 0.9s ease-in-out infinite;
  }

  .agent-page__typing-dot:nth-child(2) {
    animation-delay: 0.1s;
  }

  .agent-page__typing-dot:nth-child(3) {
    animation-delay: 0.2s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-0.4rem);
    }
  }

  .agent-page__input {
    flex-shrink: 0;
  }

  .item-sheet {
    position: fixed;
    inset: 0;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background: var(--wh, #fff);
    overflow-y: auto;
  }

  .item-sheet__close {
    position: fixed;
    top: 1.2rem;
    right: 1.2rem;
    z-index: 1001;
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .item-sheet__body {
    min-height: 100%;
  }
</style>
