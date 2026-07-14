import type { Meta, StoryObj } from '@storybook/svelte'
import Select from './Select.svelte'

const brazilianUFs = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapa' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceara' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espirito Santo' },
  { value: 'GO', label: 'Goias' },
  { value: 'MA', label: 'Maranhao' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Para' },
  { value: 'PB', label: 'Paraiba' },
  { value: 'PR', label: 'Parana' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piaui' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondonia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'Sao Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: Select,
    props: args,
  }),
} satisfies Meta<Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'select-uf',
    label: 'Estado',
    placeholder: 'Selecione o estado',
    options: brazilianUFs,
  },
}

export const WithValue: Story = {
  args: {
    id: 'select-uf-value',
    label: 'Estado',
    placeholder: 'Selecione o estado',
    options: brazilianUFs,
    value: 'SP',
  },
}

export const WithError: Story = {
  args: {
    id: 'select-uf-error',
    label: 'Estado',
    placeholder: 'Selecione o estado',
    options: brazilianUFs,
    error: 'Selecione um estado valido',
  },
}

export const WithHint: Story = {
  args: {
    id: 'select-uf-hint',
    label: 'Estado',
    placeholder: 'Selecione o estado',
    options: brazilianUFs,
    hint: 'Escolha o estado onde voce mora',
  },
}

export const Disabled: Story = {
  args: {
    id: 'select-uf-disabled',
    label: 'Estado',
    placeholder: 'Selecione o estado',
    options: brazilianUFs,
    disabled: true,
  },
}

export const DisabledWithValue: Story = {
  args: {
    id: 'select-uf-disabled-val',
    label: 'Estado',
    options: brazilianUFs,
    value: 'RJ',
    disabled: true,
  },
}
