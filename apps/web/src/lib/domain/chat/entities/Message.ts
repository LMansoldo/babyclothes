import type { AgentResponse } from '../value-objects/AgentResponse';

export type ComponentPayload = {
  type: 'carousel' | 'itemList' | 'growthAlert';
  items?: import('$lib/domain/item/entities/Item').Item[];
  label?: string;
  childName?: string;
  currentSize?: string;
  nextSize?: string;
  daysUntil?: number;
  progress?: number;
  eyebrow?: string;
  description?: string;
  sizes?: { label: string; status: string }[];
  primaryAction?: { label: string; onclick: () => void };
  secondaryAction?: { label: string; onclick: () => void };
};

export type Message = {
  id: string;
  role: 'user' | 'agent';
  content: AgentResponse;
  components?: ComponentPayload[];
  createdAt: Date;
};
