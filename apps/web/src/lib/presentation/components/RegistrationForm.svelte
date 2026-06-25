<script lang="ts">
  import { t } from '$lib/i18n'
  import { UserCheck, Building2, ArrowRight, ArrowLeft } from 'lucide-svelte'

  let {
    onComplete,
    loading = false,
  }: {
    onComplete: (data: { type: 'pf' | 'pj'; cpf?: string; cnpj?: string }) => void
    loading?: boolean
  } = $props()

  let selectedType = $state<'pf' | 'pj' | null>(null)
  let document = $state('')
  let step = $state<'select' | 'document'>('select')

  function formatDocument(value: string): string {
    const digits = value.replace(/\D/g, '')
    if (selectedType === 'pf') {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14)
    }
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18)
  }

  function handleDocumentInput(e: Event) {
    const target = e.target as HTMLInputElement
    document = formatDocument(target.value)
  }

  function selectType(type: 'pf' | 'pj') {
    selectedType = type
    document = ''
    step = 'document'
  }

  function goBack() {
    step = 'select'
    selectedType = null
    document = ''
  }

  function handleSubmit() {
    if (!selectedType) return
    const digits = document.replace(/\D/g, '')
    onComplete({
      type: selectedType,
      ...(selectedType === 'pf' ? { cpf: digits } : { cnpj: digits }),
    })
  }

  const isDocumentValid = $derived.by(() => {
    if (!selectedType) return false
    const digits = document.replace(/\D/g, '')
    if (selectedType === 'pf') return digits.length === 11
    return digits.length === 14
  })
</script>

<div class="registrationform">
  <div class="registrationform__card">
    <div class="registrationform__logo">
      <span class="registrationform__logo-drop" aria-hidden="true"></span>
      <span class="registrationform__logo-text">Baby<em>Clothes</em></span>
    </div>

    {#if step === 'select'}
      <h2 class="registrationform__title">{$t('auth.registration.title')}</h2>
      <p class="registrationform__subtitle">{$t('auth.registration.subtitle')}</p>

      <div class="registrationform__options">
        <button
          class="registrationform__option"
          class:registrationform__option--selected={selectedType === 'pf'}
          onclick={() => selectType('pf')}
        >
          <div class="registrationform__option-icon">
            <UserCheck size={28} />
          </div>
          <span class="registrationform__option-label">{$t('auth.registration.pf')}</span>
          <span class="registrationform__option-desc">{$t('auth.registration.pf_description')}</span>
        </button>

        <button
          class="registrationform__option"
          class:registrationform__option--selected={selectedType === 'pj'}
          onclick={() => selectType('pj')}
        >
          <div class="registrationform__option-icon">
            <Building2 size={28} />
          </div>
          <span class="registrationform__option-label">{$t('auth.registration.pj')}</span>
          <span class="registrationform__option-desc">{$t('auth.registration.pj_description')}</span>
        </button>
      </div>
    {:else if step === 'document'}
      <button class="registrationform__back" onclick={goBack}>
        <ArrowLeft size={18} />
      </button>

      <h2 class="registrationform__title">
        {selectedType === 'pf' ? $t('auth.registration.cpf') : $t('auth.registration.cnpj')}
      </h2>

      <div class="registrationform__field">
        <input
          class="registrationform__input"
          type="text"
          inputmode="numeric"
          placeholder={selectedType === 'pf' ? $t('auth.registration.cpf_placeholder') : $t('auth.registration.cnpj_placeholder')}
          value={document}
          oninput={handleDocumentInput}
          maxlength={selectedType === 'pf' ? 14 : 18}
        />
      </div>

      <button
        class="registrationform__submit"
        onclick={handleSubmit}
        disabled={!isDocumentValid || loading}
      >
        {#if loading}
          <span class="registrationform__spinner"></span>
          {$t('auth.loading')}
        {:else}
          {$t('auth.registration.submit')}
          <ArrowRight size={18} />
        {/if}
      </button>
    {/if}
  </div>
</div>

<style>
  .registrationform {
    width: 100%;
    max-width: 40rem;
  }

  .registrationform__card {
    background: var(--wh);
    border-radius: 2rem;
    padding: 2.5rem 2rem;
    box-shadow: 0 0.4rem 2.4rem rgba(0, 0, 0, 0.08);
    text-align: center;
    position: relative;
  }

  .registrationform__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    margin-bottom: 1.5rem;
  }

  .registrationform__logo-drop {
    width: 1.2rem;
    height: 1.6rem;
    background: var(--pk);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  }

  .registrationform__logo-text {
    font-family: var(--ld);
    font-weight: 900;
    font-size: 1.5rem;
    letter-spacing: -0.03em;
    color: var(--bk);
  }

  .registrationform__logo-text :global(em) {
    font-style: normal;
    color: var(--pk);
  }

  .registrationform__title {
    font-family: var(--ld);
    font-size: 1.3rem;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--bk);
    margin: 0 0 0.5rem;
  }

  .registrationform__subtitle {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.85rem;
    color: var(--gr);
    margin: 0 0 1.5rem;
    line-height: 1.5;
  }

  .registrationform__options {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .registrationform__option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 1.5rem 1rem;
    background: var(--of2);
    border: 0.15rem solid transparent;
    border-radius: 1.2rem;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  .registrationform__option:hover {
    background: var(--wh);
    border-color: var(--pk);
  }

  .registrationform__option--selected {
    background: var(--wh);
    border-color: var(--pk);
    box-shadow: 0 0 0 0.15rem rgba(255, 107, 158, 0.2);
  }

  .registrationform__option-icon {
    color: var(--pk);
  }

  .registrationform__option-label {
    font-family: var(--ld);
    font-size: 1rem;
    font-weight: 700;
    color: var(--bk);
  }

  .registrationform__option-desc {
    font-family: var(--sr);
    font-size: 0.75rem;
    color: var(--gr);
    line-height: 1.4;
  }

  .registrationform__back {
    position: absolute;
    top: 1.2rem;
    left: 1.2rem;
    background: none;
    border: none;
    color: var(--gr);
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 0.5rem;
    transition: background 0.15s;
  }

  .registrationform__back:hover {
    background: var(--of2);
  }

  .registrationform__field {
    margin: 1.5rem 0;
  }

  .registrationform__input {
    width: 100%;
    padding: 0.85rem 1.2rem;
    background: var(--of2);
    border: 0.15rem solid transparent;
    border-radius: 1rem;
    font-family: var(--ld);
    font-size: 1.2rem;
    text-align: center;
    color: var(--bk);
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .registrationform__input:focus {
    border-color: var(--pk);
  }

  .registrationform__input::placeholder {
    color: var(--gr);
    font-family: var(--sr);
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .registrationform__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.85rem 1.5rem;
    background: var(--pk);
    color: var(--wh);
    border: none;
    border-radius: 1.2rem;
    font-family: var(--ld);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .registrationform__submit:hover {
    opacity: 0.88;
  }

  .registrationform__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .registrationform__spinner {
    width: 1.6rem;
    height: 1.6rem;
    border: 0.2rem solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--wh);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg) }
  }
</style>
