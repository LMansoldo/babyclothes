/**
 * checkThreshold — Determines if a growth notification should be sent.
 *
 * Notification triggers:
 * - Size fit is "tight" (child outgrowing current size)
 * - Prediction confidence > 70%
 * - Days until needed < 45 days
 */

import type { GrowthState } from '../types.js';

export async function checkThreshold(state: GrowthState): Promise<Partial<GrowthState>> {
  try {
    const { trend, prediction, child } = state;

    if (!trend || !prediction) {
      return { should_notify: false };
    }

    // Check conditions
    const isSizeTight = trend.size_fit === 'tight';
    const isConfident = prediction.confidence >= 70;
    const isSoon = prediction.days_until_needed >= 0 && prediction.days_until_needed <= 45;

    const shouldNotify = isSizeTight || (isConfident && isSoon);

    if (!shouldNotify) {
      return { should_notify: false };
    }

    // Build notification
    const userId = child.child_id; // Will be replaced with actual user_id in emitNotification

    return {
      should_notify: true,
      notification: {
        user_id: userId,
        type: 'growth_prediction',
        title: `${child.name} vai precisar de ${prediction.predicted_size}!`,
        body: isSoon
          ? `Em ${prediction.days_until_needed} dias, ${child.name} vai precisar de tamanho ${prediction.predicted_size}`
          : `${child.name} está ficando grande para ${trend.current_size}! Considere comprar tamanho ${prediction.predicted_size}`,
        metadata: {
          child_id: child.child_id,
          current_size: trend.current_size,
          predicted_size: prediction.predicted_size,
          confidence: prediction.confidence,
          days_until_needed: prediction.days_until_needed,
          size_fit: trend.size_fit,
        },
      },
    };
  } catch (error) {
    console.error('checkThreshold error:', error);
    return { should_notify: false };
  }
}
