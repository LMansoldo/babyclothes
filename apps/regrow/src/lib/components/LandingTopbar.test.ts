import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LandingTopbar from './LandingTopbar.svelte';

describe('LandingTopbar', () => {
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('renders the ReGrow wordmark as two segments', () => {
    render(LandingTopbar);
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Grow')).toBeInTheDocument();
  });

  it('does not render a login link', () => {
    render(LandingTopbar);
    expect(screen.queryByText(/entrar$/i)).toBeNull();
  });

  it('does not render the "Como funciona" nav link anymore', () => {
    render(LandingTopbar);
    expect(screen.queryByRole('link', { name: 'Como funciona' })).toBeNull();
  });

  it('does not render the waitlist CTA anymore', () => {
    render(LandingTopbar);
    expect(screen.queryByRole('link', { name: 'Cadastrar' })).toBeNull();
  });

  it('is transparent (not scrolled) before any scroll happens', () => {
    const { container } = render(LandingTopbar);
    expect(container.querySelector('.landing-topbar')).not.toHaveClass('landing-topbar--scrolled');
  });

  it('adds the scrolled class once the page scrolls down', async () => {
    const { container } = render(LandingTopbar);
    Object.defineProperty(window, 'scrollY', { value: 20, configurable: true });
    await fireEvent.scroll(window);
    expect(container.querySelector('.landing-topbar')).toHaveClass('landing-topbar--scrolled');
  });

  it('removes the scrolled class again after scrolling back to the top', async () => {
    const { container } = render(LandingTopbar);
    Object.defineProperty(window, 'scrollY', { value: 20, configurable: true });
    await fireEvent.scroll(window);
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    await fireEvent.scroll(window);
    expect(container.querySelector('.landing-topbar')).not.toHaveClass('landing-topbar--scrolled');
  });
});
