import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Hero from './Hero.svelte';

describe('Hero', () => {
  it('renders the translated headline', () => {
    render(Hero);
    expect(screen.getByText('Achadinhos com o')).toBeInTheDocument();
    expect(screen.getByText('match perfeito')).toBeInTheDocument();
  });

  it('renders the translated sub-headline', () => {
    render(Hero);
    expect(
      screen.getByText(
        'O assistente gratuito que encontra roupinhas e acessórios acompanhando todo o crescimento dos nossos pequenos',
      ),
    ).toBeInTheDocument();
  });

  it('renders the CTA anchored to #waitlist', () => {
    render(Hero);
    const cta = screen.getByRole('link', { name: 'Quero entrar na lista' });
    expect(cta).toHaveAttribute('href', '#waitlist');
  });

  it('renders the hero image with fetchpriority high and no lazy loading', () => {
    render(Hero);
    const img = screen.getByAltText('Achadinhos com o match perfeito');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  it('sets explicit width and height on the hero image to prevent CLS', () => {
    render(Hero);
    const img = screen.getByAltText('Achadinhos com o match perfeito');
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
  });
});
