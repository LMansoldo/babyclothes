import type { Meta, StoryObj } from '@storybook/svelte';
import Badge from '../lib/components/Badge/Badge.svelte';

const meta: Meta<typeof Badge> = {
  title: 'SDK/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['dark', 'pk', 'pk-soft', 'neutral', 'green', 'amber'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    pill: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  args: { label: 'Novo', size: 'md', pill: false },
};

export const Dark: Story = {
  args: { label: 'Destaque', variant: 'dark', size: 'md' },
};

export const Pink: Story = {
  args: { label: 'Promoção', variant: 'pk', size: 'md' },
};

export const PinkSoft: Story = {
  args: { label: 'Reservado', variant: 'pk-soft', size: 'md' },
};

export const Neutral: Story = {
  args: { label: 'Usado', variant: 'neutral', size: 'md' },
};

export const Green: Story = {
  args: { label: 'Novo', variant: 'green', size: 'md' },
};

export const Amber: Story = {
  args: { label: 'Bom estado', variant: 'amber', size: 'md' },
};

export const AllSizes: Story = {
  args: { label: 'Tam. M', variant: 'pk', size: 'sm' },
};

export const Pill: Story = {
  args: { label: 'P', variant: 'dark', size: 'md', pill: true },
};

export const OnCard: Story = {
  args: { label: 'Novo', variant: 'green', size: 'sm', pill: true },
};
