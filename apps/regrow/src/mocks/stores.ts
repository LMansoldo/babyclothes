import { readable } from 'svelte/store';

export const page = readable({
  url: new URL('http://localhost:5180/pt'),
  params: { lang: 'pt' },
});
