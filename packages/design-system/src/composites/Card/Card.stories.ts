import type { Meta, StoryObj } from '@storybook/svelte'
import Card from './Card.svelte'

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Card,
    props: args,
  }),
} satisfies Meta<Card>

export default meta
type Story = StoryObj<typeof meta>

export const Medium: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=300&fit=crop',
    title: 'Macacão Bebê Zebrinha',
    detail: 'Tamanho 3M - Algodão Orgânico',
    price: 'R$ 89,90',
    condition: 'Novo',
  },
}

export const WithOldPrice: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=400&h=300&fit=crop',
    title: 'Body Listrado Azul',
    detail: 'Tamanho 6M - Confortável',
    price: 'R$ 49,90',
    oldPrice: 'R$ 69,90',
    condition: 'Novo',
    badge: 'IA',
  },
}

export const WithSeller: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop',
    title: 'Vestido Florido Primavera',
    detail: 'Tamanho 12M - Algodão',
    price: 'R$ 59,90',
    condition: 'Seminovo',
    sellerName: 'Ana Silva',
    sellerAvatar: 'https://i.pravatar.cc/40?u=ana-silva',
    sellerListings: 15,
    verified: true,
  },
}

export const WithActions: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=300&fit=crop',
    title: 'Conjunto Inverno Bebê',
    detail: 'Tamanho 9M - Lã Macia',
    price: 'R$ 129,90',
    oldPrice: 'R$ 169,90',
    condition: 'Novo',
    badge: 'IA',
    sellerName: 'Carla Mendes',
    sellerListings: 8,
    verified: true,
    onContact: () => alert('Contatar vendedor'),
    onBuy: () => alert('Comprar item'),
  },
}

export const Small: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=250&fit=crop',
    title: 'Body Rosa',
    detail: 'Tamanho 3M',
    price: 'R$ 39,90',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=400&fit=crop',
    title: 'Conjunto Completo Inverno',
    detail: 'Tamanho 12M - 5 Peças',
    price: 'R$ 199,90',
    oldPrice: 'R$ 259,90',
    condition: 'Novo',
    badge: 'IA',
    sellerName: 'Maria Souza',
    sellerListings: 42,
    verified: true,
    size: 'lg',
    onContact: () => alert('Contatar'),
    onBuy: () => alert('Comprar'),
  },
}

export const UsedCondition: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1596357395104-b4cd8c5f5018?w=400&h=300&fit=crop',
    title: 'Calça Jeans Bebê',
    detail: 'Tamanho 6M - Estado Excelente',
    price: 'R$ 35,00',
    condition: 'Usado',
    sellerName: 'Paulo Oliveira',
  },
}
