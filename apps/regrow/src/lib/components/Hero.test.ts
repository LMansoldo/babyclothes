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
    expect(screen.getByText('Achadinhos com o')).toBeInTheDocument();
    expect(screen.getByText('match perfeito')).toBeInTheDocument();
  });

  it('does not render a sub-headline anymore', () => {
    render(Hero);
    expect(
      screen.queryByText(
        'O assistente gratuito que encontra roupinhas e acessórios acompanhando todo o crescimento dos nossos pequenos',
      ),
    ).toBeNull();
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
      screen.getByRole('button', { name: 'Cadastre-se para economizar' }),
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
    await fireEvent.click(screen.getByRole('button', { name: 'Cadastre-se para economizar' }));

    expect(get(waitlistEmail)).toBe('ana@example.com');
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(waitlistSection);
  });

  it('renders 3 product cards, all marked with the Seminovo condition', () => {
    render(Hero);
    expect(screen.getAllByText('Seminovo')).toHaveLength(3);
  });

  it('renders the featured card with contact and buy actions', () => {
    render(Hero);
    expect(screen.getByRole('button', { name: 'Contatar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comprar' })).toBeInTheDocument();
  });

  it('renders old prices on the two secondary cards', () => {
    render(Hero);
    expect(screen.getByText('R$ 39,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 68,00')).toBeInTheDocument();
  });

  it('scrolls to #waitlist when the buy button on the featured card is clicked', async () => {
    render(Hero);

    const waitlistSection = document.createElement('section');
    waitlistSection.id = 'waitlist';
    const scrollSpy = vi.fn();
    waitlistSection.scrollIntoView = scrollSpy;
    document.body.appendChild(waitlistSection);

    await fireEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(waitlistSection);
  });
});
