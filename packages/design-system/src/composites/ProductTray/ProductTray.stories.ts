import type { Meta, StoryObj } from '@storybook/svelte'
import ProductTray from './ProductTray.svelte'

const meta = {
  title: 'Components/ProductTray',
  component: ProductTray,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: ProductTray,
    props: args,
  }),
} satisfies Meta<ProductTray>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Macacão Bebê Zebrinha',
    price: 'R$ 89,90',
    condition: 'Novo',
    sizeLabel: 'Tam. 3M',
    genderLabel: 'Menina',
  },
}

export const WithOldPrice: Story = {
  args: {
    title: 'Body Listrado Azul',
    price: 'R$ 49,90',
    oldPrice: 'R$ 69,90',
    condition: 'Novo',
    sizeLabel: 'Tam. 6M',
    genderLabel: 'Menino',
  },
}

export const WithSeller: Story = {
  args: {
    title: 'Vestido Florido Primavera',
    price: 'R$ 59,90',
    condition: 'Seminovo',
    sizeLabel: 'Tam. 12M',
    sellerName: 'Ana Silva',
    sellerAvatar: 'https://i.pravatar.cc/40?u=ana-silva',
    sellerListings: '15 anúncios',
    verified: true,
  },
}

export const WithActions: Story = {
  args: {
    title: 'Conjunto Inverno Bebê',
    price: 'R$ 129,90',
    oldPrice: 'R$ 169,90',
    condition: 'Novo',
    sizeLabel: 'Tam. 9M',
    genderLabel: 'Unissex',
    sellerName: 'Carla Mendes',
    sellerAvatar: 'https://i.pravatar.cc/40?u=carla-mendes',
    sellerListings: '8 anúncios',
    verified: true,
    onContact: () => alert('Contatar vendedor'),
    onBuy: () => alert('Comprar item'),
  },
}

export const UsedCondition: Story = {
  args: {
    title: 'Calça Jeans Bebê',
    price: 'R$ 35,00',
    condition: 'Usado',
    sizeLabel: 'Tam. 6M',
    sellerName: 'Paulo Oliveira',
    sellerListings: '3 anúncios',
  },
}

export const WithDetail: Story = {
  args: {
    title: 'Kit 5 Bodies Manga Curta',
    detail: 'Algodão orgânico · Cores variadas',
    price: 'R$ 79,90',
    condition: 'Novo',
    sizeLabel: 'Tam. P',
    genderLabel: 'Unissex',
  },
}
