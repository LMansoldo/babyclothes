<script lang="ts">
  import { IconButton } from '../../primitives/IconButton/index.js'

  let {
    placeholder = 'Buscar no catálogo...',
    value = '',
    ariaLabel = 'Buscar itens',
    debounceMs = 300,
    oninput,
    onsubmit,
  }: {
    placeholder?: string
    value?: string
    ariaLabel?: string
    debounceMs?: number
    oninput?: (value: string) => void
    onsubmit?: (value: string) => void
  } = $props()

  let innerValue = $state(value)
  let debounceTimer: ReturnType<typeof setTimeout> | null = $state(null)

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    innerValue = target.value

    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
      oninput?.(innerValue)
    }, debounceMs)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        oninput?.(innerValue)
      }
      onsubmit?.(innerValue)
    }
  }

  function handleClear() {
    innerValue = ''
    if (debounceTimer) clearTimeout(debounceTimer)
    oninput?.('')
  }
</script>

<div class="search-bar" role="search">
  <div class="search-bar__inner">
    <!-- search icon -->
    <svg class="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>

    <input
      type="search"
      class="search-bar__input"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={innerValue}
      oninput={handleInput}
      onkeydown={handleKeyDown}
    />

    {#if innerValue}
      <span class="search-bar__clear">
        <IconButton icon="close" variant="ghost" size={28} onclick={handleClear} ariaLabel="Limpar busca" />
      </span>
    {/if}
  </div>
</div>

<style>
  .search-bar {
    width: 100%;
    max-width: 40rem;
  }

  .search-bar__inner {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: #F3F4F6;
    border-radius: var(--radius-pill);
    padding: 0.4rem 1.2rem;
    transition: background var(--transition-fast);
  }

  .search-bar__inner:focus-within {
    background: #E5E7EB;
    box-shadow: 0 0 0 0.2rem var(--pk);
  }

  .search-bar__icon {
    flex-shrink: 0;
    color: var(--gr);
  }

  .search-bar__input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: var(--font-lato);
    font-size: 1.4rem;
    color: var(--bk);
    min-width: 0;
  }

  .search-bar__input::placeholder {
    color: var(--gr2);
  }

  .search-bar__input::-webkit-search-decoration,
  .search-bar__input::-webkit-search-cancel-button,
  .search-bar__input::-webkit-search-results-button,
  .search-bar__input::-webkit-search-results-decoration {
    display: none;
  }

  .search-bar__clear {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
