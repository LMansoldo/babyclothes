<script lang="ts">
  import '../app.postcss'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import type { Session } from '$lib/domain/auth/entities/Session'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { t } from '$lib/i18n'
  import { Home, MessageSquare, Baby, PlusCircle, User } from 'lucide-svelte'
  import { TopBar, BottomNav, Footer } from '@babyclothes/design-system'
  import { flags, HOME_ROUTE } from '$lib/feature-flags'
  import ToastContainer from '$lib/presentation/components/ToastContainer.svelte'
  let { data, children } = $props()

  const bareRoutes = ['/login', '/register', '/onboarding']
  const isBareRoute = $derived(bareRoutes.some((r) => $page.url.pathname.startsWith(r)))
  const isChatRoute = $derived($page.url.pathname.startsWith('/chat') || $page.url.pathname.startsWith('/agent'))
  const topbarVariant = $derived(flags.marketplace ? 'catalog' : 'agent')
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

  function handleNavigate(href: string) {
    goto(href)
  }

  function initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('')
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
{#snippet profileIcon()}
  <User size={20} strokeWidth={1.75} />
{/snippet}

{#if isBareRoute}
  {@render children()}
{:else}
  {@const tabs = flags.marketplace
    ? [
        { href: '/catalog', label: $t('nav.catalog'), icon: homeIcon },
        { href: '/chat', label: $t('nav.chat'), icon: chatNavIcon },
        { href: '/child', label: $t('nav.child'), icon: childIcon },
        { href: '/sell', label: $t('nav.sell'), icon: sellIcon },
      ]
    : [
        { href: '/agent', label: $t('nav.agent'), icon: homeIcon },
        { href: '/child', label: $t('nav.child'), icon: childIcon },
        { href: '/profile', label: $t('nav.profile'), icon: profileIcon },
      ]}
  <div class="app-shell" class:app-shell--chat={isChatRoute}>
    <TopBar
      variant={topbarVariant}
      searchPlaceholder={$t('topbar.search_placeholder')}
      searchAriaLabel={$t('topbar.search_aria')}
      publishLabel={$t('topbar.publish')}
      userInitials={initials(data.session?.name ?? '')}
      profileAriaLabel={$t('topbar.profile_aria')}
      logoHref={HOME_ROUTE}
      onNavigate={handleNavigate}
      onProfile={() => goto('/profile')}
    />
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

<ToastContainer />

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
    min-height: 0;
    padding-bottom: 0;
  }

  .app-shell--chat .app-main {
    display: flex;
    flex-direction: column;
  }

  /* Mobile: add space for BottomNav */
  @media (max-width: 64rem) {
    .app-main--with-nav {
      padding-bottom: 2.8rem;
    }
  }
</style>
