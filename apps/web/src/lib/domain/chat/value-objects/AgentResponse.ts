export type AgentResponse =
  | { type: 'text'; content: string }
  | { type: 'component'; component: string; props: Record<string, unknown> };
