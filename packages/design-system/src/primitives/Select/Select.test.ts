import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Select from './Select.svelte';
import type { SelectOption } from './Select.svelte';

const options: SelectOption[] = [
  { value: 'SP', label: 'Sao Paulo' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'MG', label: 'Minas Gerais' },
];

describe('Select', () => {
  it('renders a select element', () => {
    render(Select, { props: { id: 'uf', options } });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(Select, { props: { id: 'uf', options, label: 'Estado' } });
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(Select, { props: { id: 'uf', options } });
    const selectEl = screen.getByRole('combobox');
    expect(selectEl.options.length).toBe(3);
    expect(selectEl.options[0].textContent).toBe('Sao Paulo');
    expect(selectEl.options[1].textContent).toBe('Rio de Janeiro');
    expect(selectEl.options[2].textContent).toBe('Minas Gerais');
  });

  it('renders placeholder as disabled option', () => {
    render(Select, {
      props: { id: 'uf', options, placeholder: 'Selecione o estado' },
    });
    const selectEl = screen.getByRole('combobox') as HTMLSelectElement;
    const firstOption = selectEl.options[0];
    expect(firstOption.textContent).toBe('Selecione o estado');
    expect(firstOption.disabled).toBe(true);
    expect(firstOption.value).toBe('');
  });

  it('binds value and triggers onchange on selection', async () => {
    const onchange = vi.fn();
    render(Select, {
      props: { id: 'uf', options, onchange },
    });
    const selectEl = screen.getByRole('combobox');
    await fireEvent.change(selectEl, { target: { value: 'RJ' } });
    expect(onchange).toHaveBeenCalledWith('RJ');
  });

  it('renders error message and applies error class', () => {
    render(Select, {
      props: { id: 'uf', options, error: 'Campo obrigatorio' },
    });
    expect(screen.getByText('Campo obrigatorio')).toBeInTheDocument();
    expect(screen.getByRole('combobox').closest('.select__wrapper')).toHaveClass(
      'select__wrapper--error',
    );
  });

  it('renders hint text', () => {
    render(Select, {
      props: { id: 'uf', options, hint: 'Escolha um estado' },
    });
    expect(screen.getByText('Escolha um estado')).toBeInTheDocument();
  });

  it('disables interaction when disabled is true', () => {
    render(Select, {
      props: { id: 'uf', options, disabled: true },
    });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('passes name attribute to the native select', () => {
    render(Select, { props: { id: 'uf', options, name: 'state' } });
    expect(screen.getByRole('combobox')).toHaveAttribute('name', 'state');
  });

  it('omits name when not provided', () => {
    render(Select, { props: { id: 'uf', options } });
    expect(screen.getByRole('combobox')).not.toHaveAttribute('name');
  });
});
