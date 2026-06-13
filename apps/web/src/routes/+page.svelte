<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  onMount(() => {
    goto('/catalog')
  })
</script>

<p>Redirecting...</p>
