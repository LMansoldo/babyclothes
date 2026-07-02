import type { Meta, StoryObj } from '@storybook/svelte'
import ImageGallery from './ImageGallery.svelte'

const sampleImages = [
  'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=400&fit=crop',
]

const meta = {
  title: 'Composites/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'number', min: 120, max: 480, step: 20 } },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ImageGallery,
    props: args,
  }),
} satisfies Meta<ImageGallery>

export default meta
type Story = StoryObj<typeof meta>

export const WithImages: Story = {
  args: {
    images: sampleImages,
    height: 240,
    showActions: true,
    showDots: true,
    onBack: () => console.log('back'),
    onFav: () => console.log('fav'),
    isFavorited: false,
  },
}

export const Empty: Story = {
  args: {
    images: [],
    height: 240,
    showActions: false,
    showDots: false,
  },
}

export const WithoutActions: Story = {
  args: {
    images: sampleImages,
    height: 240,
    showActions: false,
    showDots: true,
  },
}

export const WithoutDots: Story = {
  args: {
    images: sampleImages,
    height: 240,
    showActions: true,
    showDots: false,
    onBack: () => console.log('back'),
    onFav: () => console.log('fav'),
  },
}

export const Favorited: Story = {
  args: {
    images: sampleImages,
    height: 240,
    showActions: true,
    showDots: true,
    onFav: () => console.log('fav'),
    isFavorited: true,
  },
}

export const Tall: Story = {
  args: {
    images: sampleImages,
    height: 400,
    showActions: true,
    showDots: true,
    onBack: () => console.log('back'),
    onFav: () => console.log('fav'),
    onShare: () => console.log('share'),
    isFavorited: false,
  },
}
