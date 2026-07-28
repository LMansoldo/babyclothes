<script lang="ts">
  let { theme = 'light' }: { theme?: 'light' | 'dark' } = $props()

  const surfaces = [
    { token: '--surface-base', label: 'base' },
    { token: '--surface-raised', label: 'raised' },
    { token: '--surface-sunken', label: 'sunken' },
    { token: '--surface-inverse', label: 'inverse' },
  ]

  const texts = [
    { token: '--text-primary', label: 'primary' },
    { token: '--text-secondary', label: 'secondary' },
    { token: '--text-tertiary', label: 'tertiary' },
    { token: '--text-on-brand', label: 'on-brand' },
    { token: '--text-inverse', label: 'inverse' },
    { token: '--text-disabled', label: 'disabled' },
  ]

  const borders = [
    { token: '--border-subtle', label: 'subtle' },
    { token: '--border-default', label: 'default' },
    { token: '--border-strong', label: 'strong' },
    { token: '--border-focus', label: 'focus' },
  ]

  const brands = [
    { token: '--brand', label: 'brand' },
    { token: '--brand-hover', label: 'hover' },
    { token: '--brand-subtle', label: 'subtle' },
    { token: '--on-brand', label: 'on-brand' },
  ]

  const feedbacks = [
    { token: '--feedback-success-solid', label: 'success' },
    { token: '--feedback-warning-solid', label: 'warning' },
    { token: '--feedback-error-solid', label: 'error' },
    { token: '--feedback-info-solid', label: 'info' },
  ]
</script>

<div class="semantic-colors" data-theme={theme}>
  <div class="semantic-colors__section">
    <h4 class="semantic-colors__heading">Surfaces</h4>
    <div class="semantic-colors__row">
      {#each surfaces as s}
        <div class="semantic-colors__swatch">
          <div class="semantic-colors__chip" style="background: var({s.token})"></div>
          <span class="semantic-colors__label">{s.label}</span>
          <code class="semantic-colors__token">{s.token}</code>
        </div>
      {/each}
    </div>
  </div>

  <div class="semantic-colors__section">
    <h4 class="semantic-colors__heading">Text</h4>
    <div class="semantic-colors__row">
      {#each texts as t}
        <div class="semantic-colors__swatch">
          <div class="semantic-colors__chip semantic-colors__chip--text" style="color: var({t.token}); background: var(--surface-raised)">
            Aa
          </div>
          <span class="semantic-colors__label">{t.label}</span>
          <code class="semantic-colors__token">{t.token}</code>
        </div>
      {/each}
    </div>
  </div>

  <div class="semantic-colors__section">
    <h4 class="semantic-colors__heading">Borders</h4>
    <div class="semantic-colors__row">
      {#each borders as b}
        <div class="semantic-colors__swatch">
          <div class="semantic-colors__chip semantic-colors__chip--border" style="border-color: var({b.token})"></div>
          <span class="semantic-colors__label">{b.label}</span>
          <code class="semantic-colors__token">{b.token}</code>
        </div>
      {/each}
    </div>
  </div>

  <div class="semantic-colors__section">
    <h4 class="semantic-colors__heading">Brand</h4>
    <div class="semantic-colors__row">
      {#each brands as b}
        <div class="semantic-colors__swatch">
          <div class="semantic-colors__chip" style="background: var({b.token})"></div>
          <span class="semantic-colors__label">{b.label}</span>
          <code class="semantic-colors__token">{b.token}</code>
        </div>
      {/each}
    </div>
  </div>

  <div class="semantic-colors__section">
    <h4 class="semantic-colors__heading">Feedback</h4>
    <div class="semantic-colors__row">
      {#each feedbacks as f}
        <div class="semantic-colors__swatch">
          <div class="semantic-colors__chip" style="background: var({f.token})"></div>
          <span class="semantic-colors__label">{f.label}</span>
          <code class="semantic-colors__token">{f.token}</code>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .semantic-colors {
    font-family: var(--font-lato, 'Lato', sans-serif);
    padding: 1.6rem;
    border-radius: var(--radius-md, 0.75rem);
    background: var(--surface-base, #F8F5F2);
    color: var(--text-primary, #111);
  }

  .semantic-colors__section {
    margin-bottom: 1.6rem;
  }

  .semantic-colors__section:last-child {
    margin-bottom: 0;
  }

  .semantic-colors__heading {
    font-size: var(--text-subheading-size, 0.95rem);
    font-weight: var(--text-subheading-weight, 700);
    margin: 0 0 0.8rem;
    line-height: var(--text-subheading-line, 1.3);
  }

  .semantic-colors__row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .semantic-colors__swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    min-width: 5rem;
  }

  .semantic-colors__chip {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: var(--radius-md, 0.75rem);
    border: 1px solid var(--border-subtle, #F3F4F6);
  }

  .semantic-colors__chip--text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 700;
  }

  .semantic-colors__chip--border {
    background: transparent;
    border-width: 0.3rem;
    border-style: solid;
  }

  .semantic-colors__label {
    font-size: var(--text-label-size, 0.72rem);
    font-weight: 700;
  }

  .semantic-colors__token {
    font-size: 0.55rem;
    color: var(--text-tertiary, #9CA3AF);
    word-break: break-all;
    text-align: center;
  }
</style>
