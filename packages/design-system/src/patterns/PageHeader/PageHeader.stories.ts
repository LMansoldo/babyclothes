import type { Meta, StoryObj } from '@storybook/svelte'
import PageHeader from './PageHeader.svelte'

const meta = {
  title: 'Patterns/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'hero'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: PageHeader,
    props: args,
  }),
} satisfies Meta<PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Catálogo',
  },
}

export const DefaultWithSubtitle: Story = {
  args: {
    title: 'Notificações',
    subtitle: 'Fique por dentro de tudo',
  },
}

export const Hero: Story = {
  args: {
    variant: 'hero',
    title: 'Olá, Sofia!',
    subtitle: 'Temos novidades para o crescimento do seu bebê',
  },
}

export const HeroShort: Story = {
  args: {
    variant: 'hero',
    title: 'Vender',
  },
}
