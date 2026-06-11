import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Input from './Input.svelte'

describe('Input', () => {
  it('renders an input element', () => {
    render(Input, { props: { id: 'email' } })
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(Input, { props: { id: 'email', label: 'E-mail' } })
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('renders hint text', () => {
    render(Input, { props: { id: 'email', hint: 'Use seu e-mail de acesso' } })
    expect(screen.getByText('Use seu e-mail de acesso')).toBeInTheDocument()
  })

  it('renders error message and applies error class', () => {
    render(Input, { props: { id: 'email', error: 'E-mail inválido' } })
    expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
    expect(screen.getByRole('textbox').closest('.input-wrapper')).toHaveClass('input-wrapper--error')
  })

  it('renders success message and applies success class', () => {
    render(Input, { props: { id: 'email', success: 'E-mail verificado' } })
    expect(screen.getByText('E-mail verificado')).toBeInTheDocument()
    expect(screen.getByRole('textbox').closest('.input-wrapper')).toHaveClass('input-wrapper--success')
  })

  it('renders prefix text', () => {
    render(Input, { props: { id: 'price', prefix: 'R$' } })
    expect(screen.getByText('R$')).toBeInTheDocument()
  })

  it('renders type=password with toggle button', () => {
    render(Input, { props: { id: 'pw', type: 'password' } })
    expect(screen.getByRole('button', { name: /mostrar/i })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    render(Input, { props: { id: 'pw', type: 'password' } })
    const input = document.querySelector('input')!
    expect(input.type).toBe('password')
    await fireEvent.click(screen.getByRole('button', { name: /mostrar/i }))
    expect(input.type).toBe('text')
  })

  it('calls oninput callback', async () => {
    const handler = vi.fn()
    render(Input, { props: { id: 'name', oninput: handler } })
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'Sofia' } })
    expect(handler).toHaveBeenCalled()
  })

  it('passes placeholder prop', () => {
    render(Input, { props: { id: 'search', placeholder: 'Buscar...' } })
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('renders suffix button when suffixLabel is provided', () => {
    render(Input, { props: { id: 'search', suffixLabel: 'Buscar' } })
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  })
})
