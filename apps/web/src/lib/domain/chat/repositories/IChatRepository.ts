import type { AgentResponse } from '../value-objects/AgentResponse';

export type ChatContext = {
  name?: string;
  birth_date?: string;
};

export interface IChatRepository {
  sendMessage(
    userId: string,
    childId: string,
    message: string,
    context?: ChatContext,
  ): AsyncIterable<AgentResponse>;
}
