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
    width: 16px;
    height: 16px;
    border-width: 2px;
  }

  .spinner--md {
    width: 28px;
    height: 28px;
    border-width: 3px;
  }

  .spinner--lg {
    width: 44px;
    height: 44px;
    border-width: 4px;
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
