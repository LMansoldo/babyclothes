import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Hero from './Hero.svelte';
import { waitlistEmail } from '../stores/waitlist-email';

describe('Hero', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    waitlistEmail.set('');
  });

  it('renders the translated headline', () => {
    render(Hero);
    expect(screen.getByText('Me diz o que seu bebê precisa,')).toBeInTheDocument();
    expect(screen.getByText('eu encontro no brechó perto de você')).toBeInTheDocument();
  });

  it('renders the concierge subheadline', () => {
    render(Hero);
    expect(
      screen.getByText(
        'Um assistente que vasculha brechós infantis da sua região e traz as melhores peças direto pra você — sem sair de casa.',
      ),
    ).toBeInTheDocument();
  });

  it('does not render the trust chips anymore', () => {
    render(Hero);
    expect(screen.queryByText('Lista de espera aberta')).toBeNull();
    expect(screen.queryByText('100% grátis')).toBeNull();
    expect(screen.queryByText('IA conversacional')).toBeNull();
  });

  it('does not render the hero photo anymore', () => {
    render(Hero);
    expect(screen.queryByAltText('Achadinhos com o match perfeito')).toBeNull();
  });

  it('renders an email input and a submit button with the quick-signup copy', () => {
    render(Hero);
    expect(screen.getByPlaceholderText('Seu melhor e-mail')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Quero encontrar peças pra meu bebê' }),
    ).toBeInTheDocument();
  });

  it('renders the "Acesso antecipado" badge above the email card', () => {
    render(Hero);
    expect(screen.getByText('Acesso antecipado')).toBeInTheDocument();
  });

  it('renders a disclaimer explaining the limited early signup', () => {
    render(Hero);
    expect(
      screen.getByText('Vagas limitadas. Cadastre-se e seja uma das primeiras a usar.'),
    ).toBeInTheDocument();
  });

  it('writes the typed email into the waitlistEmail store and scrolls to #waitlist on submit', async () => {
    render(Hero);

    const waitlistSection = document.createElement('section');
    waitlistSection.id = 'waitlist';
    const scrollSpy = vi.fn();
    waitlistSection.scrollIntoView = scrollSpy;
    document.body.appendChild(waitlistSection);

    const input = screen.getByPlaceholderText('Seu melhor e-mail');
    await fireEvent.input(input, { target: { value: 'ana@example.com' } });
    await fireEvent.click(
      screen.getByRole('button', { name: 'Quero encontrar peças pra meu bebê' }),
    );

    expect(get(waitlistEmail)).toBe('ana@example.com');
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(waitlistSection);
  });

  it('renders the pt chat mockup screenshot with a lazy-loaded, descriptive alt', () => {
    render(Hero);
    const img = screen.getByAltText(
      'Conversa no app: pedido de body 6-9 meses, 3 opções encontradas em brechós perto de você e reserva confirmada',
    );
    expect(img).toHaveAttribute('src', '/images/hero-chat-mockup-pt.webp');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
