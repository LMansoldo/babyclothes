import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SelectionCard from './SelectionCard.svelte';

function iconSnippet(): string {
  return '<svg></svg>';
}

describe('SelectionCard', () => {
  it('renders title and description', () => {
    render(SelectionCard, {
      props: { title: 'Pessoa Fisica', description: 'Requer CPF.' },
    });
    expect(screen.getByText('Pessoa Fisica')).toBeInTheDocument();
    expect(screen.getByText('Requer CPF.')).toBeInTheDocument();
  });

  it('is a radio button reflecting the selected state', () => {
    render(SelectionCard, { props: { title: 'PF', selected: true } });
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });

  it('shows the checkmark only when selected', () => {
    const { container, rerender } = render(SelectionCard, {
      props: { title: 'PF', selected: false },
    });
    expect(container.querySelector('.selectioncard__check')).not.toBeInTheDocument();
    rerender({ title: 'PF', selected: true });
    expect(container.querySelector('.selectioncard__check')).toBeInTheDocument();
  });

  it('applies the icon tone modifier when icon is provided', () => {
    const { container } = render(SelectionCard, {
      props: { title: 'PF', iconTone: 'brand' as const, icon: iconSnippet as never },
    });
    expect(container.querySelector('.selectioncard__icon--brand')).toBeInTheDocument();
  });

  it('calls onclick when clicked', async () => {
    const onclick = vi.fn();
    render(SelectionCard, { props: { title: 'PF', onclick } });
    await fireEvent.click(screen.getByRole('radio'));
    expect(onclick).toHaveBeenCalledOnce();
  });
});
