<script lang="ts">
  import { Chip } from '../../primitives/Chip/index.js'

  let {
    children,
    selectedId,
    onSelect,
    onAdd,
    addLabel = '+',
  }: {
    children: { id: string; name: string; age: string; size: string; avatarUrl?: string }[]
    selectedId?: string
    onSelect?: (id: string) => void
    onAdd?: () => void
    addLabel?: string
  } = $props()

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  function selectChild(id: string) {
    if (id === selectedId) return
    onSelect?.(id)
  }

  function handleKeydown(e: KeyboardEvent, childId: string) {
    const options = (e.currentTarget as HTMLElement)
      .closest('.child-selector')
      ?.querySelectorAll('[role="option"]')

    if (!options) return

    const currentIndex = Array.from(options).indexOf(e.target as HTMLElement)

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = options[(currentIndex + 1) % options.length] as HTMLElement
      next?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = options[
        (currentIndex - 1 + options.length) % options.length
      ] as HTMLElement
      prev?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectChild(childId)
    }
  }
</script>

<div class="child-selector" role="listbox" aria-label="Selecionar criança">
  {#each children as child (child.id)}
    <button
      class="child-selector__chip"
      class:child-selector__chip--selected={selectedId === child.id}
      role="option"
      aria-selected={selectedId === child.id}
      type="button"
      onclick={() => selectChild(child.id)}
      onkeydown={(e: KeyboardEvent) => handleKeydown(e, child.id)}
    >
      {#if child.avatarUrl}
        <img
          class="child-selector__avatar"
          src={child.avatarUrl}
          alt={child.name}
          loading="lazy"
        />
      {:else}
        <span class="child-selector__avatar child-selector__avatar--initial">
          {getInitials(child.name)}
        </span>
      {/if}

      <span class="child-selector__name">{child.name}</span>

      {#if child.size}
        <Chip
          label={child.size}
          variant="size"
          selected={true}
          size="sm"
        />
      {/if}
    </button>
  {/each}

  {#if onAdd}
    <button
      class="child-selector__add"
      type="button"
      aria-label="Adicionar criança"
      onclick={onAdd}
    >
      <svg
        class="child-selector__add-svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {#if addLabel !== '+'}
        <span class="child-selector__add-label">{addLabel}</span>
      {/if}
    </button>
  {/if}
</div>

<style>
  .child-selector {
    display: flex;
    gap: 0.6rem;
    overflow-x: auto;
    padding: 0.4rem 0;
    scrollbar-width: none;
  }

  .child-selector::-webkit-scrollbar {
    display: none;
  }

  .child-selector__chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem;
    border: 0.2rem solid transparent;
    border-radius: 0.75rem;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    font: inherit;
    color: inherit;
  }

  .child-selector__chip:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--pk);
  }

  .child-selector__chip:hover {
    background: #F3F4F6;
  }

  .child-selector__chip--selected {
    background: var(--pk3);
    border-color: var(--pk);
  }

  .child-selector__chip--selected:hover {
    background: var(--pk3);
  }

  .child-selector__avatar {
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .child-selector__avatar--initial {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
    color: var(--wh);
    font-family: var(--font-lato);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .child-selector__name {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--bk);
    white-space: nowrap;
  }

  .child-selector__add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    border: none;
    background: #F3F4F6;
    color: var(--gr);
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .child-selector__add:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--pk);
  }

  .child-selector__add:hover {
    background: #E5E7EB;
    color: var(--bk);
  }

  .child-selector__add-svg {
    flex-shrink: 0;
  }
</style>
