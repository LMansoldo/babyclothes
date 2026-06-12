import { describe, it, expect, vi } from 'vitest'
import { SendChatMessage } from './SendChatMessage'
import type { IChatRepository } from '$lib/domain/chat/repositories/IChatRepository'
import type { AgentResponse } from '$lib/domain/chat/value-objects/AgentResponse'

describe('SendChatMessage', () => {
  it('delegates to chat repository and yields responses', async () => {
    async function* mockStream(): AsyncIterable<AgentResponse> {
      yield { type: 'text', content: 'Encontrei estas peças:' }
      yield { type: 'component', component: 'Carousel', props: { items: [] } }
    }

    const chat: IChatRepository = {
      sendMessage: vi.fn().mockReturnValue(mockStream()),
    }

    const useCase = new SendChatMessage(chat)
    const stream = useCase.execute('u-1', 'child-1', 'Mostre macacões tamanho M')

    const collected: AgentResponse[] = []
    for await (const chunk of stream) {
      collected.push(chunk)
    }

    expect(chat.sendMessage).toHaveBeenCalledWith('u-1', 'child-1', 'Mostre macacões tamanho M')
    expect(collected).toHaveLength(2)
    expect(collected[0]).toEqual({ type: 'text', content: 'Encontrei estas peças:' })
    expect(collected[1].type).toBe('component')
  })
})
