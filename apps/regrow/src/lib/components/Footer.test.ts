import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Footer from './Footer.svelte';

describe('Footer', () => {
  it('renders the ReGrow wordmark', () => {
    render(Footer);
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Grow')).toBeInTheDocument();
  });

  it('renders privacy and terms links', () => {
    render(Footer);
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute(
      'href',
      '/privacy',
    );
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/terms');
  });

  it('renders a mailto contact link', () => {
    render(Footer);
    const contact = screen.getByRole('link', { name: 'contato@regrow.com.br' });
    expect(contact).toHaveAttribute('href', 'mailto:contato@regrow.com.br');
  });

  it('renders an Instagram link', () => {
    render(Footer);
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://instagram.com/regrowapp',
    );
  });

  it('renders the copyright line with the current year range starting at 2026', () => {
    render(Footer);
    expect(screen.getByText(/© 2026 ReGrow/)).toBeInTheDocument();
  });
});
