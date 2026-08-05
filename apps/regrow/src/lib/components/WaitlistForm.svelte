<script lang="ts">
  import { enhance } from '$app/forms'
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'
  import { waitlistEmail } from '../stores/waitlist-email'

  let {
    form,
  }: {
    form: { success?: boolean; errorKey?: string; values?: Record<string, string> } | null
  } = $props()

  let loading = $state(false)
</script>

{#if form?.success}
  <div class="waitlist-form__confirmation">
    <div class="waitlist-form__confirmation-icon">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <h3 class="waitlist-form__confirmation-title">{$t('form.success_title')}</h3>
    <p class="waitlist-form__confirmation-body">{$t('form.success_body')}</p>
  </div>
{:else}
  <form
    method="POST"
    action="?/waitlist"
    class="waitlist-form"
    use:enhance={() => {
      loading = true
      return async ({ update }) => {
        await update()
        loading = false
      }
    }}
  >
    {#if form?.errorKey}
      <p class="waitlist-form__error" role="alert">{$t(form.errorKey)}</p>
    {/if}

    <div class="waitlist-form__field">
      <label for="nome" class="waitlist-form__label">{$t('form.name')}</label>
      <input
        id="nome"
        name="nome"
        type="text"
        required
        value={form?.values?.nome ?? ''}
        class="waitlist-form__input"
      />
    </div>

    <div class="waitlist-form__field">
      <label for="telefone" class="waitlist-form__label">{$t('form.phone')}</label>
      <input
        id="telefone"
        name="telefone"
        type="tel"
        required
        value={form?.values?.telefone ?? ''}
        class="waitlist-form__input"
      />
    </div>

    <div class="waitlist-form__field">
      <label for="email" class="waitlist-form__label">{$t('form.email')}</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={form?.values?.email ?? $waitlistEmail}
        class="waitlist-form__input"
      />
    </div>

    <div class="waitlist-form__field waitlist-form__field--select">
      <label for="interesse" class="waitlist-form__label">{$t('form.interest_label')}</label>
      <select id="interesse" name="interesse" required class="waitlist-form__select">
        <option value="" disabled selected={!form?.values?.interesse}>
          {$t('form.interest_placeholder')}
        </option>
        <option value="roupas" selected={form?.values?.interesse === 'roupas'}>
          {$t('form.interest_clothes')}
        </option>
        <option value="acessorios" selected={form?.values?.interesse === 'acessorios'}>
          {$t('form.interest_accessories')}
        </option>
        <option value="crescimento" selected={form?.values?.interesse === 'crescimento'}>
          {$t('form.interest_growth')}
        </option>
        <option value="tudo" selected={form?.values?.interesse === 'tudo'}>
          {$t('form.interest_all')}
        </option>
      </select>
    </div>

    <WaitlistCta
      label={loading ? $t('form.submitting') : $t('form.submit')}
      type="submit"
      variant="form"
    />
  </form>
{/if}

<style>
  .waitlist-form__field {
    margin-bottom: 0.9rem;
  }

  .waitlist-form__field--select {
    margin-bottom: 1.3rem;
  }

  .waitlist-form__label {
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 0.35rem;
  }

  .waitlist-form__input,
  .waitlist-form__select {
    width: 100%;
    padding: 0.65rem 0.75rem;
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--text-primary);
    background: var(--surface-sunken);
    border: 0.075rem solid var(--border-default);
    border-radius: 0.5rem;
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .waitlist-form__select {
    padding-right: 2.1rem;
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23374151' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
  }

  .waitlist-form__input:focus,
  .waitlist-form__select:focus {
    border-color: var(--pk);
    box-shadow: 0 0 0 0.2rem rgba(255, 60, 172, 0.09);
    background: var(--surface-raised);
  }

  .waitlist-form__error {
    margin-bottom: 0.9rem;
    color: var(--feedback-error-text);
    font-size: 0.7rem;
  }

  .waitlist-form__confirmation {
    text-align: center;
    padding: 1.4rem 0.4rem;
  }

  .waitlist-form__confirmation-icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    background: var(--brand-subtle);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pk);
  }

  .waitlist-form__confirmation-title {
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .waitlist-form__confirmation-body {
    font-size: 0.8rem;
    line-height: 1.6;
    color: var(--text-secondary);
    font-weight: 300;
  }
</style>
