<script lang="ts">
  type Size = 'sm' | 'md' | 'lg'
  type Variant = 'default' | 'pk' | 'inv'

  let {
    size = 'md',
    variant = 'default',
  }: {
    size?: Size
    variant?: Variant
  } = $props()
</script>

<span
  class="spinner spinner--{size} spinner--{variant}"
  role="status"
  aria-label="Carregando"
></span>

<style>
  .spinner {
    display: inline-block;
    border-style: solid;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    flex-shrink: 0;
  }

  .spinner--sm {
    width: 1.6rem;
    height: 1.6rem;
    border-width: 0.2rem;
  }

  .spinner--md {
    width: 2.8rem;
    height: 2.8rem;
    border-width: 0.3rem;
  }

  .spinner--lg {
    width: 4.4rem;
    height: 4.4rem;
    border-width: 0.4rem;
  }

  .spinner--default {
    border-color: var(--color-black);
    border-top-color: transparent;
  }

  .spinner--pk {
    border-color: var(--color-pink);
    border-top-color: transparent;
  }

  .spinner--inv {
    border-color: var(--color-white);
    border-top-color: transparent;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
