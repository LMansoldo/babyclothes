import type { Meta, StoryObj } from '@storybook/svelte'
import PhotoUploader from './PhotoUploader.svelte'

const samplePhotos = [
  { id: '1', url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=200&fit=crop' },
  { id: '2', url: 'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=200&h=200&fit=crop' },
]

const allPhotos = [
  { id: '1', url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=200&fit=crop' },
  { id: '2', url: 'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=200&h=200&fit=crop' },
  { id: '3', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=200&fit=crop' },
  { id: '4', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&h=200&fit=crop' },
]

const meta = {
  title: 'Composites/PhotoUploader',
  component: PhotoUploader,
  tags: ['autodocs'],
  argTypes: {
    gridCols: { control: 'select', options: [3, 4] },
    maxPhotos: { control: { type: 'number', min: 1, max: 6 } },
  },
  render: (args: Record<string, unknown>) => ({
    Component: PhotoUploader,
    props: args,
  }),
} satisfies Meta<PhotoUploader>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    photos: [],
    maxPhotos: 4,
    gridCols: 4,
    onAdd: () => console.log('add'),
    onRemove: (id: string) => console.log('remove', id),
  },
}

export const Partial: Story = {
  args: {
    photos: samplePhotos,
    maxPhotos: 4,
    gridCols: 4,
    onAdd: () => console.log('add'),
    onRemove: (id: string) => console.log('remove', id),
  },
}

export const Full: Story = {
  args: {
    photos: allPhotos,
    maxPhotos: 4,
    gridCols: 4,
    onRemove: (id: string) => console.log('remove', id),
  },
}

export const ThreeColumns: Story = {
  args: {
    photos: [
      { id: '1', url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=200&fit=crop' },
      { id: '2', url: 'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=200&h=200&fit=crop' },
      { id: '3', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=200&fit=crop' },
    ],
    maxPhotos: 3,
    gridCols: 3,
    onAdd: () => console.log('add'),
    onRemove: (id: string) => console.log('remove', id),
  },
}

export const FiveSlots: Story = {
  args: {
    photos: samplePhotos,
    maxPhotos: 5,
    gridCols: 4,
    onAdd: () => console.log('add'),
    onRemove: (id: string) => console.log('remove', id),
  },
}
