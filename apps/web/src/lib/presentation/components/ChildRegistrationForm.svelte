<script lang="ts">
  import { t } from '$lib/i18n'

  type ChildFormData = {
    name: string
    birthDate: string
    birthWeight: number
    birthHeight: number
    document?: string
  }

  let {
    onsubmit,
    isLoading = false,
    error,
    heading = $t('child.register'),
    submitLabel = $t('child.register'),
  }: {
    onsubmit?: (data: ChildFormData) => void
    isLoading?: boolean
    error?: string
    heading?: string
    submitLabel?: string
  } = $props()

  let name = $state('')
  let birthDate = $state('')
  let birthWeight = $state('')
  let birthHeight = $state('')
  let document_ = $state('')

  let nameError = $state('')
  let birthDateError = $state('')
  let birthWeightError = $state('')
  let birthHeightError = $state('')

  function clearErrors() {
    nameError = ''
    birthDateError = ''
    birthWeightError = ''
    birthHeightError = ''
  }

  function validate(): boolean {
    clearErrors()
    let valid = true

    if (!name.trim()) {
      nameError = $t('child.validation.name_required')
      valid = false
    } else if (name.trim().length < 2) {
      nameError = $t('child.validation.name_min_length')
      valid = false
    }

    if (!birthDate) {
      birthDateError = $t('child.validation.birthdate_required')
      valid = false
    } else {
      const date = new Date(birthDate + 'T00:00:00')
      if (isNaN(date.getTime()) || date >= new Date()) {
        birthDateError = $t('child.validation.birthdate_past')
        valid = false
      }
    }

    const weight = parseFloat(birthWeight)
    if (!birthWeight || isNaN(weight)) {
      birthWeightError = $t('child.validation.weight_required')
      valid = false
    } else if (weight < 500 || weight > 8000) {
      birthWeightError = $t('child.validation.weight_range')
      valid = false
    }

    const height = parseFloat(birthHeight)
    if (!birthHeight || isNaN(height)) {
      birthHeightError = $t('child.validation.height_required')
      valid = false
    } else if (height < 20 || height > 80) {
      birthHeightError = $t('child.validation.height_range')
      valid = false
    }

    return valid
  }

  function handleSubmit(e: Event) {
    e.preventDefault()
    if (!validate()) return

    onsubmit?.({
      name: name.trim(),
      birthDate,
      birthWeight: parseFloat(birthWeight),
      birthHeight: parseFloat(birthHeight),
      document: document_.trim() || undefined,
    })
  }

  const todayString = $derived(new Date().toISOString().split('T')[0])
</script>

<form
  class="childform"
  onsubmit={handleSubmit}
  aria-label={heading}
  novalidate
>
  <h2 class="childform__heading">{heading}</h2>

  <!-- Name -->
  <div class="childform__field">
    <label class="childform__label" for="child-name">
      {$t('child.name')}
      <span class="childform__required" aria-hidden="true">*</span>
    </label>
    <input
      id="child-name"
      class="childform__input"
      class:childform__input--error={!!nameError}
      type="text"
      required
      placeholder={$t('child.name')}
      bind:value={name}
    />
    {#if nameError}
      <span class="childform__error">{nameError}</span>
    {/if}
  </div>

  <!-- Birth date -->
  <div class="childform__field">
    <label class="childform__label" for="child-birthdate">
      {$t('child.birthdate')}
      <span class="childform__required" aria-hidden="true">*</span>
    </label>
    <input
      id="child-birthdate"
      class="childform__input"
      class:childform__input--error={!!birthDateError}
      type="date"
      required
      max={todayString}
      bind:value={birthDate}
    />
    {#if birthDateError}
      <span class="childform__error">{birthDateError}</span>
    {/if}
  </div>

  <!-- Birth weight -->
  <div class="childform__field">
    <label class="childform__label" for="child-weight">
      {$t('child.weight')}
      <span class="childform__required" aria-hidden="true">*</span>
    </label>
    <div class="childform__input-wrapper" class:childform__input-wrapper--error={!!birthWeightError}>
      <input
        id="child-weight"
        class="childform__input childform__input--with-suffix"
        type="number"
        inputmode="decimal"
        required
        min="500"
        max="8000"
        placeholder="0"
        bind:value={birthWeight}
      />
      <span class="childform__suffix">g</span>
    </div>
    {#if birthWeightError}
      <span class="childform__error">{birthWeightError}</span>
    {/if}
  </div>

  <!-- Birth height -->
  <div class="childform__field">
    <label class="childform__label" for="child-height">
      {$t('child.height')}
      <span class="childform__required" aria-hidden="true">*</span>
    </label>
    <div class="childform__input-wrapper" class:childform__input-wrapper--error={!!birthHeightError}>
      <input
        id="child-height"
        class="childform__input childform__input--with-suffix"
        type="number"
        inputmode="decimal"
        required
        min="20"
        max="80"
        placeholder="0"
        bind:value={birthHeight}
      />
      <span class="childform__suffix">cm</span>
    </div>
    {#if birthHeightError}
      <span class="childform__error">{birthHeightError}</span>
    {/if}
  </div>

  <!-- Document (optional) -->
  <div class="childform__field">
    <label class="childform__label" for="child-document">
      {$t('child.document')}
    </label>
    <input
      id="child-document"
      class="childform__input"
      type="text"
      placeholder={$t('child.document')}
      bind:value={document_}
    />
  </div>

  <!-- Form-level error -->
  {#if error}
    <p class="childform__form-error" role="alert">{error}</p>
  {/if}

  <!-- Submit -->
  <button
    class="childform__submit"
    type="submit"
    disabled={isLoading}
  >
    {#if isLoading}
      <span class="childform__spinner" aria-hidden="true"></span>
      {$t('common.loading')}
    {:else}
      {submitLabel}
    {/if}
  </button>
</form>

<style>
  .childform {
    width: 100%;
    max-width: 28rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .childform__heading {
    font-family: var(--sr);
    font-size: 1.35rem;
    font-weight: 300;
    color: var(--bk);
    text-align: center;
    margin: 0 0 0.25rem;
  }

  /* Field */
  .childform__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .childform__label {
    font-family: var(--font-lato);
    font-size: 0.8rem;
    font-weight: 700;
    color: #374151;
  }

  .childform__required {
    color: var(--pk);
  }

  .childform__input {
    width: 100%;
    padding: 0.65rem 0.875rem;
    background: var(--wh);
    border: 0.075rem solid #D1D5DB;
    border-radius: 0.5rem;
    font-family: var(--font-lato);
    font-size: 0.875rem;
    color: var(--bk);
    outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    box-sizing: border-box;
  }

  .childform__input::placeholder {
    color: var(--gr2);
  }

  .childform__input:focus {
    border-color: var(--pk);
    box-shadow: 0 0 0 0.2rem rgba(255, 60, 172, 0.12);
  }

  .childform__input--error {
    border-color: var(--color-error);
  }

  .childform__input--error:focus {
    border-color: var(--color-error);
    box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.12);
  }

  /* Input with suffix */
  .childform__input-wrapper {
    display: flex;
    align-items: center;
    background: var(--wh);
    border: 0.075rem solid #D1D5DB;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .childform__input-wrapper:focus-within {
    border-color: var(--pk);
    box-shadow: 0 0 0 0.2rem rgba(255, 60, 172, 0.12);
  }

  .childform__input-wrapper--error {
    border-color: var(--color-error);
  }

  .childform__input-wrapper--error:focus-within {
    border-color: var(--color-error);
    box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.12);
  }

  .childform__input--with-suffix {
    border: none;
    border-radius: 0;
    flex: 1;
    min-width: 0;
  }

  .childform__input--with-suffix:focus {
    box-shadow: none;
  }

  .childform__suffix {
    font-family: var(--font-lato);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--gr);
    padding: 0 0.875rem;
    flex-shrink: 0;
  }

  /* Field error */
  .childform__error {
    font-family: var(--font-lato);
    font-size: 0.7rem;
    color: var(--color-error);
  }

  /* Form-level error */
  .childform__form-error {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: var(--color-error);
    margin: 0;
    text-align: center;
  }

  /* Submit button */
  .childform__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
    color: var(--wh);
    border: none;
    border-radius: 0.75rem;
    font-family: var(--font-lato);
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    margin-top: 0.25rem;
  }

  .childform__submit:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-0.05rem);
  }

  .childform__submit:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .childform__submit:focus-visible {
    box-shadow: 0 0 0 0.2rem var(--pk);
  }

  /* Spinner */
  .childform__spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 0.15rem solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--wh);
    border-radius: 50%;
    animation: childform-spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes childform-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
