<script lang="ts">
  import { Avatar } from '../../primitives/Avatar/index.js'

  let {
    name,
    avatar,
    verified = false,
    listingCount,
    listingLabel,
    verifiedLabel,
    onclick,
  }: {
    name: string
    avatar: string
    verified?: boolean
    listingCount?: number
    listingLabel?: string
    verifiedLabel?: string
    onclick?: () => void
  } = $props()

  let label = $derived(verifiedLabel ?? 'Verificado')
  let listLabel = $derived(listingLabel ?? 'anúncios')
  let interactive = $derived(onclick != null)
  let aria = $derived(
    `Perfil de ${name}${listingCount != null ? `, ${listingCount} ${listLabel}` : ''}.${verified ? ` ${label}` : ''}`
  )
</script>

{#if interactive}
  <button
    type="button"
    class="seller-row seller-row--clickable"
    aria-label={aria}
    {onclick}
  >
    <div class="seller-row__left">
      <Avatar name={name} src={avatar} size="md" verified={verified} />
      <div class="seller-row__info">
        <span class="seller-row__name">
          {name}
          {#if verified}
            <svg class="seller-row__verified" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="var(--pk)"/>
              <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {/if}
        </span>
        {#if listingCount != null}
          <span class="seller-row__meta">{listingCount} {listLabel}</span>
        {/if}
      </div>
    </div>
    <svg class="seller-row__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </button>
{:else}
  <div class="seller-row" aria-label={aria}>
    <div class="seller-row__left">
      <Avatar name={name} src={avatar} size="md" verified={verified} />
      <div class="seller-row__info">
        <span class="seller-row__name">
          {name}
          {#if verified}
            <svg class="seller-row__verified" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="var(--pk)"/>
              <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {/if}
        </span>
        {#if listingCount != null}
          <span class="seller-row__meta">{listingCount} {listLabel}</span>
        {/if}
      </div>
    </div>
    <svg class="seller-row__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </div>
{/if}

<style>
  .seller-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.8rem 1rem;
    border-top: 0.1rem solid rgba(255, 255, 255, 0.06);
    background: transparent;
    border-left: none;
    border-right: none;
    border-bottom: none;
    font: inherit;
    color: inherit;
    text-align: left;
    transition: background var(--transition-fast);
  }

  .seller-row--clickable {
    cursor: pointer;
  }

  .seller-row--clickable:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .seller-row__left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
  }

  .seller-row__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .seller-row__name {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-family: var(--font-lato);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--wh);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .seller-row__verified {
    flex-shrink: 0;
  }

  .seller-row__meta {
    font-family: var(--font-lato);
    font-size: 1.1rem;
    color: var(--gr2);
    white-space: nowrap;
  }

  .seller-row__chevron {
    flex-shrink: 0;
    color: var(--gr2);
    margin-left: 0.8rem;
  }
</style>
