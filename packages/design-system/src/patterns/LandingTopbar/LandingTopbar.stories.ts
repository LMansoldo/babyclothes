import type { Meta, StoryObj } from '@storybook/svelte'
import LandingTopbar from './LandingTopbar.svelte'

const meta = {
  title: 'Patterns/LandingTopbar',
  component: LandingTopbar,
  tags: ['autodocs'],
  argTypes: {
    onNavigate: { action: 'navigate' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: LandingTopbar,
    props: args,
  }),
} satisfies Meta<LandingTopbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    links: [
      { href: '#como-funciona', label: 'Como funciona' },
      { href: '#recursos', label: 'Recursos' },
    ],
    loginLabel: 'Entrar',
    ctaLabel: 'Comece gratis',
  },
}

export const WithNavigate: Story = {
  args: {
    links: [
      { href: '#como-funciona', label: 'Como funciona' },
      { href: '#por-que', label: 'Por que BabyClothes' },
      { href: '#depoimentos', label: 'Depoimentos' },
    ],
    loginLabel: 'Ja tenho conta',
    ctaLabel: 'Cadastrar',
    onNavigate: () => {},
  },
}

export const Minimal: Story = {
  args: {
    links: [],
    loginLabel: 'Login',
    ctaLabel: 'Comecar',
  },
}
