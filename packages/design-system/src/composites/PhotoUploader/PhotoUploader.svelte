<script lang="ts">
  import { IconButton } from '../../primitives/IconButton/index.js'

  type Photo = { id: string; url?: string; file?: File }

  let {
    photos = [],
    maxPhotos = 4,
    gridCols = 4,
    onAdd,
    onRemove,
  }: {
    photos?: Photo[]
    maxPhotos?: number
    gridCols?: 3 | 4
    onAdd?: () => void
    onRemove?: (id: string) => void
  } = $props()

  let slots = $derived(Array.from({ length: maxPhotos }, (_, i) => photos[i] ?? null))
</script>

<div class="uploader" style="--uploader-cols: {gridCols}">
  {#each slots as photo, i}
    {@const slotNum = i + 1}
    {#if photo}
      <div class="uploader__slot uploader__slot--filled">
        <div
          class="uploader__image"
          style="background-image: url({photo.url ?? ''})"
          role="img"
          aria-label="Foto {slotNum}"
        ></div>
        <span class="uploader__remove">
          <IconButton
            icon="close"
            variant="dark"
            size={28}
            onclick={() => onRemove?.(photo.id)}
            ariaLabel="Remover foto {slotNum}"
          />
        </span>
      </div>
    {:else}
      <button
        type="button"
        class="uploader__slot uploader__slot--empty"
        onclick={() => onAdd?.()}
        aria-label="Adicionar foto {slotNum}"
      >
        <svg class="uploader__plus" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    {/if}
  {/each}
</div>

<style>
  .uploader {
    display: grid;
    grid-template-columns: repeat(var(--uploader-cols), 1fr);
    gap: 0.5rem;
    width: 100%;
  }

  .uploader__slot {
    position: relative;
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  /* ── Filled slot ─────────────────────────────── */
  .uploader__slot--filled {
    border: none;
  }

  .uploader__image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .uploader__remove {
    position: absolute;
    top: 0.3rem;
    right: 0.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Empty slot ──────────────────────────────── */
  .uploader__slot--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0.075rem dashed #D1D5DB;
    background: linear-gradient(135deg, rgba(255, 60, 172, 0.15), rgba(176, 62, 255, 0.15));
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast);
    font: inherit;
    color: inherit;
    padding: 0;
  }

  .uploader__slot--empty:hover {
    border-color: var(--pk);
    background: linear-gradient(135deg, rgba(255, 60, 172, 0.22), rgba(176, 62, 255, 0.22));
  }

  .uploader__slot--empty:focus-visible {
    box-shadow: 0 0 0 0.2rem var(--pk);
    outline: none;
  }

  .uploader__plus {
    color: var(--gr2);
    transition: color var(--transition-fast);
  }

  .uploader__slot--empty:hover .uploader__plus {
    color: var(--pk);
  }
</style>
