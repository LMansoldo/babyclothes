import type { AgentResponse } from '../value-objects/AgentResponse';

/** Existing carousel payload */
export interface CarouselPayload {
  type: 'carousel';
  items?: import('$lib/domain/item/entities/Item').Item[];
  label?: string;
}

/** Existing item list payload */
export interface ItemListPayload {
  type: 'itemList';
  items?: import('$lib/domain/item/entities/Item').Item[];
  label?: string;
}

/** Existing growth alert payload */
export interface GrowthAlertPayload {
  type: 'growthAlert';
  childName?: string;
  currentSize?: string;
  nextSize?: string;
  daysUntil?: number;
  progress?: number;
  eyebrow?: string;
  description?: string;
  sizes?: { label: string; status: 'past' | 'current' | 'next' | 'future' }[];
  primaryAction?: { label: string; onclick: () => void };
  secondaryAction?: { label: string; onclick: () => void };
}

/** Choice chips for intake questions */
export interface ChoiceChipsPayload {
  type: 'choiceChips';
  options: { value: string; label: string; primary?: boolean }[];
  onSelect: (value: string) => void;
}

/** Inline child registration form */
export interface ChildFormPayload {
  type: 'childForm';
  title: string;
  initial?: Partial<import('$lib/domain/child/schemas').CreateChildInput>;
  onSubmit: (input: import('$lib/domain/child/schemas').CreateChildInput) => void;
}

/** Due date month picker */
export interface DueDatePayload {
  type: 'dueDate';
  title: string;
  months: { value: string; label: string }[];
  onConfirm: (month: string) => void;
}

/** Suggestion chips for search intent */
export interface SuggestionChipsPayload {
  type: 'suggestions';
  heading?: string;
  suggestions: { id: string; label: string; primary?: boolean }[];
  onSelect: (id: string) => void;
}

export type ComponentPayload =
  | CarouselPayload
  | ItemListPayload
  | GrowthAlertPayload
  | ChoiceChipsPayload
  | ChildFormPayload
  | DueDatePayload
  | SuggestionChipsPayload;

export type Message = {
  id: string;
  role: 'user' | 'agent';
  content: AgentResponse;
  components?: ComponentPayload[];
  createdAt: Date;
};
