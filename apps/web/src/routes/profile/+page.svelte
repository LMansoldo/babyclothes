<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { t, locale, setLocale } from '$lib/i18n'
  import { flags } from '$lib/feature-flags'
  import type { Session } from '$lib/domain/auth/entities/Session'
  import type { Child } from '$lib/domain/child/entities/Child'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { mockSession } from '$lib/mocks/data'
  import { HttpChildRepository } from '$lib/infrastructure/http/HttpChildRepository'
  import {
    PageHeader,
    Avatar,
    Badge,
    ProfileBadge,
    SettingsRow,
    Toggle,
    LanguageToggle,
  } from '@babyclothes/design-system'
  import {
    Heart,
    MessageSquare,
    MapPin,
    Bell,
    Globe,
    HelpCircle,
    ChevronRight,
    LogOut,
  } from 'lucide-svelte'

  const mockMode = PUBLIC_MOCK_DATA === 'true'
  const childRepo = new HttpChildRepository()

  let session = $state<Session | null>(null)
  let loading = $state(true)
  let childrenCount = $state(0)
  let notificationsEnabled = $state(true)

  $effect(() => {
    if (mockMode) {
      session = { ...mockSession }
      childrenCount = 2
    } else {
      const pageSession = $page.data.session
      if (pageSession) {
        session = pageSession
      } else {
        goto('/login')
      }
    }
    loading = false
  })

  $effect(() => {
    if (!session || mockMode) return
    childRepo
      .findAll(session.userId)
      .then((children: Child[]) => {
        childrenCount = children.length
      })
      .catch(() => {
        childrenCount = 0
      })
  })

  async function handleLogout() {
    goto('/login?action=logout')
  }
</script>

<svelte:head>
  <title>{$t('profile.title')} | BabyClothes</title>
</svelte:head>

{#if flags.marketplace}
  <!-- Marketplace mode (original UI) -->
  <div class="profile-page">
    {#if loading}
      <div class="profile-page__loading">
        <p>{$t('common.loading')}</p>
      </div>
    {:else if session}
      <header class="profile-page__header">
        <div class="profile-page__avatar">
          {#if session.avatarUrl}
            <img src={session.avatarUrl} alt={session.name} class="profile-page__avatar-img" />
          {:else}
            <span class="profile-page__avatar-initials">
              {session.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          {/if}
        </div>
        <div class="profile-page__info">
          <h1 class="profile-page__name">{session.name}</h1>
          <p class="profile-page__email">{session.email}</p>
        </div>
      </header>
    {/if}

    <nav class="profile-page__nav">
      <button class="profile-page__link" onclick={() => goto('/catalog')}>
        <div class="profile-page__link-icon">
          <Heart size={16} />
        </div>
        <span class="profile-page__link-label">{$t('profile.favorites')}</span>
        <ChevronRight size={16} class="profile-page__link-arrow" />
      </button>

      <button class="profile-page__link" onclick={() => setLocale($locale === 'pt' ? 'en' : 'pt')}>
        <div class="profile-page__link-icon">
          <Globe size={16} />
        </div>
        <span class="profile-page__link-label">{$t('profile.language')}</span>
        <span class="profile-page__link-value">{$locale === 'pt' ? $t('profile.language_portuguese') : $t('profile.language_english')}</span>
      </button>
    </nav>

    {#if session}
      <div class="profile-page__footer">
        <button class="profile-page__logout" onclick={handleLogout}>
          <LogOut size={16} />
          {$t('profile.logout')}
        </button>
      </div>
    {/if}
  </div>
{:else}
  <!-- Agent mode (mock 08) -->
  <div class="profile-agent">
    {#if loading}
      <div class="profile-agent__loading">
        <p>{$t('common.loading')}</p>
      </div>
    {:else if session}
      <PageHeader
        title={$t('profile.account_title')}
        onBack={() => history.back()}
      />

      <div class="profile-agent__card">
        <Avatar
          name={session.name}
          size="xxl"
          fill="pk"
        />
        <h2 class="profile-agent__name">{session.name}</h2>
        <p class="profile-agent__email">{session.email}</p>
        <div class="profile-agent__badges">
          {#if childrenCount > 0}
            <Badge
              label={$t('profile.badge_children', { count: childrenCount })}
              variant="pk-soft"
              pill
            />
          {/if}
          {#if session.city}
            <Badge
              label={session.city}
              variant="neutral"
              pill
            />
          {/if}
          <ProfileBadge
            label={$t('profile.status_online')}
            variant="status"
            status="online"
          />
        </div>
      </div>

      <div class="profile-agent__list">
        <SettingsRow
          label={$t('profile.my_children')}
          onclick={() => goto('/child')}
        >
          {#snippet icon()}
            <Heart size={16} color="#FF3CAC" />
          {/snippet}
          {#snippet trailing()}
            {#if childrenCount > 0}
              <Badge label={String(childrenCount)} variant="pk-soft" size="sm" pill />
            {/if}
            <ChevronRight size={13} color="#9CA3AF" />
          {/snippet}
        </SettingsRow>

        <SettingsRow
          label={$t('profile.chat_history')}
          onclick={() => goto('/agent')}
        >
          {#snippet icon()}
            <MessageSquare size={16} />
          {/snippet}
          {#snippet trailing()}
            <ChevronRight size={13} color="#9CA3AF" />
          {/snippet}
        </SettingsRow>

        <SettingsRow label={$t('profile.location')}>
          {#snippet icon()}
            <MapPin size={16} />
          {/snippet}
          {#snippet trailing()}
            {#if session?.city}
              <span class="profile-agent__value">{session.city}</span>
            {/if}
            <ChevronRight size={13} color="#9CA3AF" />
          {/snippet}
        </SettingsRow>

        <SettingsRow label={$t('profile.notifications')}>
          {#snippet icon()}
            <Bell size={16} />
          {/snippet}
          {#snippet trailing()}
            <Toggle
              checked={notificationsEnabled}
              size="sm"
              onchange={(value: boolean) => { notificationsEnabled = value }}
            />
          {/snippet}
        </SettingsRow>

        <SettingsRow label={$t('profile.language')}>
          {#snippet icon()}
            <Globe size={16} />
          {/snippet}
          {#snippet trailing()}
            <LanguageToggle
              current={$locale === 'pt' ? 'pt' : 'en'}
              onchange={(lang: 'pt' | 'en') => setLocale(lang)}
            />
          {/snippet}
        </SettingsRow>

        <SettingsRow
          label={$t('profile.help')}
          onclick={() => goto('/help')}
        >
          {#snippet icon()}
            <HelpCircle size={16} />
          {/snippet}
          {#snippet trailing()}
            <ChevronRight size={13} color="#9CA3AF" />
          {/snippet}
        </SettingsRow>
      </div>

      <div class="profile-agent__footer">
        <button class="profile-agent__logout" onclick={handleLogout}>
          <LogOut size={14} />
          {$t('profile.logout_account')}
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ── Marketplace mode ── */
  .profile-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding-bottom: 5rem;
  }

  .profile-page__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1.5rem 1.5rem;
    background: var(--wh);
    border-radius: 0 0 2.4rem 2.4rem;
  }

  .profile-page__avatar {
    width: 5.6rem;
    height: 5.6rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--pk), #7b2ff7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wh);
    flex-shrink: 0;
    overflow: hidden;
  }

  .profile-page__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-page__avatar-initials {
    font-family: var(--font-lato);
    font-weight: 900;
    font-size: 1.5rem;
    color: var(--wh);
  }

  .profile-page__info {
    flex: 1;
    min-width: 0;
  }

  .profile-page__name {
    font-family: var(--ld);
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0;
  }

  .profile-page__email {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.78rem;
    color: var(--gr);
    margin: 0.15rem 0 0;
  }

  .profile-page__nav {
    margin: 1rem;
    background: var(--wh);
    border-radius: 1.6rem;
    border: 0.1rem solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .profile-page__link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
    font: inherit;
    color: inherit;
  }

  .profile-page__link:last-child {
    border-bottom: none;
  }

  .profile-page__link:hover {
    background: var(--of2);
  }

  .profile-page__link-icon {
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 0.8rem;
    background: var(--of2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bk);
    flex-shrink: 0;
  }

  .profile-page__link-label {
    flex: 1;
    font-family: var(--ld);
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--bk);
  }

  .profile-page__link-value {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.75rem;
    color: var(--gr);
  }

  .profile-page__footer {
    padding: 1.5rem 1rem;
    display: flex;
    justify-content: center;
  }

  .profile-page__logout {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.5rem;
    background: none;
    border: 0.1rem solid rgba(0, 0, 0, 0.12);
    border-radius: 1rem;
    font-family: var(--ld);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--bk);
    cursor: pointer;
    transition: all 0.15s;
  }

  .profile-page__logout:hover {
    background: var(--wh);
    border-color: rgba(0, 0, 0, 0.2);
  }

  /* ── Agent mode (mock 08) ── */
  .profile-agent {
    min-height: 100vh;
    background: #F9FAFB;
  }

  .profile-agent__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    font-family: var(--font-lato);
    color: #9CA3AF;
  }

  .profile-agent__card {
    background: #fff;
    padding: 2.2rem 2rem 1.8rem;
    text-align: center;
    border-bottom: 1px solid #F3F4F6;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .profile-agent__name {
    font-family: var(--font-lato);
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    margin: 1.2rem 0 0.3rem;
  }

  .profile-agent__email {
    font-family: var(--font-lato);
    font-size: 0.78rem;
    color: #9CA3AF;
    margin: 0 0 1rem;
  }

  .profile-agent__badges {
    display: flex;
    gap: 0.6rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .profile-agent__list {
    padding: 1.2rem 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .profile-agent__value {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    color: #9CA3AF;
  }

  .profile-agent__footer {
    padding: 1.4rem 1.6rem;
  }

  .profile-agent__logout {
    width: 100%;
    padding: 1.2rem;
    border-radius: 1rem;
    background: transparent;
    border: 1.5px solid #EDE9E4;
    cursor: pointer;
    font-family: var(--font-lato);
    font-size: 0.85rem;
    font-weight: 700;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    transition: background 0.15s;
  }

  .profile-agent__logout:hover {
    background: #FEF2F2;
  }
</style>
