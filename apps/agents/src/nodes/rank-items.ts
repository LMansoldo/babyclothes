/**
 * rankItems — Sorts items by relevance to the child's context.
 *
 * Ranking factors:
 * 1. Size match (exact > close > far)
 * 2. Gender match
 * 3. Condition (new > like_new > used)
 * 4. Price (lower is better for similar items)
 */

import type { ChatState, CatalogItem, ChildContext } from '../types.js';

const SIZE_ORDER = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '5', '6'];

function sizeDistance(size1: string, size2: string): number {
  const idx1 = SIZE_ORDER.indexOf(size1);
  const idx2 = SIZE_ORDER.indexOf(size2);
  if (idx1 === -1 || idx2 === -1) return 999;
  return Math.abs(idx1 - idx2);
}

function getCurrentSize(child: ChildContext): string | undefined {
  if (child.measurements.length === 0) return undefined;
  return child.measurements[child.measurements.length - 1].clothing_size;
}

function scoreItem(item: CatalogItem, child: ChildContext): number {
  let score = 0;

  // Size match (0-40 points)
  const currentSize = getCurrentSize(child);
  if (currentSize) {
    const distance = sizeDistance(item.clothing_size, currentSize);
    score += Math.max(0, 40 - distance * 10);
  }

  // Gender match (0-20 points)
  if (item.gender === child.gender || item.gender === 'unisex') {
    score += 20;
  }

  // Condition (0-15 points)
  const conditionScores: Record<string, number> = {
    new: 15,
    like_new: 10,
    used: 5,
  };
  score += conditionScores[item.condition] || 0;

  // Price (0-25 points, inverse — lower price = higher score)
  const maxPrice = 10000; // R$100
  score += Math.max(0, 25 - (item.price_cents / maxPrice) * 25);

  return score;
}

export async function rankItems(state: ChatState): Promise<Partial<ChatState>> {
  if (!state.items || state.items.length === 0) {
    return { items: [] };
  }

  const ranked = [...state.items].sort((a, b) => {
    const scoreA = scoreItem(a, state.child_context);
    const scoreB = scoreItem(b, state.child_context);
    return scoreB - scoreA;
  });

  return { items: ranked };
}
