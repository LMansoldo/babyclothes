import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Button from './Button.svelte'

describe('Button', () => {
  it('renders with default props', () => {
    render(Button, { props: { label: 'Clique' } })
    expect(screen.getByRole('button', { name: 'Clique' })).toBeInTheDocument()
  })

  it('applies variant=primary class', () => {
    render(Button, { props: { label: 'OK', variant: 'primary' } })
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('btn--primary')
  })

  it('applies variant=pk class', () => {
    render(Button, { props: { label: 'OK', variant: 'pk' } })
    expect(screen.getByRole('button')).toHaveClass('btn--pk')
  })

  it('applies variant=secondary class', () => {
    render(Button, { props: { label: 'OK', variant: 'secondary' } })
    expect(screen.getByRole('button')).toHaveClass('btn--secondary')
  })

  it('applies variant=ghost class', () => {
    render(Button, { props: { label: 'OK', variant: 'ghost' } })
    expect(screen.getByRole('button')).toHaveClass('btn--ghost')
  })

  it('applies variant=ghost-pk class', () => {
    render(Button, { props: { label: 'OK', variant: 'ghost-pk' } })
    expect(screen.getByRole('button')).toHaveClass('btn--ghost-pk')
  })

  it('applies variant=primary-inv class', () => {
    render(Button, { props: { label: 'OK', variant: 'primary-inv' } })
    expect(screen.getByRole('button')).toHaveClass('btn--primary-inv')
  })

  it('applies variant=ghost-inv class', () => {
    render(Button, { props: { label: 'OK', variant: 'ghost-inv' } })
    expect(screen.getByRole('button')).toHaveClass('btn--ghost-inv')
  })

  it('applies size=sm class', () => {
    render(Button, { props: { label: 'OK', size: 'sm' } })
    expect(screen.getByRole('button')).toHaveClass('btn--sm')
  })

  it('applies size=lg class', () => {
    render(Button, { props: { label: 'OK', size: 'lg' } })
    expect(screen.getByRole('button')).toHaveClass('btn--lg')
  })

  it('shows spinner when loading=true', () => {
    render(Button, { props: { label: 'OK', loading: true } })
    expect(screen.getByRole('button').querySelector('.btn__spinner')).toBeTruthy()
  })

  it('is disabled when disabled=true', () => {
    render(Button, { props: { label: 'OK', disabled: true } })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading=true', () => {
    render(Button, { props: { label: 'OK', loading: true } })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onclick when clicked', async () => {
    const handler = vi.fn()
    render(Button, { props: { label: 'Clique', onclick: handler } })
    await fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call onclick when disabled', async () => {
    const handler = vi.fn()
    render(Button, { props: { label: 'Clique', disabled: true, onclick: handler } })
    await fireEvent.click(screen.getByRole('button'))
    expect(handler).not.toHaveBeenCalled()
  })
})
