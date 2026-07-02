import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ItemList from './ItemList.svelte';

describe('ItemList', () => {
  it('renders label when provided', () => {
    render(ItemList, { props: { label: 'Produtos' } });
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });

  it('does not render header when label is absent', () => {
    const { container } = render(ItemList);
    expect(container.querySelector('.item-list__header')).not.toBeInTheDocument();
  });

  it('renders count badge when count is provided', () => {
    render(ItemList, { props: { label: 'Produtos', count: 12 } });
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('does not render count badge when count is not provided', () => {
    const { container } = render(ItemList, { props: { label: 'Produtos' } });
    expect(container.querySelector('.item-list__count')).not.toBeInTheDocument();
  });

  it('applies grid layout class by default', () => {
    const { container } = render(ItemList, { props: { label: 'Test' } });
    expect(container.querySelector('.item-list__track')).toHaveClass('item-list__track--grid');
  });

  it('applies list layout class when layout=list', () => {
    const { container } = render(ItemList, { props: { label: 'Test', layout: 'list' } });
    expect(container.querySelector('.item-list__track')).toHaveClass('item-list__track--list');
  });

  it('renders Snippet children', () => {
    const { container } = render(ItemList, {
      props: {
        label: 'Test',
        children: () => '<div class="card">Item</div>',
      },
    });
    const track = container.querySelector('.item-list__track');
    expect(track).toBeInTheDocument();
  });

  it('renders children via Snippet with content', () => {
    const { container } = render(ItemList, {
      props: {
        label: 'Test',
        children: () => '<span>hello</span>',
      },
    });
    const track = container.querySelector('.item-list__track');
    expect(track).toBeInTheDocument();
  });

  it('renders with both label and count', () => {
    render(ItemList, { props: { label: 'Categorias', count: 5 } });
    expect(screen.getByText('Categorias')).toBeInTheDocument();
    const countEl = screen.getByText('5');
    expect(countEl).toHaveClass('item-list__count');
  });

  it('renders nothing in track when no children', () => {
    const { container } = render(ItemList, { props: { label: 'Test' } });
    const track = container.querySelector('.item-list__track');
    expect(track?.children.length ?? 0).toBe(0);
  });
});
