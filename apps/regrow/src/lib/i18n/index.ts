import { init, addMessages } from 'svelte-i18n';
import pt from './locales/pt.json';
import en from './locales/en.json';

// Both locale files are small and always needed (this is a fully bilingual
// site, nothing lazy-loads per visitor), so the dictionary is populated
// synchronously via addMessages() at module load time instead of through
// svelte-i18n's register()/dynamic-import loader mechanism. register()'s
// loader is inherently async (even Promise.resolve(...) doesn't resolve
// until the next microtask), and +layout.svelte calls initI18n()
// synchronously, unawaited, so <svelte:head>'s $t() calls run in the same
// tick — a loader-based dictionary wasn't guaranteed to be populated yet,
// which caused an intermittent 500 ("Cannot format a message without
// first setting the initial locale") on a server's very first request.
// addMessages() has no such gap: the dictionary is already populated
// before init() is ever called.
addMessages('pt', pt);
addMessages('en', en);

export function initI18n(initialLocale: 'pt' | 'en') {
  return init({
    fallbackLocale: 'pt',
    initialLocale,
  });
}

export { t, locale, waitLocale, isLoading } from 'svelte-i18n';
