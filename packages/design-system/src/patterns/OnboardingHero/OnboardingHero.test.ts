import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import OnboardingHero from './OnboardingHero.svelte'

const defaultProps = {
  title: 'Welcome to',
  titleAccent: 'BabyClothes',
  description: 'Buy and sell baby clothes.',
  features: [
    { icon: '0-3', label: 'Age prediction' },
    { icon: 'AB', label: 'Smart sizing' },
    { icon: 'CD', label: 'Quality check' },
    { icon: 'EF', label: 'Fast delivery' },
  ],
}

describe('OnboardingHero', () => {
  it('renders the title', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByText('Welcome to')).toBeInTheDocument()
  })

  it('renders the title accent', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByText('BabyClothes')).toBeInTheDocument()
    expect(screen.getByText('BabyClothes')).toHaveClass('onboardinghero__accent')
  })

  it('does not render accent when not provided', () => {
    render(OnboardingHero, {
      props: { ...defaultProps, titleAccent: undefined },
    })
    expect(document.querySelector('.onboardinghero__accent')).not.toBeInTheDocument()
  })

  it('renders the description', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByText('Buy and sell baby clothes.')).toBeInTheDocument()
  })

  it('renders all feature pills', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByText('Age prediction')).toBeInTheDocument()
    expect(screen.getByText('Smart sizing')).toBeInTheDocument()
    expect(screen.getByText('Quality check')).toBeInTheDocument()
    expect(screen.getByText('Fast delivery')).toBeInTheDocument()
  })

  it('renders feature icons', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByText('0-3')).toBeInTheDocument()
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('renders the illustration', () => {
    const { container } = render(OnboardingHero, { props: defaultProps })
    expect(container.querySelector('.onboardinghero__illustration')).toBeInTheDocument()
    expect(container.querySelector('.onboardinghero__illustration svg')).toBeInTheDocument()
  })

  it('renders features as a list', () => {
    render(OnboardingHero, { props: defaultProps })
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('renders with fewer features', () => {
    render(OnboardingHero, {
      props: {
        title: 'Test',
        description: 'Desc',
        features: [{ icon: 'X', label: 'Feature 1' }],
      },
    })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('has a section element', () => {
    const { container } = render(OnboardingHero, { props: defaultProps })
    expect(container.querySelector('section.onboardinghero')).toBeInTheDocument()
  })
})
