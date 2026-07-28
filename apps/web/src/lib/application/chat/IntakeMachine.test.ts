import { describe, it, expect } from 'vitest';
import { reduceIntake, initialIntakeState, type IntakeState } from './IntakeMachine';
import type { CreateChildInput } from '$lib/domain/child/schemas';

const child1: CreateChildInput = {
  name: 'Sofia',
  birthDate: '2024-03-15',
  birthWeightG: 3200,
  birthHeightCm: 49,
};

const child2: CreateChildInput = {
  name: 'Pedro',
  ageMonths: 8,
  birthWeightG: 3500,
  birthHeightCm: 51,
};

describe('IntakeMachine', () => {
  describe('branch: has children (yes) with count 2', () => {
    it('transitions through the full flow', () => {
      // ask_has_children -> yes -> ask_children_count
      const s1 = reduceIntake(initialIntakeState, { type: 'ANSWER_HAS_CHILDREN', answer: 'yes' });
      expect(s1.step).toBe('ask_children_count');
      expect(s1.hasChildren).toBe('yes');

      // ask_children_count -> 2 -> fill_child_form
      const s2 = reduceIntake(s1, { type: 'ANSWER_COUNT', count: 2 });
      expect(s2.step).toBe('fill_child_form');
      expect(s2.childrenCount).toBe(2);

      // fill_child_form -> child1 -> still fill_child_form
      const s3 = reduceIntake(s2, { type: 'CHILD_SUBMITTED', child: child1 });
      expect(s3.step).toBe('fill_child_form');
      expect(s3.childrenFilled).toBe(1);
      expect(s3.children).toHaveLength(1);

      // fill_child_form -> child2 -> explain_platform (all filled)
      const s4 = reduceIntake(s3, { type: 'CHILD_SUBMITTED', child: child2 });
      expect(s4.step).toBe('explain_platform');
      expect(s4.childrenFilled).toBe(2);
      expect(s4.children).toHaveLength(2);

      // explain_platform -> EXPLANATION_DONE -> ask_search_intent
      const s5 = reduceIntake(s4, { type: 'EXPLANATION_DONE' });
      expect(s5.step).toBe('ask_search_intent');

      // ask_search_intent -> SEARCH_INTENT_CHOSEN -> free_chat
      const s6 = reduceIntake(s5, { type: 'SEARCH_INTENT_CHOSEN' });
      expect(s6.step).toBe('free_chat');
    });
  });

  describe('branch: no children', () => {
    it('goes directly to explain_platform', () => {
      const s1 = reduceIntake(initialIntakeState, { type: 'ANSWER_HAS_CHILDREN', answer: 'no' });
      expect(s1.step).toBe('explain_platform');
      expect(s1.hasChildren).toBe('no');

      const s2 = reduceIntake(s1, { type: 'EXPLANATION_DONE' });
      expect(s2.step).toBe('ask_search_intent');

      const s3 = reduceIntake(s2, { type: 'SEARCH_INTENT_CHOSEN' });
      expect(s3.step).toBe('free_chat');
    });
  });

  describe('branch: expecting', () => {
    it('goes through due date flow', () => {
      const s1 = reduceIntake(initialIntakeState, { type: 'ANSWER_HAS_CHILDREN', answer: 'expecting' });
      expect(s1.step).toBe('ask_due_date');
      expect(s1.hasChildren).toBe('expecting');

      const s2 = reduceIntake(s1, { type: 'DUE_DATE_CONFIRMED', month: '2026-10' });
      expect(s2.step).toBe('explain_platform');
      expect(s2.dueDate).toBe('2026-10');

      const s3 = reduceIntake(s2, { type: 'EXPLANATION_DONE' });
      expect(s3.step).toBe('ask_search_intent');

      const s4 = reduceIntake(s3, { type: 'SEARCH_INTENT_CHOSEN' });
      expect(s4.step).toBe('free_chat');
    });
  });

  describe('out-of-order events are no-ops', () => {
    it('ignores ANSWER_COUNT when not in ask_children_count', () => {
      const s = reduceIntake(initialIntakeState, { type: 'ANSWER_COUNT', count: 2 });
      expect(s).toBe(initialIntakeState);
    });

    it('ignores CHILD_SUBMITTED when not in fill_child_form', () => {
      const s = reduceIntake(initialIntakeState, { type: 'CHILD_SUBMITTED', child: child1 });
      expect(s).toBe(initialIntakeState);
    });

    it('ignores DUE_DATE_CONFIRMED when not in ask_due_date', () => {
      const s = reduceIntake(initialIntakeState, { type: 'DUE_DATE_CONFIRMED', month: '2026-10' });
      expect(s).toBe(initialIntakeState);
    });

    it('ignores EXPLANATION_DONE when not in explain_platform', () => {
      const s = reduceIntake(initialIntakeState, { type: 'EXPLANATION_DONE' });
      expect(s).toBe(initialIntakeState);
    });

    it('ignores SEARCH_INTENT_CHOSEN when not in ask_search_intent', () => {
      const s = reduceIntake(initialIntakeState, { type: 'SEARCH_INTENT_CHOSEN' });
      expect(s).toBe(initialIntakeState);
    });
  });

  describe('edge cases', () => {
    it('ignores count < 1', () => {
      const s1 = reduceIntake(initialIntakeState, { type: 'ANSWER_HAS_CHILDREN', answer: 'yes' });
      const s2 = reduceIntake(s1, { type: 'ANSWER_COUNT', count: 0 });
      expect(s2.step).toBe('ask_children_count');
      expect(s2.childrenCount).toBeNull();
    });

    it('ignores negative count', () => {
      const s1 = reduceIntake(initialIntakeState, { type: 'ANSWER_HAS_CHILDREN', answer: 'yes' });
      const s2 = reduceIntake(s1, { type: 'ANSWER_COUNT', count: -1 });
      expect(s2.step).toBe('ask_children_count');
    });
  });
});
