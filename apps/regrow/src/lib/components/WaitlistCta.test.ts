import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WaitlistCta from './WaitlistCta.svelte';

describe('WaitlistCta', () => {
  it('renders as a link when href is provided', () => {
    render(WaitlistCta, { props: { label: 'Quero entrar na lista', href: '#waitlist' } });
    const link = screen.getByRole('link', { name: 'Quero entrar na lista' });
    expect(link).toHaveAttribute('href', '#waitlist');
  });

  it('renders as a submit button when no href is provided', () => {
    render(WaitlistCta, {
      props: { label: 'Quero entrar na lista de espera', type: 'submit', variant: 'form' },
    });
    const button = screen.getByRole('button', { name: 'Quero entrar na lista de espera' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('shows the arrow icon only for the hero variant', () => {
    const { container } = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'hero' },
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('omits the arrow icon for the topbar variant', () => {
    const { container } = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'topbar' },
    });
    expect(container.querySelector('svg')).toBeNull();
  });

  it('omits the shimmer element for the topbar variant but includes it for hero and form', () => {
    const topbar = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'topbar' },
    });
    expect(topbar.container.querySelector('.waitlist-cta__shimmer')).toBeNull();
    topbar.unmount();

    const hero = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'hero' },
    });
    expect(hero.container.querySelector('.waitlist-cta__shimmer')).not.toBeNull();
    hero.unmount();

    const form = render(WaitlistCta, {
      props: { label: 'CTA', type: 'submit', variant: 'form' },
    });
    expect(form.container.querySelector('.waitlist-cta__shimmer')).not.toBeNull();
  });
});
