<script lang="ts">
  import '../app.postcss'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import type { Session } from '$lib/domain/auth/entities/Session'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { t } from '$lib/i18n'
  import { Home, MessageSquare, Baby, PlusCircle } from 'lucide-svelte'
  import { TopBar, BottomNav, Footer, AgentTopBar } from '@babyclothes/design-system'
  import { flags } from '$lib/feature-flags'
  let { data, children } = $props()

  const bareRoutes = ['/login', '/register', '/onboarding']
  const isBareRoute = $derived(bareRoutes.some((r) => $page.url.pathname.startsWith(r)))
  const isChatRoute = $derived($page.url.pathname.startsWith('/chat') || $page.url.pathname.startsWith('/agent'))
  const topbarVariant = $derived(isChatRoute ? 'chat' : 'catalog')
  const currentPath = $derived($page.url.pathname)

  const footerLinks = $derived([
    { href: '/terms', label: $t('footer.terms') },
    { href: '/privacy', label: $t('footer.privacy') },
  ])

  // Create a writable store for session so children can react to changes
  const sessionStore = writable<Session | null>(null)
  $effect(() => {
    sessionStore.set(data.session)
  })

  setContext('session', sessionStore)
  setContext('unreadCount', writable(0))

  function initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('')
  }

  function handleNavigate(href: string) {
    goto(href)
  }
</script>

{#snippet homeIcon()}
  <Home size={20} strokeWidth={1.75} />
{/snippet}
{#snippet chatNavIcon()}
  <MessageSquare size={20} strokeWidth={1.75} />
{/snippet}
{#snippet childIcon()}
  <Baby size={20} strokeWidth={1.75} />
{/snippet}
{#snippet sellIcon()}
  <PlusCircle size={20} strokeWidth={1.75} />
{/snippet}

{#if isBareRoute}
  {@render children()}
{:else}
  {@const tabs = [
    { href: '/catalog', label: $t('nav.catalog'), icon: homeIcon },
    { href: '/chat', label: $t('nav.chat'), icon: chatNavIcon },
    { href: '/child', label: $t('nav.child'), icon: childIcon },
    { href: '/sell', label: $t('nav.sell'), icon: sellIcon },
  ]}
  <div class="app-shell" class:app-shell--chat={isChatRoute}>
    {#if flags.marketplace}
      <TopBar
        variant={topbarVariant}
        searchPlaceholder={$t('topbar.search_placeholder')}
        searchAriaLabel={$t('topbar.search_aria')}
        publishLabel={$t('topbar.publish')}
        chatTitle={$t('topbar.nav.chat_ai')}
        chatStatus={$t('topbar.chat_status')}
        onNavigate={handleNavigate}
      />
    {:else}
      <AgentTopBar
        agentName={$t('agent.topbar.name')}
        status="online"
        statusLabel={$t('agent.topbar.online')}
        unreadCount={0}
        userInitials={initials(data.session?.name ?? '')}
        onNotifications={() => goto('/notifications')}
        onProfile={() => goto('/profile')}
      />
    {/if}
    <main class="app-main" class:app-main--with-nav={flags.marketplaceNav}>
      {@render children()}
    </main>
    {#if flags.marketplace && !isChatRoute}
      <Footer links={footerLinks} copyright={$t('footer.copyright')} />
    {/if}
    {#if flags.marketplaceNav}
      <BottomNav
        {tabs}
        {currentPath}
        onNavigate={handleNavigate}
      />
    {/if}
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
    padding-bottom: 0;
  }

  /* Mobile: add space for BottomNav */
  @media (max-width: 76.8rem) {
    .app-main--with-nav {
      padding-bottom: 6.4rem;
    }
  }
</style>
