<script lang="ts">
  import '../app.postcss'
  import { setContext } from 'svelte'
  import { page } from '$app/stores'
  import TopBar from '$lib/presentation/shell/TopBar.svelte'
  import BottomNav from '$lib/presentation/shell/BottomNav.svelte'

  let { data, children } = $props()

  const isLoginRoute = $derived($page.url.pathname === '/login')

  // Context must be set during initialization, not in $effect
  if (data.session) {
    setContext('session', data.session)
  }
</script>

{#if isLoginRoute}
  {@render children()}
{:else}
  <div class="app-shell">
    <TopBar />
    <main class="app-main">
      {@render children()}
    </main>
    <BottomNav />
  </div>
{/if}

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .app-main {
    flex: 1;
    padding-bottom: 64px; /* Space for BottomNav */
  }
</style>
