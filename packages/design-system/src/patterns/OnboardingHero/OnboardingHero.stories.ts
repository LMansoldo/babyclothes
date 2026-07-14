import type { Meta, StoryObj } from '@storybook/svelte'
import OnboardingHero from './OnboardingHero.svelte'

const meta = {
  title: 'Patterns/OnboardingHero',
  component: OnboardingHero,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: OnboardingHero,
    props: args,
  }),
} satisfies Meta<OnboardingHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Welcome to',
    titleAccent: 'BabyClothes',
    description: 'Buy and sell baby clothes with AI-powered growth predictions. Find the perfect fit for your little one.',
    features: [
      { icon: '0-3', label: 'Age prediction' },
      { icon: 'AB', label: 'Smart sizing' },
      { icon: 'CD', label: 'Quality check' },
      { icon: 'EF', label: 'Fast delivery' },
    ],
  },
}

export const WithoutAccent: Story = {
  args: {
    title: 'Getting started with BabyClothes',
    description: 'Set up your profile and start browsing quality baby clothes from trusted sellers.',
    features: [
      { icon: 'GH', label: 'Create profile' },
      { icon: 'IJ', label: 'Add children' },
      { icon: 'KL', label: 'Browse items' },
      { icon: 'MN', label: 'Start selling' },
    ],
  },
}

export const FewerFeatures: Story = {
  args: {
    title: 'Grow with',
    titleAccent: 'confidence',
    description: 'Our AI predicts your child growth to help you buy the right sizes at the right time.',
    features: [
      { icon: 'OP', label: 'AI predictions' },
      { icon: 'QR', label: 'Size tracking' },
    ],
  },
}
