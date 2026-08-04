import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppPreview from './AppPreview.svelte';

describe('AppPreview', () => {
  it('renders the translated title and caption', () => {
    render(AppPreview);
    expect(screen.getByText('Veja o app em ação')).toBeInTheDocument();
    expect(
      screen.getByText('Cards de produto renderizados direto na conversa'),
    ).toBeInTheDocument();
  });

  it('renders one lazy-loaded preview image', () => {
    render(AppPreview);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', '/images/screen-party.png');
  });
});
