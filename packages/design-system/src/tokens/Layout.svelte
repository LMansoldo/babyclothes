<script lang="ts">
  let { story = 'breakpoints' }: { story?: 'breakpoints' | 'container' | 'grid' } = $props()
</script>

{#if story === 'breakpoints'}
  <div class="layout-demo">
    <h3 class="layout-demo__title">Breakpoints</h3>
    <div class="layout-demo__breakpoints">
      <div class="layout-demo__bp layout-demo__bp--mobile">
        <span class="layout-demo__bp-label">mobile</span>
        <span class="layout-demo__bp-value">&lt; 640px</span>
      </div>
      <div class="layout-demo__bp layout-demo__bp--medium">
        <span class="layout-demo__bp-label">medium</span>
        <span class="layout-demo__bp-value">≥ 640px</span>
      </div>
      <div class="layout-demo__bp layout-demo__bp--large">
        <span class="layout-demo__bp-label">large</span>
        <span class="layout-demo__bp-value">≥ 1024px</span>
      </div>
      <div class="layout-demo__bp layout-demo__bp--ultra">
        <span class="layout-demo__bp-label">ultra</span>
        <span class="layout-demo__bp-value">≥ 1440px</span>
      </div>
    </div>
    <table class="layout-demo__table">
      <thead>
        <tr><th>Tier</th><th>@media (min-width)</th><th>px</th><th>Uso</th></tr>
      </thead>
      <tbody>
        <tr><td>mobile</td><td>— (default)</td><td>&lt; 640</td><td>Celular</td></tr>
        <tr><td>medium</td><td>40rem</td><td>≥ 640</td><td>Tablet</td></tr>
        <tr><td>large</td><td>64rem</td><td>≥ 1024</td><td>Desktop</td></tr>
        <tr><td>ultra</td><td>90rem</td><td>≥ 1440</td><td>Desktop wide</td></tr>
      </tbody>
    </table>
  </div>

{:else if story === 'container'}
  <div class="layout-demo">
    <h3 class="layout-demo__title">Container</h3>
    <div class="layout-demo__container-wrap">
      <div class="container layout-demo__container">
        <p class="layout-demo__container-text">.container — conteúdo limitado com gutters responsivos</p>
      </div>
    </div>
    <table class="layout-demo__table">
      <thead>
        <tr><th>Tier</th><th>max-width</th><th>padding-inline</th></tr>
      </thead>
      <tbody>
        <tr><td>mobile</td><td>100%</td><td>1rem (20px)</td></tr>
        <tr><td>medium</td><td>36rem (720px)</td><td>1.5rem (30px)</td></tr>
        <tr><td>large</td><td>48rem (960px)</td><td>2rem (40px)</td></tr>
        <tr><td>ultra</td><td>60rem (1200px)</td><td>2rem (40px)</td></tr>
      </tbody>
    </table>
    <div class="layout-demo__tokens">
      <code>--container-medium: 36rem</code>
      <code>--container-large: 48rem</code>
      <code>--container-ultra: 60rem</code>
      <code>--gutter-mobile: 1rem</code>
      <code>--gutter-medium: 1.5rem</code>
      <code>--gutter-large: 2rem</code>
    </div>
  </div>

{:else if story === 'grid'}
  <div class="layout-demo">
    <h3 class="layout-demo__title">Grid</h3>
    <div class="grid layout-demo__grid">
      {#each Array(12) as _, i}
        <div class="layout-demo__cell">{i + 1}</div>
      {/each}
    </div>
    <table class="layout-demo__table">
      <thead>
        <tr><th>Tier</th><th>Colunas</th><th>Gap</th></tr>
      </thead>
      <tbody>
        <tr><td>mobile</td><td>4</td><td>--space-4 (1rem)</td></tr>
        <tr><td>medium</td><td>8</td><td>--space-5 (1.25rem)</td></tr>
        <tr><td>large / ultra</td><td>12</td><td>--space-6 (1.5rem)</td></tr>
      </tbody>
    </table>
    <div class="layout-demo__tokens">
      <code>grid-template-columns: repeat(4, 1fr) → 8 → 12</code>
    </div>
  </div>
{/if}

<style>
  .layout-demo {
    font-family: var(--font-lato);
    color: var(--text-primary, #111);
    padding: 1.6rem;
  }

  .layout-demo__title {
    font-size: var(--text-heading-size, 1.1rem);
    font-weight: var(--text-heading-weight, 700);
    line-height: var(--text-heading-line, 1.25);
    margin: 0 0 1.2rem;
  }

  /* Breakpoints */
  .layout-demo__breakpoints {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-bottom: 1.6rem;
  }

  .layout-demo__bp {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.8rem 1.2rem;
    border-radius: var(--radius-md, 0.75rem);
    border: 1px solid var(--border-default, #EDE9E4);
    background: var(--surface-raised, #fff);
  }

  .layout-demo__bp-label {
    font-weight: 700;
    font-size: var(--text-label-size, 0.72rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .layout-demo__bp-value {
    font-size: var(--text-caption-size, 0.62rem);
    color: var(--text-secondary, #374151);
  }

  .layout-demo__bp--mobile { border-left: 0.3rem solid var(--brand, #FF3CAC); }
  .layout-demo__bp--medium { border-left: 0.3rem solid var(--feedback-info-solid, #3B82F6); }
  .layout-demo__bp--large  { border-left: 0.3rem solid var(--feedback-success-solid, #22C55E); }
  .layout-demo__bp--ultra  { border-left: 0.3rem solid var(--feedback-warning-solid, #F59E0B); }

  /* Table */
  .layout-demo__table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-body-sm-size, 0.78rem);
    margin-bottom: 1.2rem;
  }

  .layout-demo__table th,
  .layout-demo__table td {
    text-align: left;
    padding: 0.6rem 0.8rem;
    border-bottom: 1px solid var(--border-subtle, #F3F4F6);
  }

  .layout-demo__table th {
    font-weight: 700;
    font-size: var(--text-label-size, 0.72rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary, #374151);
  }

  /* Container demo */
  .layout-demo__container-wrap {
    background: var(--surface-sunken, #F3F4F6);
    padding: 1rem;
    margin-bottom: 1.2rem;
    border-radius: var(--radius-md, 0.75rem);
  }

  .layout-demo__container {
    background: var(--surface-raised, #fff);
    padding: 1.2rem;
    border-radius: var(--radius-md, 0.75rem);
    border: 1px dashed var(--border-strong, #D1D5DB);
  }

  .layout-demo__container-text {
    font-size: var(--text-body-sm-size, 0.78rem);
    color: var(--text-secondary, #374151);
    margin: 0;
    text-align: center;
  }

  /* Grid demo */
  .layout-demo__grid {
    margin-bottom: 1.2rem;
  }

  .layout-demo__cell {
    background: var(--brand-subtle, #FFE8F5);
    border: 1px solid var(--brand, #FF3CAC);
    border-radius: var(--radius-sm, 0.375rem);
    padding: 0.8rem;
    text-align: center;
    font-size: var(--text-label-size, 0.72rem);
    font-weight: 700;
    color: var(--brand, #FF3CAC);
  }

  /* Tokens */
  .layout-demo__tokens {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .layout-demo__tokens code {
    font-size: var(--text-caption-size, 0.62rem);
    background: var(--surface-sunken, #F3F4F6);
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-sm, 0.375rem);
    color: var(--text-secondary, #374151);
  }
</style>
