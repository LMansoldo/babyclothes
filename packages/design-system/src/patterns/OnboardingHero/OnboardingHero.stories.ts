import type { Meta, StoryObj } from '@storybook/svelte'
import OnboardingHero from './OnboardingHero.svelte'

const meta = {
  title: 'Patterns/OnboardingHero',
  component: OnboardingHero,
  tags: ['autodocs'],
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    () => ({
      template:
        '<div style="background:#140a12;padding:2rem;max-width:360px;"><story/></div>',
    }),
  ],
  render: (args: Record<string, unknown>) => ({
    Component: OnboardingHero,
    props: args,
  }),
} satisfies Meta<OnboardingHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Um agente que',
    titleAccent: 'garimpa',
    titleRest: 'o brechó por você',
    description:
      'A IA procura roupas e itens ideais combinando tamanho, idade, peso e a sua localização.',
    features: [
      { icon: 'size', label: 'Tamanho' },
      { icon: 'age', label: 'Idade' },
      { icon: 'weight', label: 'Peso' },
      { icon: 'location', label: 'Localização' },
    ],
  },
}

export const WithoutAccent: Story = {
  args: {
    title: 'Getting started with BabyClothes',
    description:
      'Set up your profile and start browsing quality baby clothes from trusted sellers.',
    features: [
      { icon: 'size', label: 'Size' },
      { icon: 'age', label: 'Age' },
      { icon: 'weight', label: 'Weight' },
      { icon: 'location', label: 'Location' },
    ],
  },
}

export const FewerFeatures: Story = {
  args: {
    title: 'An agent that',
    titleAccent: 'finds',
    titleRest: 'deals for you',
    description:
      'Our AI predicts your child growth to help you buy the right sizes at the right time.',
    features: [
      { icon: 'size', label: 'Size' },
      { icon: 'age', label: 'Age' },
    ],
  },
}
