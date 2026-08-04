import '@testing-library/jest-dom';
import { initI18n } from './lib/i18n';
import { waitLocale } from 'svelte-i18n';

await initI18n('pt');
await waitLocale();
