import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ChildInlineForm from './ChildInlineForm.svelte'

const labels = {
  name: 'Child name',
  ageMonths: 'Age',
  currentHeight: 'Height',
  currentWeight: 'Weight',
  birthHeight: 'Birth height',
  birthWeight: 'Birth weight',
  submit: 'Save',
}

describe('ChildInlineForm', () => {
  it('renders all form fields', () => {
    render(ChildInlineForm, { props: { submitLabel: 'Save', labels } })
    expect(screen.getByLabelText('Child name')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByLabelText('Height')).toBeInTheDocument()
    expect(screen.getByLabelText('Weight')).toBeInTheDocument()
    expect(screen.getByLabelText('Birth height')).toBeInTheDocument()
    expect(screen.getByLabelText('Birth weight')).toBeInTheDocument()
  })

  it('renders the submit button with label', () => {
    render(ChildInlineForm, { props: { submitLabel: 'Save', labels } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('pre-fills fields with initial values', () => {
    render(ChildInlineForm, {
      props: {
        submitLabel: 'Save',
        labels,
        initial: { name: 'Sofia', ageMonths: '6' },
      },
    })
    expect(screen.getByLabelText('Child name')).toHaveValue('Sofia')
    expect(screen.getByLabelText('Age')).toHaveValue(6)
  })

  it('calls onSubmit with form values', async () => {
    const onSubmit = vi.fn()
    render(ChildInlineForm, { props: { submitLabel: 'Save', labels, onSubmit } })
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: '',
      ageMonths: '',
      currentHeightCm: '',
      currentWeightKg: '',
      birthHeightCm: '',
      birthWeightG: '',
    })
  })

  it('does not call onSubmit when loading', async () => {
    const onSubmit = vi.fn()
    render(ChildInlineForm, { props: { submitLabel: 'Save', labels, onSubmit, loading: true } })
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('disables inputs when loading', () => {
    render(ChildInlineForm, { props: { submitLabel: 'Save', labels, loading: true } })
    expect(screen.getByLabelText('Child name')).toBeDisabled()
    expect(screen.getByLabelText('Age')).toBeDisabled()
  })

  it('renders unit suffixes', () => {
    render(ChildInlineForm, { props: { submitLabel: 'Save', labels } })
    const suffixes = document.querySelectorAll('.childinlineform__suffix')
    expect(suffixes.length).toBeGreaterThan(0)
    expect(suffixes[0]).toHaveTextContent('months')
  })

  it('uses custom units when provided', () => {
    render(ChildInlineForm, {
      props: {
        submitLabel: 'Save',
        labels,
        units: { age: 'meses', height: 'cm', weight: 'kg', birthWeight: 'g' },
      },
    })
    const suffixes = document.querySelectorAll('.childinlineform__suffix')
    expect(suffixes[0]).toHaveTextContent('meses')
  })

  it('renders a form element', () => {
    const { container } = render(ChildInlineForm, { props: { submitLabel: 'Save', labels } })
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('sets numeric inputmode on number fields', () => {
    render(ChildInlineForm, { props: { submitLabel: 'Save', labels } })
    expect(screen.getByLabelText('Age')).toHaveAttribute('inputmode', 'numeric')
  })
})
