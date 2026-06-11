import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Avatar from './Avatar.svelte'

describe('Avatar', () => {
  it('renders avatar element', () => {
    render(Avatar, { props: { name: 'Sofia' } })
    expect(document.querySelector('.avatar')).toBeInTheDocument()
  })

  it('shows image when src is provided', () => {
    render(Avatar, { props: { name: 'Sofia', src: 'https://example.com/sofia.jpg' } })
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('shows initials when no src', () => {
    render(Avatar, { props: { name: 'Sofia Lima' } })
    expect(screen.getByText('SL')).toBeInTheDocument()
  })

  it('shows single initial for single name', () => {
    render(Avatar, { props: { name: 'Sofia' } })
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('applies size=sm class', () => {
    render(Avatar, { props: { name: 'Sofia', size: 'sm' } })
    expect(document.querySelector('.avatar')).toHaveClass('avatar--sm')
  })

  it('applies size=md class by default', () => {
    render(Avatar, { props: { name: 'Sofia' } })
    expect(document.querySelector('.avatar')).toHaveClass('avatar--md')
  })

  it('applies size=lg class', () => {
    render(Avatar, { props: { name: 'Sofia', size: 'lg' } })
    expect(document.querySelector('.avatar')).toHaveClass('avatar--lg')
  })

  it('applies size=xl class', () => {
    render(Avatar, { props: { name: 'Sofia', size: 'xl' } })
    expect(document.querySelector('.avatar')).toHaveClass('avatar--xl')
  })

  it('applies fill=pk class', () => {
    render(Avatar, { props: { name: 'Sofia', fill: 'pk' } })
    expect(document.querySelector('.avatar')).toHaveClass('avatar--pk')
  })

  it('applies fill=bk class', () => {
    render(Avatar, { props: { name: 'Sofia', fill: 'bk' } })
    expect(document.querySelector('.avatar')).toHaveClass('avatar--bk')
  })

  it('applies fill=of class', () => {
    render(Avatar, { props: { name: 'Sofia', fill: 'of' } })
    expect(document.querySelector('.avatar')).toHaveClass('avatar--of')
  })

  it('shows online ring when online=true', () => {
    render(Avatar, { props: { name: 'Sofia', online: true } })
    expect(document.querySelector('.avatar__online-ring')).toBeInTheDocument()
  })

  it('does not show online ring when online=false', () => {
    render(Avatar, { props: { name: 'Sofia', online: false } })
    expect(document.querySelector('.avatar__online-ring')).not.toBeInTheDocument()
  })

  it('shows verified badge when verified=true', () => {
    render(Avatar, { props: { name: 'Sofia', verified: true } })
    expect(document.querySelector('.avatar__verified')).toBeInTheDocument()
  })
})
