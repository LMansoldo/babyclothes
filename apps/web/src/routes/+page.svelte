<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { HOME_ROUTE } from '$lib/feature-flags'
  import { Spinner } from '@babyclothes/design-system'

  onMount(() => {
    goto(HOME_ROUTE)
  })
</script>

<div class="redirect">
  <Spinner />
</div>

<style>
  .redirect {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
