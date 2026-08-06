import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppPreview from './AppPreview.svelte';

describe('AppPreview', () => {
  it('no longer renders the old "Veja o app em ação" title or caption', () => {
    render(AppPreview);
    expect(screen.queryByText('Veja o app em ação')).toBeNull();
    expect(screen.queryByText('Cards de produto renderizados direto na conversa')).toBeNull();
  });

  it('renders the "O que há de bom?" heading', () => {
    render(AppPreview);
    expect(screen.getByText('O que há de bom?')).toBeInTheDocument();
  });

  it('renders one lazy-loaded preview image', () => {
    render(AppPreview);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', '/images/preview-phone-mockup.webp');
  });

  it('renders the 3 feature items with their titles and texts', () => {
    render(AppPreview);
    expect(screen.getByText('Previsibilidade')).toBeInTheDocument();
    expect(
      screen.getByText(
        'O assistente prevê o crescimento das crianças para que você possa se planejar e conseguir as melhores peças.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Busca inteligente')).toBeInTheDocument();
    expect(
      screen.getByText(
        'As peças ideais são pesquisadas em lojas e brechós parceiros que não estão catalogados em sites de busca.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Economia e qualidade')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Apenas itens de bom estado com um bom preço são retornados, sem surpresas negativas.',
      ),
    ).toBeInTheDocument();
  });

  it('renders a CTA linking to #waitlist below the feature list', () => {
    render(AppPreview);
    const cta = screen.getByRole('link', { name: 'Cadastrar' });
    expect(cta).toHaveAttribute('href', '#waitlist');
  });
});
