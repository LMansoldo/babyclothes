import type { AgentResponse } from '../value-objects/AgentResponse'

export interface IChatRepository {
  sendMessage(
    userId: string,
    childId: string,
    message: string,
  ): AsyncIterable<AgentResponse>
}
