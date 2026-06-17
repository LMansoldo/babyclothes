import { describe, it, expect } from 'vitest';
import { createNotification } from './Notification';

describe('Notification', () => {
  it('isRead() returns false when readAt is undefined', () => {
    const n = createNotification({
      id: 'n-1',
      userId: 'u-1',
      type: 'growth_prediction',
      title: 'Sofia vai precisar de tamanho M em breve',
      body: 'Com base nas medidas recentes, estimamos troca de tamanho em ~30 dias.',
    });
    expect(n.isRead()).toBe(false);
  });

  it('isRead() returns true when readAt is set', () => {
    const n = createNotification({
      id: 'n-2',
      userId: 'u-1',
      type: 'new_match',
      title: 'Nova peça disponível',
      body: 'Encontramos um macacão tamanho M para Sofia.',
      readAt: new Date('2026-01-02T09:00:00Z'),
    });
    expect(n.isRead()).toBe(true);
  });

  it('accepts optional metadata', () => {
    const n = createNotification({
      id: 'n-3',
      userId: 'u-1',
      type: 'system',
      title: 'Bem-vinda!',
      body: 'Sua conta foi criada.',
      metadata: { source: 'onboarding' },
    });
    expect(n.metadata).toEqual({ source: 'onboarding' });
  });
});
