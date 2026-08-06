import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks', () => {
  it('has id="como-funciona" so the topbar nav link resolves', () => {
    const { container } = render(HowItWorks);
    expect(container.querySelector('#como-funciona')).not.toBeNull();
  });

  it('renders all 3 capability titles and descriptions', () => {
    render(HowItWorks);
    expect(screen.getByText('Encontra roupas de brechó')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Busca peças em brechós e lojas parceiras com preços competitivos para o seu bebê.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Monta o enxoval ideal')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Monta o enxoval completo de acordo com o tempo de gestação, sem faltar nem sobrar nada.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Prevê a próxima troca de tamanho')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Acompanha o crescimento da criança e avisa quando está na hora de trocar de tamanho.',
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
    expect(screen.getByText('Um assistente pessoal')).toBeInTheDocument();
    expect(screen.getByText('para o enxoval do seu bebê')).toBeInTheDocument();
  });
});
