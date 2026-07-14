<script lang="ts">
  import type { Snippet } from 'svelte'

  export interface AgentFormCardProps {
    title: string
    children?: Snippet
    maxWidth?: string
  }

  let {
    title,
    children,
    maxWidth,
  }: AgentFormCardProps = $props()
</script>

<div class="agentformcard" style:max-width={maxWidth}>
  <div class="agentformcard__header">
    <span class="agentformcard__badge">
      <svg width="12" height="12" viewBox="0 0 20 24" fill="none" aria-hidden="true">
        <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="currentColor"/>
      </svg>
      <span>IA</span>
    </span>
    <h3 class="agentformcard__title">{title}</h3>
  </div>
  <div class="agentformcard__body">
    {@render children?.()}
  </div>
</div>

<style>
  .agentformcard {
    background: #fff;
    border: 0.075rem solid #FFD0ED;
    border-radius: 1.4rem;
    padding: 1.4rem;
    width: 100%;
  }

  .agentformcard__header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .agentformcard__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.8rem;
    border-radius: 99rem;
    background: var(--bk);
    color: #fff;
    font-family: var(--font-lato);
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 1;
  }

  .agentformcard__badge svg {
    flex-shrink: 0;
  }

  .agentformcard__title {
    font-family: var(--font-lato);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--bk);
    margin: 0;
  }

  .agentformcard__body {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
</style>
