<script lang="ts">
  import { IconButton } from '../../primitives/IconButton/index.js'

  let {
    showBack = true,
    showFav = true,
    showShare = true,
    isFavorited = false,
    onBack,
    onFav,
    onShare,
  }: {
    showBack?: boolean
    showFav?: boolean
    showShare?: boolean
    isFavorited?: boolean
    onBack?: () => void
    onFav?: () => void
    onShare?: () => void
  } = $props()
</script>

<nav class="action-bar" aria-label="Ações do produto">
  {#if showBack}
    <IconButton
      icon="back"
      variant="glass"
      size={32}
      ariaLabel="Voltar"
      onclick={onBack}
    />
  {/if}

  <span class="action-bar__spacer"></span>

  {#if showFav}
    <IconButton
      icon="fav"
      variant="glass"
      size={32}
      active={isFavorited}
      ariaLabel={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      onclick={onFav}
    />
  {/if}

  {#if showShare}
    <IconButton
      icon="share"
      variant="glass"
      size={32}
      ariaLabel="Compartilhar"
      onclick={onShare}
    />
  {/if}
</nav>

<style>
  .action-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.2rem;
  }

  .action-bar__spacer {
    flex: 1;
  }
</style>
