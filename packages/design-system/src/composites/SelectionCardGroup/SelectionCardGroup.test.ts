import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SelectionCardGroup from './SelectionCardGroup.svelte';

const options = [
  { value: 'pf', label: 'Pessoa Fisica', description: 'Requer CPF.' },
  { value: 'pj', label: 'Pessoa Juridica', description: 'Requer CNPJ.' },
];

describe('SelectionCardGroup', () => {
  it('renders a labelled radiogroup with one radio per option', () => {
    render(SelectionCardGroup, { props: { options, ariaLabel: 'Escolha o seu perfil' } });
    expect(screen.getByRole('radiogroup', { name: 'Escolha o seu perfil' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('marks the option matching value as checked', () => {
    render(SelectionCardGroup, { props: { options, value: 'pj', ariaLabel: 'Perfil' } });
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('selects on click and notifies onchange', async () => {
    const onchange = vi.fn();
    render(SelectionCardGroup, { props: { options, ariaLabel: 'Perfil', onchange } });
    await fireEvent.click(screen.getByRole('radio', { name: /Pessoa Juridica/ }));
    expect(onchange).toHaveBeenCalledWith('pj');
  });

  it('moves selection with arrow keys, wrapping around', async () => {
    const onchange = vi.fn();
    render(SelectionCardGroup, { props: { options, value: 'pj', ariaLabel: 'Perfil', onchange } });
    const radios = screen.getAllByRole('radio');
    await fireEvent.keyDown(radios[1], { key: 'ArrowDown' });
    expect(onchange).toHaveBeenCalledWith('pf');
  });

  it('applies roving tabindex', () => {
    render(SelectionCardGroup, { props: { options, value: 'pj', ariaLabel: 'Perfil' } });
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
    expect(radios[1]).toHaveAttribute('tabindex', '0');
  });
});
