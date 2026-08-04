import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.params.lang === 'en' ? 'en' : 'pt-BR';

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang),
  });
};
