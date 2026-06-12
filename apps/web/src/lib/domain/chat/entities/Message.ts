import type { AgentResponse } from '../value-objects/AgentResponse'

export type Message = {
  id: string
  role: 'user' | 'agent'
  content: AgentResponse
  createdAt: Date
}
