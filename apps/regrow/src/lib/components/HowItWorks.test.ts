import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks', () => {
  it('has id="como-funciona" so the topbar nav link resolves', () => {
    const { container } = render(HowItWorks);
    expect(container.querySelector('#como-funciona')).not.toBeNull();
  });

  it('renders all 3 concierge step titles and descriptions', () => {
    render(HowItWorks);
    expect(screen.getByText('Descreva o que precisa')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Diga o que está buscando — tipo, tamanho, faixa de preço, qualquer detalhe. Como se estivesse pedindo pra uma amiga.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('O assistente vasculha os brechós')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nossa IA pesquisa em brechós e lojas infantis da sua região — inclusive os que não têm site nem loja online.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Receba as melhores opções no chat')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Você recebe sugestões com preço, estado da peça e localização. É só escolher e retirar.',
      ),
    ).toBeInTheDocument();
  });

  it('does not render any step screenshots anymore', () => {
    render(HowItWorks);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('renders a decorative icon for each capability', () => {
    const { container } = render(HowItWorks);
    expect(container.querySelectorAll('.how__icon')).toHaveLength(3);
  });

  it('uses the icons8 SVG asset for each capability, in order', () => {
    const { container } = render(HowItWorks);
    const srcs = Array.from(container.querySelectorAll('.how__icon')).map((img) =>
      img.getAttribute('src'),
    );
    expect(srcs).toEqual([
      '/images/icons8-onesies-48.svg',
      '/images/icons8-baby-calendar-48.svg',
      '/images/icons8-baby-feet-48.svg',
    ]);
  });

  it('renders the translated two-line heading', () => {
    render(HowItWorks);
    expect(screen.getByText('Seu concierge de brechó')).toBeInTheDocument();
    expect(screen.getByText('em 3 passos')).toBeInTheDocument();
  });
});
