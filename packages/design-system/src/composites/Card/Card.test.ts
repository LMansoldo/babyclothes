import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Card from './Card.svelte';

describe('Card', () => {
  it('renders title', () => {
    render(Card, { props: { title: 'Macacão Floral' } });
    expect(screen.getByText('Macacão Floral')).toBeInTheDocument();
  });

  it('renders detail when provided', () => {
    render(Card, { props: { title: 'Test', detail: 'Tamanho P' } });
    expect(screen.getByText('Tamanho P')).toBeInTheDocument();
  });

  it('does not render detail when not provided', () => {
    const { container } = render(Card, { props: { title: 'Test' } });
    expect(container.querySelector('.card__detail')).not.toBeInTheDocument();
  });

  it('renders price when provided', () => {
    render(Card, { props: { title: 'Test', price: 'R$ 89,00' } });
    expect(screen.getByText('R$ 89,00')).toBeInTheDocument();
  });

  it('does not render price when not provided', () => {
    const { container } = render(Card, { props: { title: 'Test' } });
    expect(container.querySelector('.card__price')).not.toBeInTheDocument();
  });

  it('renders old price when provided with price', () => {
    render(Card, { props: { title: 'Test', price: 'R$ 89,00', oldPrice: 'R$ 120,00' } });
    expect(screen.getByText('R$ 120,00')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(Card, { props: { title: 'Test', badge: 'IA' } });
    expect(screen.getByText('IA')).toBeInTheDocument();
  });

  it('does not render badge when not provided', () => {
    const { container } = render(Card, { props: { title: 'Test' } });
    expect(container.querySelector('.card__badge')).not.toBeInTheDocument();
  });

  it('renders condition when provided', () => {
    render(Card, { props: { title: 'Test', condition: 'Novo' } });
    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    const { container } = render(Card, {
      props: { title: 'Test', image: 'https://example.com/img.jpg' },
    });
    const img = container.querySelector('.card__image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('shows placeholder when no image provided', () => {
    const { container } = render(Card, { props: { title: 'Test' } });
    expect(container.querySelector('.card__image-placeholder')).toBeInTheDocument();
    expect(container.querySelector('.card__image')).not.toBeInTheDocument();
  });

  it('applies size=sm class', () => {
    const { container } = render(Card, { props: { title: 'Test', size: 'sm' } });
    expect(container.querySelector('.card')).toHaveClass('card--sm');
  });

  it('applies size=md class by default', () => {
    const { container } = render(Card, { props: { title: 'Test' } });
    expect(container.querySelector('.card')).toHaveClass('card--md');
  });

  it('applies size=lg class', () => {
    const { container } = render(Card, { props: { title: 'Test', size: 'lg' } });
    expect(container.querySelector('.card')).toHaveClass('card--lg');
  });

  it('renders oldPrice only when price is also provided', () => {
    const { container } = render(Card, {
      props: { title: 'Test', oldPrice: 'R$ 120,00' },
    });
    expect(container.querySelector('.card__old-price')).not.toBeInTheDocument();
  });
});
