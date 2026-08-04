export const SUPPORTED_LOCALES = ['pt', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function preferredLocaleFromHeader(acceptLanguage: string): SupportedLocale {
  // Default to Portuguese (pt) as the primary market language
  return acceptLanguage.toLowerCase().startsWith('en') ? 'en' : 'pt';
}
