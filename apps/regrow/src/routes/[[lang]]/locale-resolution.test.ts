import { describe, it, expect } from 'vitest';
import { isSupportedLocale, preferredLocaleFromHeader } from './locale-resolution';

describe('isSupportedLocale', () => {
  it('accepts pt and en', () => {
    expect(isSupportedLocale('pt')).toBe(true);
    expect(isSupportedLocale('en')).toBe(true);
  });

  it('rejects any other value', () => {
    expect(isSupportedLocale('fr')).toBe(false);
    expect(isSupportedLocale('')).toBe(false);
    expect(isSupportedLocale('PT')).toBe(false);
  });
});

describe('preferredLocaleFromHeader', () => {
  it('returns pt when Accept-Language starts with pt', () => {
    expect(preferredLocaleFromHeader('pt-BR,pt;q=0.9')).toBe('pt');
    expect(preferredLocaleFromHeader('pt')).toBe('pt');
  });

  it('returns en for anything not starting with pt, including empty', () => {
    expect(preferredLocaleFromHeader('en-US,en;q=0.9')).toBe('en');
    expect(preferredLocaleFromHeader('fr-FR')).toBe('en');
    expect(preferredLocaleFromHeader('')).toBe('en');
  });
});
