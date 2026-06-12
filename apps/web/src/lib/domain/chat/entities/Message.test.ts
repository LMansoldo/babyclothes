import { describe, it, expect } from 'vitest'
import type { Message } from './Message'
import type { AgentResponse } from '../value-objects/AgentResponse'

describe('Message', () => {
  it('represents a user text message', () => {
    const content: AgentResponse = { type: 'text', content: 'Olá' }
    const msg: Message = {
      id: 'msg-1',
      role: 'user',
      content,
      createdAt: new Date('2026-01-01T10:00:00Z'),
    }
    expect(msg.role).toBe('user')
    expect(msg.content.type).toBe('text')
  })

  it('represents an agent component message', () => {
    const content: AgentResponse = {
      type: 'component',
      component: 'Carousel',
      props: { items: [] },
    }
    const msg: Message = {
      id: 'msg-2',
      role: 'agent',
      content,
      createdAt: new Date(),
    }
    expect(msg.role).toBe('agent')
    expect(msg.content.type).toBe('component')
    if (msg.content.type === 'component') {
      expect(msg.content.component).toBe('Carousel')
    }
  })
})
