import { writable, derived, get } from 'svelte/store';
import en from './en.json';
import pt from './pt.json';

type Locale = 'en' | 'pt';
type Messages = typeof en;

const ptMessages: Messages = pt as Messages;
const messages: Record<Locale, Messages> = { en, pt: ptMessages };
const STORAGE_KEY = 'babyclothes_locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'pt';
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && (stored === 'en' || stored === 'pt')) return stored;
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  return 'pt';
}

export const locale = writable<Locale>(getInitialLocale());

locale.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, value);
  }
});

function getPath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

export const t = derived(locale, ($locale) => {
  const dict = messages[$locale];
  return (key: string, params?: Record<string, unknown>): string => {
    const template = getPath(dict as Record<string, unknown>, key) ?? key;
    return interpolate(template, params);
  };
});

export function setLocale(l: Locale) {
  locale.set(l);
}

export function toggleLocale() {
  locale.update((current) => (current === 'pt' ? 'en' : 'pt'));
}

export { get };
