import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import ItemCard from './ItemCard.svelte'

describe('ItemCard', () => {
  it('renders title', () => {
    render(ItemCard, {
      props: {
        title: 'Macacão Azul',
        price: 35,
        clothingSize: 'P',
        conditionLabel: 'Novo',
      },
    })
    expect(screen.getByText('Macacão Azul')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    const { container } = render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Novo',
      },
    })
    expect(container.querySelector('.item-card__price')).toBeInTheDocument()
  })

  it('renders old price when provided', () => {
    const { container } = render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Novo',
        oldPrice: 55,
      },
    })
    expect(container.querySelector('.item-card__old-price')).toBeInTheDocument()
  })

  it('does not render old price when not provided', () => {
    const { container } = render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Novo',
      },
    })
    expect(container.querySelector('.item-card__old-price')).not.toBeInTheDocument()
  })

  it('renders seller name when provided', () => {
    render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Novo',
        sellerName: 'Maria',
      },
    })
    expect(screen.getByText('Maria')).toBeInTheDocument()
  })

  it('renders seller listings count when provided', () => {
    const { container } = render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Novo',
        sellerName: 'Maria',
        sellerListings: 12,
      },
    })
    expect(container.querySelector('.item-card__seller-listings')).toBeInTheDocument()
    expect(screen.getByText('12 anúncios')).toBeInTheDocument()
  })

  it('does not render seller listings when not provided', () => {
    const { container } = render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Novo',
        sellerName: 'Maria',
      },
    })
    expect(container.querySelector('.item-card__seller-listings')).not.toBeInTheDocument()
  })

  it('renders verified dot icon when sellerVerifiedLabel provided', () => {
    const { container } = render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Novo',
        sellerName: 'Maria',
        sellerVerifiedLabel: 'Verificado',
      },
    })
    expect(container.querySelector('.item-card__verified-dot')).toBeInTheDocument()
  })

  it('renders clothing size chip', () => {
    render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'GG',
        conditionLabel: 'Usado',
      },
    })
    expect(screen.getByText('GG')).toBeInTheDocument()
  })

  it('renders condition chip', () => {
    render(ItemCard, {
      props: {
        title: 'Body',
        price: 32,
        clothingSize: 'M',
        conditionLabel: 'Seminovo',
      },
    })
    expect(screen.getByText('Seminovo')).toBeInTheDocument()
  })
})
