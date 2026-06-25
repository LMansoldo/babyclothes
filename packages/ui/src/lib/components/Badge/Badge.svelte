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
    font-family: var(--font-ui);
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
    padding: 0.3rem 0.8rem;
    line-height: 1;
    white-space: nowrap;
  }

  /* Sizes */
  .badge--sm { font-size: .54rem; padding: 0.2rem 0.6rem; }
  .badge--md { font-size: .62rem; }
  .badge--lg { font-size: .72rem; padding: 0.4rem 1rem; }

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
    background: var(--color-pink-soft);
    color: var(--color-pink);
    border: 0.1rem solid var(--color-pink-light);
  }

  .badge--neutral {
    background: var(--color-bg-2);
    color: var(--color-black);
    border: 0.1rem solid var(--color-bg-3);
  }

  .badge--green {
    background: #DCFCE7;
    color: #15803D;
    border: 0.1rem solid #86EFAC;
  }

  .badge--amber {
    background: #FEF3C7;
    color: #B45309;
    border: 0.1rem solid #FCD34D;
  }
</style>
