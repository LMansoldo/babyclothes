import type { Meta, StoryObj } from '@storybook/svelte';
import Avatar from '../lib/components/Avatar/Avatar.svelte';

const meta: Meta<typeof Avatar> = {
  title: 'SDK/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    fill: { control: 'select', options: ['pk', 'bk', 'of'] },
    online: { control: 'boolean' },
    verified: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const AllSizes: Story = {
  args: { name: 'Sofia Lima', fill: 'pk', size: 'md' },
};

export const SmSize: Story = {
  args: { name: 'Sofia Lima', size: 'sm', fill: 'pk' },
};

export const MdSize: Story = {
  args: { name: 'Sofia Lima', size: 'md', fill: 'pk' },
};

export const LgSize: Story = {
  args: { name: 'Sofia Lima', size: 'lg', fill: 'pk' },
};

export const XlSize: Story = {
  args: { name: 'Sofia Lima', size: 'xl', fill: 'pk' },
};

export const FillPink: Story = {
  args: { name: 'Sofia Lima', size: 'lg', fill: 'pk' },
};

export const FillBlack: Story = {
  args: { name: 'Lucas M', size: 'lg', fill: 'bk' },
};

export const FillOffWhite: Story = {
  args: { name: 'Usuário', size: 'lg', fill: 'of' },
};

export const WithOnline: Story = {
  args: { name: 'Sofia Lima', size: 'md', fill: 'pk', online: true },
};

export const WithVerified: Story = {
  args: { name: 'Sofia Lima', size: 'md', fill: 'pk', verified: true },
};

export const WithImage: Story = {
  args: {
    name: 'Sofia Lima',
    src: 'https://placehold.co/72x72',
    size: 'lg',
    online: true,
    verified: true,
  },
};
