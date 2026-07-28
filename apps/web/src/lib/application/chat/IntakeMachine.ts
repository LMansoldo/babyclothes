import type { CreateChildInput } from '$lib/domain/child/schemas';

export type IntakeStep =
  | 'ask_has_children'
  | 'ask_children_count'
  | 'fill_child_form'
  | 'ask_due_date'
  | 'explain_platform'
  | 'ask_search_intent'
  | 'free_chat';

export type HasChildrenAnswer = 'yes' | 'no' | 'expecting';

export interface IntakeState {
  step: IntakeStep;
  hasChildren: HasChildrenAnswer | null;
  childrenCount: number | null;
  childrenFilled: number;
  children: CreateChildInput[];
  dueDate: string | null; // YYYY-MM
}

export const initialIntakeState: IntakeState = {
  step: 'ask_has_children',
  hasChildren: null,
  childrenCount: null,
  childrenFilled: 0,
  children: [],
  dueDate: null,
};

export type IntakeEvent =
  | { type: 'ANSWER_HAS_CHILDREN'; answer: HasChildrenAnswer }
  | { type: 'ANSWER_COUNT'; count: number }
  | { type: 'CHILD_SUBMITTED'; child: CreateChildInput }
  | { type: 'DUE_DATE_CONFIRMED'; month: string }
  | { type: 'EXPLANATION_DONE' }
  | { type: 'SEARCH_INTENT_CHOSEN' };

export function reduceIntake(state: IntakeState, event: IntakeEvent): IntakeState {
  switch (event.type) {
    case 'ANSWER_HAS_CHILDREN':
      if (state.step !== 'ask_has_children') return state;
      if (event.answer === 'yes') return { ...state, hasChildren: 'yes', step: 'ask_children_count' };
      if (event.answer === 'expecting') return { ...state, hasChildren: 'expecting', step: 'ask_due_date' };
      return { ...state, hasChildren: 'no', step: 'explain_platform' };

    case 'ANSWER_COUNT':
      if (state.step !== 'ask_children_count' || event.count < 1) return state;
      return { ...state, childrenCount: event.count, step: 'fill_child_form' };

    case 'CHILD_SUBMITTED': {
      if (state.step !== 'fill_child_form') return state;
      const filled = state.childrenFilled + 1;
      const children = [...state.children, event.child];
      const done = state.childrenCount !== null && filled >= state.childrenCount;
      return {
        ...state,
        childrenFilled: filled,
        children,
        step: done ? 'explain_platform' : 'fill_child_form',
      };
    }

    case 'DUE_DATE_CONFIRMED':
      if (state.step !== 'ask_due_date') return state;
      return { ...state, dueDate: event.month, step: 'explain_platform' };

    case 'EXPLANATION_DONE':
      if (state.step !== 'explain_platform') return state;
      return { ...state, step: 'ask_search_intent' };

    case 'SEARCH_INTENT_CHOSEN':
      if (state.step !== 'ask_search_intent') return state;
      return { ...state, step: 'free_chat' };
  }
}
