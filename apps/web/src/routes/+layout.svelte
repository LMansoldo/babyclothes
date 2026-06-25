<script lang="ts">
  import '../app.postcss'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { page } from '$app/stores'
  import TopBar from '$lib/presentation/shell/TopBar.svelte'
  import BottomNav from '$lib/presentation/shell/BottomNav.svelte'
  import Footer from '$lib/presentation/components/Footer.svelte'

  let { data, children } = $props()

  const isLoginRoute = $derived($page.url.pathname === '/login')
  const isChatRoute = $derived($page.url.pathname.startsWith('/chat'))
  const topbarVariant = $derived(isChatRoute ? 'chat' : 'catalog')
  const showFooter = $derived(!isLoginRoute && !isChatRoute)

  // Create a writable store for session so children can react to changes
  const sessionStore = writable(undefined)
  $effect(() => {
    sessionStore.set(data.session)
  })

  setContext('session', sessionStore)
  setContext('unreadCount', writable(0))
</script>

{#if isLoginRoute}
  {@render children()}
{:else}
  <div class="app-shell" class:app-shell--chat={isChatRoute}>
    <TopBar variant={topbarVariant} />
    <main class="app-main">
      {@render children()}
    </main>
    {#if showFooter}
      <Footer />
    {/if}
    <BottomNav />
  </div>
{/if}

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .app-shell--chat {
    height: 100vh;
    overflow: hidden;
  }

  .app-main {
    flex: 1;
    padding-top: 5.6rem; /* Space for fixed TopBar */
    padding-bottom: 0;
  }

  /* Mobile: add space for BottomNav */
  @media (max-width: 76.8rem) {
    .app-main {
      padding-bottom: 6.4rem;
    }
  }
</style>
