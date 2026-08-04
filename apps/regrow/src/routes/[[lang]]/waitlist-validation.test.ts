import { describe, it, expect } from 'vitest';
import {
  readFormValues,
  isCompleteWaitlistForm,
  EMAIL_REGEX,
  hasPrismaErrorCode,
} from './waitlist-validation';

function formDataFrom(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

describe('readFormValues', () => {
  it('reads and trims all 4 fields', () => {
    const data = formDataFrom({
      nome: '  Maria  ',
      telefone: ' 11999999999 ',
      email: ' maria@example.com ',
      interesse: 'roupas',
    });
    expect(readFormValues(data)).toEqual({
      nome: 'Maria',
      telefone: '11999999999',
      email: 'maria@example.com',
      interesse: 'roupas',
    });
  });

  it('returns undefined for missing fields', () => {
    const data = formDataFrom({ nome: 'Maria' });
    const result = readFormValues(data);
    expect(result.nome).toBe('Maria');
    expect(result.telefone).toBeUndefined();
  });
});

describe('isCompleteWaitlistForm', () => {
  it('returns true when all 4 fields are present and non-empty', () => {
    expect(
      isCompleteWaitlistForm({
        nome: 'Maria',
        telefone: '119999999',
        email: 'a@b.com',
        interesse: 'roupas',
      }),
    ).toBe(true);
  });

  it('returns false when any field is missing', () => {
    expect(isCompleteWaitlistForm({ nome: 'Maria' })).toBe(false);
    expect(isCompleteWaitlistForm({})).toBe(false);
  });
});

describe('EMAIL_REGEX', () => {
  it('accepts a well-formed email', () => {
    expect(EMAIL_REGEX.test('maria@example.com')).toBe(true);
  });

  it('rejects a malformed email', () => {
    expect(EMAIL_REGEX.test('not-an-email')).toBe(false);
    expect(EMAIL_REGEX.test('a@b')).toBe(false);
  });
});

describe('hasPrismaErrorCode', () => {
  it('returns true when the error has the matching code', () => {
    expect(hasPrismaErrorCode({ code: 'P2002' }, 'P2002')).toBe(true);
  });

  it('returns false for a different code, a plain Error, or a non-object', () => {
    expect(hasPrismaErrorCode({ code: 'P2000' }, 'P2002')).toBe(false);
    expect(hasPrismaErrorCode(new Error('boom'), 'P2002')).toBe(false);
    expect(hasPrismaErrorCode('P2002', 'P2002')).toBe(false);
    expect(hasPrismaErrorCode(null, 'P2002')).toBe(false);
  });
});
