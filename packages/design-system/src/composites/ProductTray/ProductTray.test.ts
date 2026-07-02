import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ProductTray from './ProductTray.svelte'

describe('ProductTray', () => {
  it('renders title', () => {
    render(ProductTray, { props: { title: 'Macacão Bebê' } })
    expect(screen.getByText('Macacão Bebê')).toBeInTheDocument()
  })

  it('renders price in pink', () => {
    render(ProductTray, { props: { title: 'Test', price: 'R$ 89,90' } })
    const price = screen.getByText('R$ 89,90')
    expect(price).toBeInTheDocument()
    expect(price).toHaveClass('product-tray__price-current')
  })

  it('renders old price with line-through', () => {
    render(ProductTray, {
      props: { title: 'Test', price: 'R$ 49,90', oldPrice: 'R$ 69,90' },
    })
    const oldPrice = screen.getByText('R$ 69,90')
    expect(oldPrice).toBeInTheDocument()
    expect(oldPrice).toHaveClass('product-tray__price-old')
  })

  it('renders condition badge with correct variant', () => {
    render(ProductTray, { props: { title: 'Test', condition: 'Novo' } })
    const badge = screen.getByText('Novo')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('product-tray__badge--new')
  })

  it('renders Seminovo badge', () => {
    render(ProductTray, { props: { title: 'Test', condition: 'Seminovo' } })
    const badge = screen.getByText('Seminovo')
    expect(badge).toHaveClass('product-tray__badge--semi')
  })

  it('renders Usado badge', () => {
    render(ProductTray, { props: { title: 'Test', condition: 'Usado' } })
    const badge = screen.getByText('Usado')
    expect(badge).toHaveClass('product-tray__badge--used')
  })

  it('renders size label badge', () => {
    render(ProductTray, { props: { title: 'Test', sizeLabel: 'Tam. 6M' } })
    expect(screen.getByText('Tam. 6M')).toBeInTheDocument()
  })

  it('renders gender label badge', () => {
    render(ProductTray, { props: { title: 'Test', genderLabel: 'Menina' } })
    expect(screen.getByText('Menina')).toBeInTheDocument()
  })

  it('renders seller name', () => {
    render(ProductTray, { props: { title: 'Test', sellerName: 'Ana Silva' } })
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
  })

  it('renders seller avatar image', () => {
    render(ProductTray, {
      props: { title: 'Test', sellerName: 'Ana', sellerAvatar: 'https://example.com/avatar.jpg' },
    })
    const img = screen.getByAltText('Ana')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders verified badge when verified=true', () => {
    const { container } = render(ProductTray, {
      props: { title: 'Test', sellerName: 'Ana', verified: true },
    })
    const verified = container.querySelector('.product-tray__seller-verified')
    expect(verified).toBeInTheDocument()
  })

  it('does not render verified badge when verified=false', () => {
    const { container } = render(ProductTray, {
      props: { title: 'Test', sellerName: 'Ana', verified: false },
    })
    const verified = container.querySelector('.product-tray__seller-verified')
    expect(verified).not.toBeInTheDocument()
  })

  it('renders seller listings count', () => {
    render(ProductTray, {
      props: { title: 'Test', sellerName: 'Ana', sellerListings: '15 anúncios' },
    })
    expect(screen.getByText('15 anúncios')).toBeInTheDocument()
  })

  it('calls onSellerClick when seller row is clicked', async () => {
    const handler = vi.fn()
    render(ProductTray, {
      props: { title: 'Test', sellerName: 'Ana', onSellerClick: handler },
    })
    await fireEvent.click(screen.getByText('Ana').closest('button')!)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('renders contact button with ghost variant', () => {
    render(ProductTray, { props: { title: 'Test', onContact: () => {} } })
    const button = screen.getByText('Contatar').closest('button')!
    expect(button).toHaveClass('product-tray__button--ghost')
  })

  it('renders buy button with primary variant', () => {
    render(ProductTray, { props: { title: 'Test', onBuy: () => {} } })
    const button = screen.getByText('Comprar').closest('button')!
    expect(button).toHaveClass('product-tray__button--primary')
  })

  it('calls onContact when contact button is clicked', async () => {
    const handler = vi.fn()
    render(ProductTray, { props: { title: 'Test', onContact: handler } })
    await fireEvent.click(screen.getByText('Contatar').closest('button')!)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('calls onBuy when buy button is clicked', async () => {
    const handler = vi.fn()
    render(ProductTray, { props: { title: 'Test', onBuy: handler } })
    await fireEvent.click(screen.getByText('Comprar').closest('button')!)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not render seller row when sellerName is not provided', () => {
    render(ProductTray, { props: { title: 'Test' } })
    expect(screen.queryByRole('button', { name: /Ana/ })).not.toBeInTheDocument()
  })

  it('does not render action buttons when no handlers provided', () => {
    render(ProductTray, { props: { title: 'Test' } })
    expect(screen.queryByText('Contatar')).not.toBeInTheDocument()
    expect(screen.queryByText('Comprar')).not.toBeInTheDocument()
  })

  it('renders detail text', () => {
    render(ProductTray, {
      props: { title: 'Test', detail: 'Algodão orgânico' },
    })
    expect(screen.getByText('Algodão orgânico')).toBeInTheDocument()
  })
})
