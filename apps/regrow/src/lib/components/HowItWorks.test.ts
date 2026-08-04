import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks', () => {
  it('has id="como-funciona" so the topbar nav link resolves', () => {
    const { container } = render(HowItWorks);
    expect(container.querySelector('#como-funciona')).not.toBeNull();
  });

  it('renders all 3 step titles and descriptions', () => {
    render(HowItWorks);
    expect(screen.getByText('Conta o que precisa')).toBeInTheDocument();
    expect(screen.getByText('Fala com o assistente em linguagem natural')).toBeInTheDocument();
    expect(screen.getByText('Recebe sugestões')).toBeInTheDocument();
    expect(screen.getByText('Cards com fotos, preços e onde comprar')).toBeInTheDocument();
    expect(screen.getByText('Salva e volta quando quiser')).toBeInTheDocument();
    expect(screen.getByText('O app lembra de você e do seu filho')).toBeInTheDocument();
  });

  it('renders 3 step images, each lazy-loaded, with translated alt text', () => {
    render(HowItWorks);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    for (const img of images) {
      expect(img).toHaveAttribute('loading', 'lazy');
    }
    expect(screen.getByAltText('Pedindo bodies de inverno para a Sofia')).toBeInTheDocument();
    expect(screen.getByAltText('Sugestões de roupas de festa')).toBeInTheDocument();
    expect(screen.getByAltText('Sugestões por tamanho e fase')).toBeInTheDocument();
  });

  it('renders the translated two-line subtitle', () => {
    render(HowItWorks);
    expect(screen.getByText('Simples como conversar')).toBeInTheDocument();
    expect(screen.getByText('com uma amiga')).toBeInTheDocument();
  });
});
