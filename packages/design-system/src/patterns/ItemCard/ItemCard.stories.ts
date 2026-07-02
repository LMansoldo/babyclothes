import type { Meta, StoryObj } from '@storybook/svelte'
import ItemCard from './ItemCard.svelte'

const meta = {
  title: 'Patterns/ItemCard',
  component: ItemCard,
  tags: ['autodocs'],
  argTypes: {
    price: { control: 'number' },
    onclick: { action: 'clicked' },
    onFavorite: { action: 'favorited' },
    onContact: { action: 'contacted' },
    onBuy: { action: 'buy' },
    onSellerClick: { action: 'seller clicked' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ItemCard,
    props: args,
  }),
} satisfies Meta<ItemCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Macacão Bebê Zebrinha',
    price: 89.90,
    clothingSize: '3M',
    conditionLabel: 'Novo',
    photoUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=400&fit=crop',
    sellerName: 'Ana Silva',
    sellerVerifiedLabel: 'Verificada',
  },
}

export const WithFavorite: Story = {
  args: {
    title: 'Body Listrado Azul',
    price: 49.90,
    clothingSize: '6M',
    conditionLabel: 'Novo',
    photoUrl: 'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=400&h=400&fit=crop',
    sellerName: 'Carla Mendes',
    sellerVerifiedLabel: 'Verificada',
    onFavorite: () => {},
  },
}

export const WithActions: Story = {
  args: {
    title: 'Vestido Florido Primavera',
    price: 59.90,
    clothingSize: '12M',
    conditionLabel: 'Seminovo',
    photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop',
    sellerName: 'Maria Souza',
    sellerVerifiedLabel: 'Verificada',
    paymentEnabled: true,
    contactLabel: 'Contatar',
    buyLabel: 'Comprar',
    onFavorite: () => {},
    onContact: () => {},
    onBuy: () => {},
    onSellerClick: () => {},
  },
}

export const NoPhoto: Story = {
  args: {
    title: 'Conjunto Inverno Bebê',
    price: 129.90,
    clothingSize: '9M',
    conditionLabel: 'Novo',
    sellerName: 'Paulo Oliveira',
  },
}

export const NoSeller: Story = {
  args: {
    title: 'Body Rosa',
    price: 39.90,
    clothingSize: '3M',
    conditionLabel: 'Novo',
    photoUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop',
  },
}

export const UsedCondition: Story = {
  args: {
    title: 'Calça Jeans Bebê',
    price: 35.00,
    clothingSize: '6M',
    conditionLabel: 'Usado',
    photoUrl: 'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=400&h=400&fit=crop',
    sellerName: 'Juliana Lima',
    sellerVerifiedLabel: 'Verificada',
    onFavorite: () => {},
  },
}
