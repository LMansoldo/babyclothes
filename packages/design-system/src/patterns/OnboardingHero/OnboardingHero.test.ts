import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import OnboardingHero from './OnboardingHero.svelte'

const defaultProps = {
  title: 'Um agente que',
  titleAccent: 'garimpa',
  titleRest: 'o brechó por você',
  description: 'A IA procura roupas e itens ideais combinando tamanho, idade, peso e a sua localização.',
  features: [
    { icon: 'size', label: 'Tamanho' },
    { icon: 'age', label: 'Idade' },
    { icon: 'weight', label: 'Peso' },
    { icon: 'location', label: 'Localização' },
  ],
}

describe('OnboardingHero', () => {
  it('renders the title', () => {
    const { container } = render(OnboardingHero, { props: defaultProps })
    const title = container.querySelector('.onboardinghero__title')
    expect(title).toBeInTheDocument()
    expect(title?.textContent).toContain('Um agente que')
  })

  it('renders the title accent with correct class', () => {
    render(OnboardingHero, { props: defaultProps })
    const accent = screen.getByText('garimpa')
    expect(accent).toBeInTheDocument()
    expect(accent).toHaveClass('onboardinghero__accent')
  })

  it('renders the title rest', () => {
    const { container } = render(OnboardingHero, { props: defaultProps })
    const title = container.querySelector('.onboardinghero__title')
    expect(title?.textContent).toContain('o brechó por você')
  })

  it('does not render accent when not provided', () => {
    render(OnboardingHero, {
      props: { ...defaultProps, titleAccent: undefined },
    })
    expect(document.querySelector('.onboardinghero__accent')).not.toBeInTheDocument()
  })

  it('does not render rest when not provided', () => {
    const { container } = render(OnboardingHero, {
      props: { ...defaultProps, titleRest: undefined },
    })
    const title = container.querySelector('.onboardinghero__title')
    expect(title?.textContent).not.toContain('o brechó por você')
  })

  it('renders the description', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
  })

  it('renders all feature pills', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByText('Tamanho')).toBeInTheDocument()
    expect(screen.getByText('Idade')).toBeInTheDocument()
    expect(screen.getByText('Peso')).toBeInTheDocument()
    expect(screen.getByText('Localização')).toBeInTheDocument()
  })

  it('renders features as a list with 4 items', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('renders SVG icons in each pill', () => {
    const { container } = render(OnboardingHero, { props: defaultProps })
    const svgs = container.querySelectorAll('.onboardinghero__pill svg')
    expect(svgs.length).toBe(defaultProps.features.length)
  })

  it('renders unknown icon without SVG', () => {
    const { container } = render(OnboardingHero, {
      props: {
        ...defaultProps,
        features: [{ icon: 'zzz', label: 'Unknown' }],
      },
    })
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(container.querySelectorAll('.onboardinghero__pill svg')).toHaveLength(0)
  })

  it('renders the illustration SVG', () => {
    const { container } = render(OnboardingHero, { props: defaultProps })
    expect(container.querySelector('.onboardinghero__illustration svg')).toBeInTheDocument()
  })

  it('has a section element', () => {
    const { container } = render(OnboardingHero, { props: defaultProps })
    expect(container.querySelector('section.onboardinghero')).toBeInTheDocument()
  })
})
