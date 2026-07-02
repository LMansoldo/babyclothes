import type { Meta, StoryObj } from '@storybook/svelte'
import Avatar from './Avatar.svelte'

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    fill: { control: 'select', options: ['pk', 'bk', 'of'] },
    online: { control: 'boolean' },
    verified: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Avatar,
    props: args,
  }),
} satisfies Meta<Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const InitialsPink: Story = {
  args: {
    name: 'Ana Silva',
    size: 'md',
    fill: 'pk',
  },
}

export const InitialsBlack: Story = {
  args: {
    name: 'João Oliveira',
    size: 'md',
    fill: 'bk',
  },
}

export const InitialsOffWhite: Story = {
  args: {
    name: 'Maria Santos',
    size: 'md',
    fill: 'of',
  },
}

export const WithImage: Story = {
  args: {
    name: 'Carla Mendes',
    src: 'https://i.pravatar.cc/150?u=carla-mendes',
    size: 'lg',
  },
}

export const Online: Story = {
  args: {
    name: 'Paulo Souza',
    online: true,
    fill: 'pk',
  },
}

export const Verified: Story = {
  args: {
    name: 'Luciana Costa',
    verified: true,
    fill: 'pk',
  },
}

export const OnlineVerified: Story = {
  args: {
    name: 'Fernanda Lima',
    online: true,
    verified: true,
    fill: 'pk',
  },
}

export const Small: Story = {
  args: {
    name: 'Ana Silva',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    name: 'Ana Silva',
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  args: {
    name: 'Ana Silva',
    size: 'xl',
  },
}
