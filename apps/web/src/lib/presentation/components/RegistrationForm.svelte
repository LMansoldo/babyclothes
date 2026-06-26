<script lang="ts">
  import { t } from '$lib/i18n'

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
  {#if step === 'select'}
    <!-- Header row -->
    <div class="registrationform__header">
      <button class="registrationform__back" onclick={goBack} aria-label="Voltar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <span class="registrationform__header-title">Criar conta</span>
    </div>

    <p class="registrationform__lead">{$t('auth.registration.subtitle_top')}</p>
    <h2 class="registrationform__title">{$t('auth.registration.title')}</h2>

    <div class="registrationform__options">
      <!-- PF card -->
      <button
        class="registrationform__option"
        class:registrationform__option--selected={selectedType === 'pf'}
        onclick={() => selectType('pf')}
      >
        <div class="registrationform__option-icon registrationform__option-icon--pf">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3CAC" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="registrationform__option-text">
          <span class="registrationform__option-label">{$t('auth.registration.pf')}</span>
          <span class="registrationform__option-desc">{$t('auth.registration.pf_description')}</span>
        </div>
        {#if selectedType === 'pf'}
          <div class="registrationform__checkmark">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        {/if}
      </button>

      <!-- PJ card -->
      <button
        class="registrationform__option"
        class:registrationform__option--selected={selectedType === 'pj'}
        onclick={() => selectType('pj')}
      >
        <div class="registrationform__option-icon registrationform__option-icon--pj">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="registrationform__option-text">
          <span class="registrationform__option-label">{$t('auth.registration.pj')}</span>
          <span class="registrationform__option-desc">{$t('auth.registration.pj_description')}</span>
        </div>
        {#if selectedType === 'pj'}
          <div class="registrationform__checkmark">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        {/if}
      </button>
    </div>
  {:else if step === 'document'}
    <!-- Header row -->
    <div class="registrationform__header">
      <button class="registrationform__back" onclick={goBack} aria-label="Voltar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <span class="registrationform__header-title">Criar conta</span>
    </div>

    <p class="registrationform__doc-label">
      {selectedType === 'pf' ? $t('auth.registration.cpf_label') : $t('auth.registration.cnpj_label')}
    </p>

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
      {:else}
        {$t('auth.registration.submit')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      {/if}
    </button>
  {/if}
</div>

<style>
  .registrationform {
    width: 100%;
    max-width: 40rem;
    padding: 16px 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .registrationform__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 28px;
  }

  .registrationform__back {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #fff;
    border: 1.5px solid #EDE9E4;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s;
  }

  .registrationform__back:hover {
    background: #F3F4F6;
  }

  .registrationform__header-title {
    font-family: var(--sr);
    font-size: 1.35rem;
    font-weight: 400;
    color: #111;
  }

  .registrationform__lead {
    font-size: 0.78rem;
    color: #6B7280;
    margin: 0 0 6px;
    line-height: 1.4;
  }

  .registrationform__title {
    font-family: var(--sr);
    font-size: 1.5rem;
    font-weight: 300;
    color: #111;
    margin: 0 0 24px;
    line-height: 1.3;
  }

  .registrationform__options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .registrationform__option {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    background: #fff;
    border: 1.5px solid #EDE9E4;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
    text-align: left;
    width: 100%;
  }

  .registrationform__option:hover {
    border-color: var(--pk);
  }

  .registrationform__option--selected {
    border: 2px solid var(--pk);
    box-shadow: 0 2px 12px rgba(255, 60, 172, 0.12);
  }

  .registrationform__option-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .registrationform__option-icon--pf {
    background: #FFE8F5;
  }

  .registrationform__option-icon--pj {
    background: #F3F4F6;
  }

  .registrationform__option-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .registrationform__option-label {
    font-family: var(--vd);
    font-size: 0.9rem;
    font-weight: 700;
    color: #111;
  }

  .registrationform__option-desc {
    font-family: var(--vd);
    font-size: 0.75rem;
    color: #6B7280;
    line-height: 1.5;
  }

  .registrationform__checkmark {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--pk);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .registrationform__doc-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #374151;
    margin: 0 0 8px;
  }

  .registrationform__field {
    margin-bottom: 20px;
  }

  .registrationform__input {
    width: 100%;
    padding: 14px 16px;
    background: #fff;
    border: 1.5px solid #D1D5DB;
    border-radius: 10px;
    font-family: var(--vd);
    font-size: 0.9rem;
    color: #111;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .registrationform__input:focus {
    border-color: var(--pk);
  }

  .registrationform__input::placeholder {
    color: #9CA3AF;
    font-family: var(--vd);
    font-size: 0.85rem;
  }

  .registrationform__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    background: var(--pk);
    color: var(--wh);
    border: none;
    border-radius: 10px;
    font-family: var(--vd);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
    box-shadow: 0 4px 16px rgba(255, 60, 172, 0.3);
  }

  .registrationform__submit:hover {
    opacity: 0.88;
  }

  .registrationform__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .registrationform__spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 0.2rem solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--wh);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg) }
  }
</style>
