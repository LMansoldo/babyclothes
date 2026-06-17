import type { Meta, StoryObj } from '@storybook/svelte';
import Button from '../lib/components/Button/Button.svelte';

const meta: Meta<typeof Button> = {
  title: 'SDK/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'pk', 'secondary', 'ghost', 'ghost-pk', 'primary-inv', 'ghost-inv'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Comprar agora', variant: 'primary', size: 'md' },
};

export const Pink: Story = {
  args: { label: 'Anunciar', variant: 'pk', size: 'md' },
};

export const Secondary: Story = {
  args: { label: 'Ver mais', variant: 'secondary', size: 'md' },
};

export const Ghost: Story = {
  args: { label: 'Cancelar', variant: 'ghost', size: 'md' },
};

export const GhostPink: Story = {
  args: { label: 'Seguir', variant: 'ghost-pk', size: 'md' },
};

export const Small: Story = {
  args: { label: 'Filtrar', variant: 'primary', size: 'sm' },
};

export const Large: Story = {
  args: { label: 'Começar agora', variant: 'pk', size: 'lg' },
};

export const Loading: Story = {
  args: { label: 'Salvando...', variant: 'primary', size: 'md', loading: true },
};

export const Disabled: Story = {
  args: { label: 'Indisponível', variant: 'primary', size: 'md', disabled: true },
};

export const DarkCanvas: Story = {
  args: { label: 'Entrar', variant: 'primary-inv', size: 'md' },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const GhostInverted: Story = {
  args: { label: 'Saiba mais', variant: 'ghost-inv', size: 'md' },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
