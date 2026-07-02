<script lang="ts">
  type Size = 'sm' | 'md' | 'lg'
  type Variant = 'default' | 'pk' | 'inv'

  let {
    size = 'md',
    variant = 'default',
    label,
  }: {
    size?: Size
    variant?: Variant
    label?: string
  } = $props()
</script>

<span
  class="spinner spinner--{size} spinner--{variant}"
  role="status"
  aria-label={label || 'Carregando'}
></span>

<style>
  .spinner {
    display: inline-block;
    border-style: solid;
    border-radius: 50%;
    animation: bc-spin .6s linear infinite;
    flex-shrink: 0;
  }

  .spinner--sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.125rem;
  }

  .spinner--md {
    width: 1.5rem;
    height: 1.5rem;
    border-width: 0.156rem;
  }

  .spinner--lg {
    width: 2.25rem;
    height: 2.25rem;
    border-width: 0.188rem;
  }

  .spinner--default {
    border-color: #E5E7EB;
    border-top-color: #111;
  }

  .spinner--pk {
    border-color: #FFE8F5;
    border-top-color: #FF3CAC;
  }

  .spinner--inv {
    border-color: rgba(255, 255, 255, .2);
    border-top-color: #fff;
  }
</style>
