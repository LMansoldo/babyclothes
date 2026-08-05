import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
vi.mock('$lib/server/db', () => ({
  prisma: { lead: { create: (...args: unknown[]) => createMock(...args) } },
}));

import { actions } from './+page.server';

function requestWith(entries: Record<string, string>): Request {
  const body = new URLSearchParams(entries);
  return new Request('http://localhost/pt', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

describe('waitlist action', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns a 400 with error_required when a field is missing', async () => {
    const event = {
      request: requestWith({ nome: 'Maria' }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result).toMatchObject({ status: 400, data: { errorKey: 'form.error_required' } });
  });

  it('returns a 400 with error_email when the email is malformed', async () => {
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'not-an-email',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result).toMatchObject({ status: 400, data: { errorKey: 'form.error_email' } });
  });

  it('creates a lead and returns success on valid input', async () => {
    createMock.mockResolvedValue({ id: 1 });
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result).toEqual({ success: true });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
        locale: 'pt',
      },
    });
  });

  it('returns a 409 with error_duplicate on a Prisma P2002 unique-constraint error', async () => {
    createMock.mockRejectedValue({ code: 'P2002' });
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result).toMatchObject({ status: 409, data: { errorKey: 'form.error_duplicate' } });
  });

  it('returns a 500 with error_server on any other database error', async () => {
    createMock.mockRejectedValue(new Error('connection refused'));
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result).toMatchObject({ status: 500, data: { errorKey: 'form.error_server' } });
  });

  it('defaults locale to pt when params.lang is absent', async () => {
    createMock.mockResolvedValue({ id: 1 });
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: {},
    } as never;
    await actions.waitlist(event);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ locale: 'pt' }) }),
    );
  });
});
