<script lang="ts">
  type Variant = 'dark' | 'pk' | 'pk-soft' | 'neutral' | 'green' | 'amber'
  type Size = 'sm' | 'md' | 'lg'

  let {
    label,
    variant = 'dark',
    size = 'md',
    pill = false,
  }: {
    label: string
    variant?: Variant
    size?: Size
    pill?: boolean
  } = $props()
</script>

<span class="badge badge--{variant} badge--{size}" class:badge--pill={pill}>
  {label}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-lato);
    font-weight: 700;
    border-radius: var(--radius-sm);
    padding: 0.3rem 0.8rem;
    line-height: 1;
    white-space: nowrap;
  }

  /* Sizes */
  .badge--sm { font-size: .65rem; padding: 0.2rem 0.5rem; }
  .badge--md { font-size: .75rem; padding: 0.25rem 0.6rem; }
  .badge--lg { font-size: .85rem; padding: 0.3rem 0.75rem; }

  /* Pill modifier */
  .badge--pill { border-radius: var(--radius-pill); }

  /* Variants */
  .badge--dark {
    background: var(--color-black);
    color: var(--color-white);
  }

  .badge--pk {
    background: var(--color-pink);
    color: var(--color-white);
  }

  .badge--pk-soft {
    background: var(--color-pk-soft);
    color: var(--color-pink);
  }

  .badge--neutral {
    background: #F3F4F6;
    color: #374151;
  }

  .badge--green {
    background: #DCFCE7;
    color: #15803D;
    border: 0.1rem solid #86EFAC;
  }

  .badge--amber {
    background: #FEF3C7;
    color: #92400E;
  }
</style>
