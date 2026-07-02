<script lang="ts">
  import { Chip } from '../../primitives/Chip/index.js'

  let {
    current = 'pt',
    labels = { pt: 'PT-BR', en: 'EN' },
    onchange,
  }: {
    current: 'pt' | 'en'
    labels?: { pt: string; en: string }
    onchange?: (lang: 'pt' | 'en') => void
  } = $props()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = current === 'pt' ? 'en' : 'pt'
      current = next
      onchange?.(next)
    }
  }

  function select(lang: 'pt' | 'en') {
    if (lang === current) return
    current = lang
    onchange?.(lang)
  }
</script>

<div
  class="lang-toggle"
  role="radiogroup"
  aria-label="Selecionar idioma"
  onkeydown={handleKeydown}
>
  <div class="lang-toggle__option" role="radio" aria-checked={current === 'pt'}>
    <Chip
      label={labels.pt}
      variant={current === 'pt' ? 'selected' : 'neutral'}
      selected={current === 'pt'}
      onclick={() => select('pt')}
      ariaLabel="Português"
    />
  </div>
  <div class="lang-toggle__option" role="radio" aria-checked={current === 'en'}>
    <Chip
      label={labels.en}
      variant={current === 'en' ? 'selected' : 'neutral'}
      selected={current === 'en'}
      onclick={() => select('en')}
      ariaLabel="English"
    />
  </div>
</div>

<style>
  .lang-toggle {
    display: inline-flex;
  }

  .lang-toggle__option {
    display: flex;
  }

  .lang-toggle__option:first-child :global(.chip) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .lang-toggle__option:last-child :global(.chip) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
</style>
