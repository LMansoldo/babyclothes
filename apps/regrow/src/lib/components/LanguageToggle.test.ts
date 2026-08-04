import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/stores', () => {
  const { readable } = require('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost:5180/pt'), params: { lang: 'pt' } }),
  };
});

import LanguageToggle from './LanguageToggle.svelte';

describe('LanguageToggle', () => {
  it('links to the /en equivalent of the current /pt path', () => {
    render(LanguageToggle);
    const link = screen.getByRole('link', { name: 'EN' });
    expect(link).toHaveAttribute('href', '/en');
    expect(link).toHaveAttribute('hreflang', 'en');
  });
});
