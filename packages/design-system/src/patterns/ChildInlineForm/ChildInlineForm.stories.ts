import type { Meta, StoryObj } from '@storybook/svelte'
import ChildInlineForm from './ChildInlineForm.svelte'

const meta = {
  title: 'Patterns/ChildInlineForm',
  component: ChildInlineForm,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    onSubmit: { action: 'submit' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ChildInlineForm,
    props: args,
  }),
} satisfies Meta<ChildInlineForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    submitLabel: 'Save',
    labels: {
      name: 'Child name',
      ageMonths: 'Age',
      currentHeight: 'Height',
      currentWeight: 'Weight',
      birthHeight: 'Birth height',
      birthWeight: 'Birth weight',
      submit: 'Save',
    },
  },
}

export const PreFilled: Story = {
  args: {
    submitLabel: 'Update',
    labels: {
      name: 'Nome da crianca',
      ageMonths: 'Idade',
      currentHeight: 'Altura atual',
      currentWeight: 'Peso atual',
      birthHeight: 'Altura ao nascer',
      birthWeight: 'Peso ao nascer',
      submit: 'Atualizar',
    },
    initial: {
      name: 'Sofia',
      ageMonths: '6',
      currentHeightCm: '67',
      currentWeightKg: '7.5',
      birthHeightCm: '49',
      birthWeightG: '3200',
    },
  },
}

export const Loading: Story = {
  args: {
    submitLabel: 'Saving...',
    loading: true,
    labels: {
      name: 'Child name',
      ageMonths: 'Age',
      currentHeight: 'Height',
      currentWeight: 'Weight',
      birthHeight: 'Birth height',
      birthWeight: 'Birth weight',
      submit: 'Saving...',
    },
  },
}
