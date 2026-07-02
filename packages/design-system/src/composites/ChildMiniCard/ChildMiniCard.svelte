<script lang="ts">
  import { Avatar } from '../../primitives/Avatar/index.js'
  import { Chip } from '../../primitives/Chip/index.js'
  import { ProgressBar } from '../../primitives/ProgressBar/index.js'

  let {
    name,
    age,
    size,
    avatarUrl,
    progress,
    progressLabel,
    selected = false,
    sizeLabel,
    onclick,
    variant,
  }: {
    name: string
    age: string
    size: string
    avatarUrl?: string
    progress?: number
    progressLabel?: string
    selected?: boolean
    sizeLabel?: string
    onclick?: () => void
    variant?: 'compact' | 'full'
  } = $props()

  let resolvedVariant = $derived(variant ?? (progress != null ? 'full' : 'compact'))
  let interactive = $derived(onclick != null)
  let szLabel = $derived(sizeLabel ?? 'Tamanho')
  let pct = $derived(progress ?? 0)
  let ariaLabel = $derived(
    `${name}, ${age}, ${szLabel} ${size}${progress != null ? `, ${progressLabel ?? 'Progresso'} ${pct}%` : ''}`
  )
</script>

{#if resolvedVariant === 'compact'}
  {#if interactive}
    <button
      type="button"
      class="mini mini--compact mini--clickable"
      class:mini--selected={selected}
      aria-pressed={selected}
      aria-label={ariaLabel}
      {onclick}
    >
      <Avatar name={name} src={avatarUrl} size="sm" />
      <span class="mini__name">{name}</span>
      <span class="mini__size-chip">
        <Chip label={size} variant="size" size="sm" />
      </span>
    </button>
  {:else}
    <div class="mini mini--compact" aria-label={ariaLabel}>
      <Avatar name={name} src={avatarUrl} size="sm" />
      <span class="mini__name">{name}</span>
      <span class="mini__size-chip">
        <Chip label={size} variant="size" size="sm" />
      </span>
    </div>
  {/if}
{:else}
  {#if interactive}
    <button
      type="button"
      class="mini mini--full mini--clickable"
      class:mini--selected={selected}
      aria-pressed={selected}
      aria-label={ariaLabel}
      {onclick}
    >
      <div class="mini__avatar-wrap">
        <Avatar name={name} src={avatarUrl} size="lg" />
      </div>
      <span class="mini__name mini__name--full">{name}</span>
      <span class="mini__age">{age}</span>
      <span class="mini__size-chip mini__size-chip--full">
        <Chip label="{szLabel} {size}" variant="size" size="sm" />
      </span>
      {#if progress != null}
        <div class="mini__progress">
          <ProgressBar
            value={progress}
            max={100}
            variant="pink"
            showLabel={true}
            labelFormat={(v: number) => `${progressLabel ?? ''} ${v}%`}
            height={4}
            animated={true}
          />
        </div>
      {/if}
    </button>
  {:else}
    <div class="mini mini--full" aria-label={ariaLabel}>
      <div class="mini__avatar-wrap">
        <Avatar name={name} src={avatarUrl} size="lg" />
      </div>
      <span class="mini__name mini__name--full">{name}</span>
      <span class="mini__age">{age}</span>
      <span class="mini__size-chip mini__size-chip--full">
        <Chip label="{szLabel} {size}" variant="size" size="sm" />
      </span>
      {#if progress != null}
        <div class="mini__progress">
          <ProgressBar
            value={progress}
            max={100}
            variant="pink"
            showLabel={true}
            labelFormat={(v: number) => `${progressLabel ?? ''} ${v}%`}
            height={4}
            animated={true}
          />
        </div>
      {/if}
    </div>
  {/if}
{/if}

<style>
  /* ── Shared ───────────────────────────────────── */
  .mini {
    display: flex;
    align-items: center;
    font-family: var(--font-lato);
    border: none;
    background: transparent;
    text-align: left;
    transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .mini--clickable {
    cursor: pointer;
  }

  .mini--clickable:focus-visible {
    box-shadow: 0 0 0 0.2rem var(--pk);
    outline: none;
  }

  .mini__name {
    font-weight: 700;
    color: var(--bk);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Compact variant ──────────────────────────── */
  .mini--compact {
    gap: 0.6rem;
    padding: 0.5rem 0.8rem;
    border-radius: var(--radius-pill);
    border: 0.1rem solid transparent;
    width: fit-content;
  }

  .mini--compact.mini--selected {
    background: var(--pk3);
    border-color: var(--pk);
  }

  .mini--compact.mini--clickable:hover:not(.mini--selected) {
    background: var(--of2);
  }

  .mini--compact .mini__name {
    font-size: 1.3rem;
    max-width: 8rem;
    color: var(--bk);
  }

  .mini__size-chip {
    flex-shrink: 0;
  }

  /* ── Full variant ─────────────────────────────── */
  .mini--full {
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 1rem 0.8rem;
    border-radius: var(--r);
    border: 0.1rem solid transparent;
    width: 10rem;
    background: var(--wh);
  }

  .mini--full.mini--selected {
    border-color: var(--pk);
    background: var(--pk3);
  }

  .mini--full.mini--clickable:hover:not(.mini--selected) {
    box-shadow: var(--shadow-sm);
  }

  .mini__avatar-wrap {
    width: 4.8rem;
    height: 4.8rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
    padding: 0.1rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .mini__avatar-wrap :global(.avatar) {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }

  .mini__name--full {
    font-size: 1.4rem;
    max-width: 100%;
    text-align: center;
  }

  .mini__age {
    font-size: 1.1rem;
    color: var(--gr2);
  }

  .mini__size-chip--full {
    margin-top: 0.1rem;
  }

  .mini__progress {
    width: 100%;
    margin-top: 0.4rem;
  }
</style>
