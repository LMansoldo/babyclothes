<script lang="ts">
  type Size = 'sm' | 'md' | 'lg'
  type Color = 'default' | 'pink'

  let {
    price,
    oldPrice,
    currency = 'BRL',
    locale = 'pt-BR',
    size = 'md',
    color = 'default',
  }: {
    price: number
    oldPrice?: number
    currency?: string
    locale?: string
    size?: Size
    color?: 'default' | 'pink'
  } = $props()

  function format(value: number): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value)
  }

  const formattedPrice = $derived(format(price))
  const formattedOldPrice = $derived(oldPrice != null ? format(oldPrice) : undefined)
</script>

<span
  class="price price--{size} price--{color}"
  aria-label={formattedOldPrice
    ? `Preço atual: ${formattedPrice}. Preço original: ${formattedOldPrice}`
    : formattedPrice}
>
  <span class="price__current">{formattedPrice}</span>
  {#if formattedOldPrice}
    <span class="price__old" aria-label="Preço original: {formattedOldPrice}">
      {formattedOldPrice}
    </span>
  {/if}
</span>

<style>
  .price {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    font-family: var(--font-lato);
  }

  .price__current {
    font-weight: 900;
    line-height: 1.2;
  }

  .price__old {
    font-family: var(--font-lato);
    color: var(--color-gray-2);
    text-decoration: line-through;
    font-weight: 400;
  }

  /* Sizes */
  .price--sm .price__current {
    font-size: 0.85rem;
  }

  .price--sm .price__old {
    font-size: 0.65rem;
  }

  .price--md .price__current {
    font-size: 1rem;
  }

  .price--md .price__old {
    font-size: 0.65rem;
  }

  .price--lg .price__current {
    font-size: 1.25rem;
  }

  .price--lg .price__old {
    font-size: 0.75rem;
  }

  /* Colors */
  .price--default .price__current {
    color: var(--color-black);
  }

  .price--pink .price__current {
    color: var(--color-pink);
  }
</style>
