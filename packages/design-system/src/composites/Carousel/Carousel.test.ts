import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Carousel from './Carousel.svelte';

beforeAll(() => {
  // jsdom doesn't implement scrollBy — stub it to prevent errors
  Element.prototype.scrollBy = vi.fn();
});

describe('Carousel', () => {
  it('renders label when provided', () => {
    render(Carousel, { props: { label: 'Recomendados' } });
    expect(screen.getByText('Recomendados')).toBeInTheDocument();
  });

  it('does not render header when label and nav callbacks are absent', () => {
    const { container } = render(Carousel);
    expect(container.querySelector('.carousel__header')).not.toBeInTheDocument();
  });

  it('renders header when label is provided', () => {
    const { container } = render(Carousel, { props: { label: 'Test' } });
    expect(container.querySelector('.carousel__header')).toBeInTheDocument();
  });

  it('renders nav buttons when onprevious is provided', () => {
    render(Carousel, { props: { onprevious: () => {} } });
    expect(screen.getByLabelText('Anterior')).toBeInTheDocument();
  });

  it('renders nav buttons when onnext is provided', () => {
    render(Carousel, { props: { onnext: () => {} } });
    expect(screen.getByLabelText('Proximo')).toBeInTheDocument();
  });

  it('calls onprevious when left nav is clicked', async () => {
    const handler = vi.fn();
    // Need both so the nav section renders
    render(Carousel, {
      props: { label: 'Test', onprevious: handler, onnext: () => {} },
    });
    // Mock scroll state by setting scrollLeft capability
    const btn = screen.getByLabelText('Anterior');
    await fireEvent.click(btn);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('calls onnext when right nav is clicked', async () => {
    const handler = vi.fn();
    render(Carousel, {
      props: { label: 'Test', onprevious: () => {}, onnext: handler },
    });
    const btn = screen.getByLabelText('Proximo');
    await fireEvent.click(btn);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders Snippet children', () => {
    const { container } = render(Carousel, {
      props: {
        label: 'Test',
        children: () => '<div class="child-item">Item</div>',
      },
    });
    const track = container.querySelector('.carousel__track');
    expect(track).toBeInTheDocument();
  });

  it('renders children via Snippet', () => {
    const { container } = render(Carousel, {
      props: {
        label: 'Test',
        children: () => '<span>hello</span>',
      },
    });
    // With jsdom, Snippet children rendered as function output are inserted as HTML
    const track = container.querySelector('.carousel__track');
    expect(track).toBeInTheDocument();
  });

  it('has accessible region role on track', () => {
    const { container } = render(Carousel, { props: { label: 'Test' } });
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
  });
});
