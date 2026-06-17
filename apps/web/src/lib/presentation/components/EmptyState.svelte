<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    variant,
    title,
    description,
    accent = 'default',
    action,
    icon,
  }: {
    variant: 'centered' | 'inline'
    title: string
    description: string
    accent?: 'default' | 'pink'
    action?: {
      label: string
      variant: 'pk' | 'bk' | 'ghost'
      onclick: () => void
    }
    icon?: Snippet
  } = $props()
</script>

{#if variant === 'centered'}
  <div class="emptystate emptystate--centered">
    <div class="emptystate__shape" class:emptystate__shape--pink={accent === 'pink'}>
      {#if icon}
        {@render icon()}
      {:else}
        <div class="emptystate__shape-inner"></div>
      {/if}
    </div>

    <p class="emptystate__title">{title}</p>
    <p class="emptystate__description">{description}</p>

    {#if action}
      <button
        class="emptystate__action emptystate__action--{action.variant}"
        onclick={action.onclick}
      >
        {action.label}
      </button>
    {/if}
  </div>
{:else}
  <div class="emptystate emptystate--inline">
    <div class="emptystate__icon">
      {#if icon}
        {@render icon()}
      {:else}
        <div class="emptystate__icon-dot"></div>
      {/if}
    </div>

    <div class="emptystate__info">
      <p class="emptystate__title">{title}</p>
      <p class="emptystate__description">{description}</p>
    </div>
  </div>
{/if}

<style>
  /* ── Base ─────────────────────────────────────────── */
  .emptystate {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 2rem;
    text-align: center;
  }

  /* ── Centered variant ────────────────────────────── */
  .emptystate--centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .emptystate__shape {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--of2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    position: relative;
  }

  .emptystate__shape--pink {
    background: var(--pk3);
  }

  .emptystate__shape-inner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--of3);
  }

  .emptystate__shape--pink .emptystate__shape-inner {
    background: var(--pk2);
  }

  .emptystate__title {
    font-family: var(--ld);
    font-size: 0.92rem;
    font-weight: 900;
    color: var(--bk);
    letter-spacing: -0.02em;
    margin: 0 0 0.4rem;
  }

  .emptystate__description {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.85rem;
    color: var(--gr);
    line-height: 1.65;
    max-width: 260px;
    margin: 0 0 1.25rem;
  }

  .emptystate__action {
    border: none;
    border-radius: 10px;
    padding: 0.7rem 1.4rem;
    font-family: var(--ld);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  .emptystate__action--pk {
    background: var(--pk);
    color: var(--wh);
  }

  .emptystate__action--pk:hover {
    opacity: 0.9;
  }

  .emptystate__action--bk {
    background: var(--bk);
    color: var(--wh);
  }

  .emptystate__action--bk:hover {
    opacity: 0.88;
  }

  .emptystate__action--ghost {
    background: var(--of2);
    color: var(--bk);
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .emptystate__action--ghost:hover {
    background: var(--of3);
  }

  /* ── Inline variant ──────────────────────────────── */
  .emptystate--inline {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.9rem;
    padding: 1.1rem;
    background: var(--of2);
    border-radius: 12px;
  }

  .emptystate__icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--of3);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emptystate__icon-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--gr2);
  }

  .emptystate__info {
    flex: 1;
    text-align: left;
  }

  .emptystate--inline .emptystate__title {
    font-family: var(--ld);
    font-size: 0.76rem;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.4);
    margin-bottom: 0.18rem;
  }

  .emptystate--inline .emptystate__description {
    font-family: var(--sr);
    font-size: 0.68rem;
    font-style: italic;
    color: var(--gr2);
    line-height: 1.5;
    max-width: none;
    margin-bottom: 0;
  }
</style>
