import { describe, it, expect } from 'vitest';
import pt from './locales/pt.json';
import en from './locales/en.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      return collectKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe('i18n locale catalogues', () => {
  it('pt and en expose the exact same set of keys', () => {
    expect(collectKeys(pt).sort()).toEqual(collectKeys(en).sort());
  });

  it('neither catalogue contains an emoji in any string value', () => {
    const emojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const ptValues = Object.values(flatten(pt));
    const enValues = Object.values(flatten(en));
    for (const value of [...ptValues, ...enValues]) {
      expect(emojiPattern.test(String(value))).toBe(false);
    }
  });
});

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      return { ...acc, ...flatten(value as Record<string, unknown>, path) };
    }
    return { ...acc, [path]: value };
  }, {});
}
