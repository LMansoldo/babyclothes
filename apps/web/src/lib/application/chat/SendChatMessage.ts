import type { IChatRepository } from '$lib/domain/chat/repositories/IChatRepository'
import type { AgentResponse } from '$lib/domain/chat/value-objects/AgentResponse'

export class SendChatMessage {
  constructor(private readonly chat: IChatRepository) {}

  execute(userId: string, childId: string, message: string): AsyncIterable<AgentResponse> {
    return this.chat.sendMessage(userId, childId, message)
  }
}
