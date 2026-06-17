<script lang="ts">
  import { Plus } from 'lucide-svelte'
  import { t } from '$lib/i18n'

  type ChildOption = {
    id: string
    name: string
    age: string
    size: string
  }

  let {
    children = [],
    activeId = '',
    onSelect,
    onAdd,
  }: {
    children?: ChildOption[]
    activeId?: string
    onSelect?: (id: string) => void
    onAdd?: () => void
  } = $props()

  function initials(name: string): string {
    return name.charAt(0).toUpperCase()
  }
</script>

<div class="childselector">
  {#each children as child (child.id)}
    <button
      class="childselector__chip"
      class:childselector__chip--active={activeId === child.id}
      onclick={() => onSelect?.(child.id)}
    >
      <span class="childselector__avatar">
        {initials(child.name)}
      </span>
      <span class="childselector__name">{child.name}</span>
      <span class="childselector__age">{child.age}</span>
      <span class="childselector__size">{child.size}</span>
    </button>
  {/each}

  {#if onAdd}
    <button class="childselector__add" onclick={onAdd}>
      <Plus size={14} strokeWidth={2.5} />
      <span>{$t('child_selector.add_child')}</span>
    </button>
  {/if}
</div>

<style>
  .childselector {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.5rem 0;
    scrollbar-width: none;
  }

  .childselector::-webkit-scrollbar {
    display: none;
  }

  .childselector__chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: var(--of2);
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    border-radius: 100px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
  }

  .childselector__chip:hover {
    border-color: rgba(0, 0, 0, 0.15);
  }

  .childselector__chip--active {
    background: var(--pk3);
    border-color: var(--pk2);
  }

  .childselector__avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--pk), #7b2ff7);
    color: var(--wh);
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .childselector__name {
    font-family: var(--ld);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--bk);
  }

  .childselector__age {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.65rem;
    color: var(--gr);
  }

  .childselector__size {
    font-family: var(--ld);
    font-size: 0.58rem;
    font-weight: 700;
    color: var(--pk);
    background: var(--pk3);
    border-radius: 4px;
    padding: 0.1rem 0.3rem;
  }

  .childselector__add {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.75rem;
    background: none;
    border: 1.5px dashed rgba(0, 0, 0, 0.15);
    border-radius: 100px;
    cursor: pointer;
    color: var(--gr);
    font-family: var(--ld);
    font-size: 0.68rem;
    font-weight: 700;
    white-space: nowrap;
    transition: all 0.15s;
  }

  .childselector__add:hover {
    border-color: var(--pk);
    color: var(--pk);
    background: var(--pk3);
  }
</style>
