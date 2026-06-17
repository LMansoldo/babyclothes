import type { Meta, StoryObj } from '@storybook/svelte';
import Spinner from '../lib/components/Spinner/Spinner.svelte';

const meta: Meta<typeof Spinner> = {
  title: 'SDK/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'pk', 'inv'] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const AllSizes: Story = {
  args: { size: 'md', variant: 'default' },
};

export const Small: Story = {
  args: { size: 'sm', variant: 'default' },
};

export const Medium: Story = {
  args: { size: 'md', variant: 'default' },
};

export const Large: Story = {
  args: { size: 'lg', variant: 'default' },
};

export const Pink: Story = {
  args: { size: 'md', variant: 'pk' },
};

export const Inverted: Story = {
  args: { size: 'md', variant: 'inv' },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
