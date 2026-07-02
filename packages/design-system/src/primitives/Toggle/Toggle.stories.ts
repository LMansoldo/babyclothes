import type { Meta, StoryObj } from '@storybook/svelte'
import Toggle from './Toggle.svelte'

const meta = {
  title: 'Primitives/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['switch', 'chip'] },
    size: { control: 'select', options: ['sm', 'md'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Toggle,
    props: args,
  }),
} satisfies Meta<Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const SwitchOff: Story = {
  args: { variant: 'switch', checked: false, ariaLabel: 'Notificações' },
}

export const SwitchOn: Story = {
  args: { variant: 'switch', checked: true, ariaLabel: 'Notificações' },
}

export const SwitchSmall: Story = {
  args: { variant: 'switch', size: 'sm', checked: true, ariaLabel: 'Compacto' },
}

export const SwitchDisabled: Story = {
  args: { variant: 'switch', checked: true, disabled: true, ariaLabel: 'Desabilitado' },
}

export const ChipTogglePT: Story = {
  args: { variant: 'chip', checked: true, onLabel: 'PT-BR', offLabel: 'EN', ariaLabel: 'Idioma' },
}

export const ChipToggleEN: Story = {
  args: { variant: 'chip', checked: false, onLabel: 'PT-BR', offLabel: 'EN', ariaLabel: 'Idioma' },
}
