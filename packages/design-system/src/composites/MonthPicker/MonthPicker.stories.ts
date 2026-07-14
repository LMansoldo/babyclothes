import type { Meta, StoryObj } from '@storybook/svelte'
import MonthPicker from './MonthPicker.svelte'

const meta = {
  title: 'Composites/MonthPicker',
  component: MonthPicker,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'change' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: MonthPicker,
    props: args,
  }),
} satisfies Meta<MonthPicker>

export default meta
type Story = StoryObj<typeof meta>

const monthsPt = [
  { value: '0', label: '0m' },
  { value: '1', label: '1m' },
  { value: '2', label: '2m' },
  { value: '3', label: '3m' },
  { value: '4', label: '4m' },
  { value: '5', label: '5m' },
  { value: '6', label: '6m' },
  { value: '7', label: '7m' },
  { value: '8', label: '8m' },
  { value: '9', label: '9m' },
  { value: '10', label: '10m' },
  { value: '11', label: '11m' },
  { value: '12', label: '12m' },
  { value: '18', label: '18m' },
  { value: '24', label: '24m' },
  { value: '36', label: '36m' },
]

export const Default: Story = {
  args: {
    ariaLabel: 'Select age in months',
    months: monthsPt,
  },
}

export const Preselected: Story = {
  args: {
    ariaLabel: 'Select age in months',
    months: monthsPt,
    value: '6',
  },
}

export const FewerMonths: Story = {
  args: {
    ariaLabel: 'Select age in months',
    months: [
      { value: '0', label: '0m' },
      { value: '3', label: '3m' },
      { value: '6', label: '6m' },
      { value: '9', label: '9m' },
      { value: '12', label: '12m' },
      { value: '18', label: '18m' },
      { value: '24', label: '24m' },
      { value: '36', label: '36m' },
    ],
    value: '12',
  },
}
