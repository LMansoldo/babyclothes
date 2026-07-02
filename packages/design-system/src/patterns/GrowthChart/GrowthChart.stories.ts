import type { Meta, StoryObj } from '@storybook/svelte'
import GrowthChart from './GrowthChart.svelte'

const meta = {
  title: 'Patterns/GrowthChart',
  component: GrowthChart,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['compact', 'full'] },
    progress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    daysUntil: { control: 'number' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: GrowthChart,
    props: args,
  }),
} satisfies Meta<GrowthChart>

export default meta
type Story = StoryObj<typeof meta>

export const Compact: Story = {
  args: {
    variant: 'compact',
    childName: 'Sofia',
    currentSize: '6M',
    nextSize: '9M',
    daysUntil: 45,
    progress: 62,
    predictionLabel: 'Previsão de troca em 45 dias',
    eyebrow: 'Crescimento',
  },
}

export const CompactWithDescription: Story = {
  args: {
    variant: 'compact',
    childName: 'Miguel',
    currentSize: '12M',
    nextSize: '18M',
    daysUntil: 90,
    progress: 38,
    predictionLabel: 'Previsão de troca em 90 dias',
    eyebrow: 'Crescimento',
    description: 'Com base no padrão de crescimento, Miguel deve precisar do próximo tamanho em aproximadamente 3 meses.',
  },
}

export const FullWithTimeline: Story = {
  args: {
    variant: 'full',
    childName: 'Helena',
    currentSize: '3M',
    nextSize: '6M',
    daysUntil: 60,
    progress: 45,
    predictionLabel: 'Previsão de troca em 60 dias',
    eyebrow: 'Crescimento',
    description: 'Helena está crescendo dentro do esperado para a idade. A transição para o tamanho 6M deve ocorrer em cerca de 2 meses.',
    sizes: [
      { label: 'RN', status: 'past' },
      { label: '1M', status: 'past' },
      { label: '3M', status: 'current' },
      { label: '6M', status: 'next' },
      { label: '9M', status: 'future' },
      { label: '12M', status: 'future' },
    ],
    primaryAction: { label: 'Atualizar medidas', onclick: () => {} },
    secondaryAction: { label: 'Histórico', onclick: () => {} },
  },
}

export const FullNoTimeline: Story = {
  args: {
    variant: 'full',
    childName: 'Pedro',
    currentSize: '9M',
    nextSize: '12M',
    daysUntil: 30,
    progress: 78,
    predictionLabel: 'Previsão de troca em 30 dias',
    description: 'Pedro está quase pronto para o próximo tamanho.',
    primaryAction: { label: 'Ver roupas 12M', onclick: () => {} },
  },
}

export const Minimal: Story = {
  args: {
    currentSize: '6M',
    nextSize: '9M',
    daysUntil: 45,
    progress: 50,
    predictionLabel: 'Troca prevista em 45 dias',
  },
}
