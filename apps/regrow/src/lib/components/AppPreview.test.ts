import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppPreview from './AppPreview.svelte';

describe('AppPreview', () => {
  it('renders the "Por que usar o ReGrow?" heading', () => {
    render(AppPreview);
    expect(screen.getByText('Por que usar o ReGrow?')).toBeInTheDocument();
  });

  it('renders one lazy-loaded preview image', () => {
    render(AppPreview);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', '/images/screen-size.webp');
  });

  it('renders the 4 feature items with their titles and texts', () => {
    render(AppPreview);
    expect(screen.getByText('Brechós invisíveis, agora acessíveis')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A maioria dos brechós infantis não tem site. O ReGrow é o único jeito de encontrar essas peças sem sair visitando loja por loja.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Previsão de crescimento')).toBeInTheDocument();
    expect(
      screen.getByText(
        'O assistente acompanha o crescimento do seu filho e avisa quando é hora de buscar o próximo tamanho antes que aperte.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Economia real')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Peças de qualidade por uma fração do preço. Enxoval completo por até 70% menos do que comprar tudo novo.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Sustentável por natureza')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cada peça reutilizada é menos uma no lixo. Vestir seu bebê bem e cuidar do planeta não precisa ser uma escolha.',
      ),
    ).toBeInTheDocument();
  });

  it('renders a CTA linking to #waitlist below the feature list', () => {
    render(AppPreview);
    const cta = screen.getByRole('link', { name: 'Quero experimentar' });
    expect(cta).toHaveAttribute('href', '#waitlist');
  });
});
