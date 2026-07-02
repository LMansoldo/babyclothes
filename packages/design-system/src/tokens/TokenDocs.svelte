<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
  }: {
    children?: Snippet
  } = $props()
</script>

{#key Math.random()}
  <div class="bc-token-docs">
    {#if children}
      {@render children()}
    {/if}
  </div>
{/key}

<style>
  .bc-token-docs {
    display: contents;
  }
</style>
