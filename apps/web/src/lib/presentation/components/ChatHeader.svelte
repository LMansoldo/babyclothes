<script lang="ts">
  import { Baby, MoreHorizontal } from 'lucide-svelte'

  let {
    title = 'Agente BabyClothes',
    subtitle = 'assistente de descoberta e crescimento',
    childContext,
    onMore,
  }: {
    title?: string
    subtitle?: string
    childContext?: string
    onMore?: () => void
  } = $props()
</script>

<header class="header">
  <div class="header__left">
    <div class="header__avatar">
      <span class="header__avatar-dot"></span>
    </div>
    <div class="header__info">
      <span class="header__name">{title}</span>
      <div class="header__sub">
        <span class="header__subtitle">{subtitle}</span>
        <span class="header__live-pill">
          <span class="header__live-dot"></span>
          SSE ao vivo
        </span>
      </div>
    </div>
  </div>

  <div class="header__actions">
    {#if childContext}
      <button class="header__btn" aria-label="Contexto da crian&ccedil;a">
        <Baby size={14} strokeWidth={2} />
        <span>{childContext}</span>
      </button>
    {/if}
    <button class="header__btn" onclick={onMore} aria-label="Mais op&ccedil;&otilde;es">
      <MoreHorizontal size={14} strokeWidth={2} />
    </button>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 5vw;
    background: rgba(255, 255, 255, 0.38);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-bottom: 1px solid var(--glass-brd);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }

  .header__left {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  /* ── Avatar ── */
  .header__avatar {
    width: 38px;
    height: 38px;
    border-radius: var(--r);
    background: var(--bk);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(10, 10, 10, 0.25);
  }

  .header__avatar-dot {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background: var(--pk);
  }

  /* ── Info ── */
  .header__info {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }

  .header__name {
    font-family: var(--ld);
    font-weight: 900;
    font-size: 0.88rem;
    color: var(--bk);
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .header__sub {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header__subtitle {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.72rem;
    color: var(--gr);
  }

  /* ── Live pill ── */
  .header__live-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: var(--r-xs);
    padding: 0.08rem 0.4rem;
    font-family: var(--ld);
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #16A34A;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .header__live-dot {
    width: 5px;
    height: 5px;
    background: #22C55E;
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }

  /* ── Actions ── */
  .header__actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .header__btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    height: 32px;
    border-radius: var(--r-sm);
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.7);
    padding: 0 0.7rem;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .header__btn:hover {
    background: rgba(255, 255, 255, 0.7);
    color: var(--bk);
  }
</style>
