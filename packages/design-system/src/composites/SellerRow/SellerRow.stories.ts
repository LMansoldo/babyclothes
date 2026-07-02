import type { Meta, StoryObj } from '@storybook/svelte'
import SellerRow from './SellerRow.svelte'

const meta = {
  title: 'Composites/SellerRow',
  component: SellerRow,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: SellerRow,
    props: args,
  }),
} satisfies Meta<SellerRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Ana Silva',
    avatar: 'https://i.pravatar.cc/80?u=ana-silva',
    verified: true,
    listingCount: 15,
    listingLabel: 'anúncios',
    verifiedLabel: 'Verificado',
  },
}

export const WithoutVerified: Story = {
  args: {
    name: 'Carlos Oliveira',
    avatar: 'https://i.pravatar.cc/80?u=carlos-oliveira',
    verified: false,
    listingCount: 3,
    listingLabel: 'anúncios',
  },
}

export const WithoutListingCount: Story = {
  args: {
    name: 'Maria Souza',
    avatar: 'https://i.pravatar.cc/80?u=maria-souza',
    verified: true,
    verifiedLabel: 'Verificado',
  },
}

export const Interactive: Story = {
  args: {
    name: 'Pedro Mendes',
    avatar: 'https://i.pravatar.cc/80?u=pedro-mendes',
    verified: true,
    listingCount: 42,
    listingLabel: 'anúncios',
    verifiedLabel: 'Verificado',
    onclick: () => console.log('seller clicked'),
  },
}
