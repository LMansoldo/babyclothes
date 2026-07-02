import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Spinner from './Spinner.svelte';

describe('Spinner', () => {
  it('renders spinner element', () => {
    render(Spinner);
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(Spinner);
    expect(document.querySelector('[aria-label="Carregando"]')).toBeInTheDocument();
  });

  it('applies size=sm class by default', () => {
    render(Spinner, { props: { size: 'sm' } });
    expect(document.querySelector('.spinner')).toHaveClass('spinner--sm');
  });

  it('applies size=md class', () => {
    render(Spinner, { props: { size: 'md' } });
    expect(document.querySelector('.spinner')).toHaveClass('spinner--md');
  });

  it('applies size=lg class', () => {
    render(Spinner, { props: { size: 'lg' } });
    expect(document.querySelector('.spinner')).toHaveClass('spinner--lg');
  });

  it('applies variant=default class by default', () => {
    render(Spinner);
    expect(document.querySelector('.spinner')).toHaveClass('spinner--default');
  });

  it('applies variant=pk class', () => {
    render(Spinner, { props: { variant: 'pk' } });
    expect(document.querySelector('.spinner')).toHaveClass('spinner--pk');
  });

  it('applies variant=inv class', () => {
    render(Spinner, { props: { variant: 'inv' } });
    expect(document.querySelector('.spinner')).toHaveClass('spinner--inv');
  });
});
