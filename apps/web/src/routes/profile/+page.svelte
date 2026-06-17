<script lang="ts">
  import { goto } from '$app/navigation'
  import { t, locale, setLocale } from '$lib/i18n'
  import { mockSession } from '$lib/mocks/data'
  import { User, Globe, Heart, ShoppingBag, Tag, LogOut, ChevronRight } from 'lucide-svelte'

  function handleLogout() {
    console.log('Logout')
    goto('/login')
  }

  function handleLanguageToggle() {
    setLocale($locale === 'pt' ? 'en' : 'pt')
  }
</script>

<svelte:head>
  <title>{$t('profile.title')} | BabyClothes</title>
</svelte:head>

<div class="profile-page">
  <header class="profile-page__header">
    <div class="profile-page__avatar">
      {#if mockSession.avatarUrl}
        <img src={mockSession.avatarUrl} alt={mockSession.name} class="profile-page__avatar-img" />
      {:else}
        <User size={24} />
      {/if}
    </div>
    <div class="profile-page__info">
      <h1 class="profile-page__name">{mockSession.name}</h1>
      <p class="profile-page__email">{mockSession.email}</p>
    </div>
  </header>

  <nav class="profile-page__nav">
    <button class="profile-page__link" onclick={() => console.log('My listings')}>
      <div class="profile-page__link-icon">
        <Tag size={16} />
      </div>
      <span class="profile-page__link-label">{$t('profile.my_listings')}</span>
      <ChevronRight size={16} class="profile-page__link-arrow" />
    </button>

    <button class="profile-page__link" onclick={() => console.log('Favorites')}>
      <div class="profile-page__link-icon">
        <Heart size={16} />
      </div>
      <span class="profile-page__link-label">{$t('profile.favorites')}</span>
      <ChevronRight size={16} class="profile-page__link-arrow" />
    </button>

    <button class="profile-page__link" onclick={() => console.log('Purchases')}>
      <div class="profile-page__link-icon">
        <ShoppingBag size={16} />
      </div>
      <span class="profile-page__link-label">{$t('profile.purchases')}</span>
      <ChevronRight size={16} class="profile-page__link-arrow" />
    </button>

    <button class="profile-page__link" onclick={handleLanguageToggle}>
      <div class="profile-page__link-icon">
        <Globe size={16} />
      </div>
      <span class="profile-page__link-label">{$t('profile.language')}</span>
      <span class="profile-page__link-value">{$locale === 'pt' ? 'Português' : 'English'}</span>
    </button>
  </nav>

  <div class="profile-page__footer">
    <button class="profile-page__logout" onclick={handleLogout}>
      <LogOut size={16} />
      {$t('profile.logout')}
    </button>
  </div>
</div>

<style>
  .profile-page {
    min-height: 100vh;
    background: var(--of2);
    padding-bottom: 5rem;
  }

  .profile-page__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1.5rem 1.5rem;
    background: var(--wh);
    border-radius: 0 0 24px 24px;
  }

  .profile-page__avatar {
    width: 56px;
    height: 56px;
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
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.08);
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    width: 32px;
    height: 32px;
    border-radius: 8px;
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
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 10px;
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
</style>
