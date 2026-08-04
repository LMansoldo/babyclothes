import { init, register } from 'svelte-i18n';

register('pt', () => import('./locales/pt.json'));
register('en', () => import('./locales/en.json'));

export function initI18n(initialLocale: 'pt' | 'en') {
  return init({
    fallbackLocale: 'pt',
    initialLocale,
  });
}

export { t, locale, waitLocale, isLoading } from 'svelte-i18n';
