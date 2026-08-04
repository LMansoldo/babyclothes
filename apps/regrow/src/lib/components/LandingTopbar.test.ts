import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LandingTopbar from './LandingTopbar.svelte';

describe('LandingTopbar', () => {
  it('renders the ReGrow wordmark as two segments', () => {
    render(LandingTopbar);
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Grow')).toBeInTheDocument();
  });

  it('renders a "Como funciona" nav link pointing to #como-funciona', () => {
    render(LandingTopbar);
    const link = screen.getByRole('link', { name: 'Como funciona' });
    expect(link).toHaveAttribute('href', '#como-funciona');
  });

  it('renders the waitlist CTA link pointing to #waitlist', () => {
    render(LandingTopbar);
    const cta = screen.getByRole('link', { name: 'Quero entrar na lista' });
    expect(cta).toHaveAttribute('href', '#waitlist');
  });

  it('does not render a login link', () => {
    render(LandingTopbar);
    expect(screen.queryByText(/entrar$/i)).toBeNull();
  });
});
