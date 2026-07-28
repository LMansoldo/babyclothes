<script lang="ts">
  import { untrack } from 'svelte'
  import { Button, IconButton, Input, Select } from '@babyclothes/design-system'
  import { ArrowRight, MapPin } from 'lucide-svelte'
  import { t } from '$lib/i18n'
  import {
    RegisterPFStep1Schema,
    RegisterPFInputSchema,
    UF_LIST,
    type RegisterPFInput,
  } from '$lib/domain/user/schemas'
  import { formatCpf } from '$lib/domain/user/value-objects/Document'
  import { formatPhone, formatCep } from '$lib/domain/user/value-objects/Contact'

  export interface RegisterPFScreenProps {
    onSubmit: (data: RegisterPFInput) => void
    onGoogleSignIn: () => void
    onBack: () => void
    loading?: boolean
    error?: string
    serverFieldErrors?: Partial<Record<keyof RegisterPFInput, string>>
  }

  let {
    onSubmit,
    onGoogleSignIn,
    onBack,
    loading = false,
    error,
    serverFieldErrors,
  }: RegisterPFScreenProps = $props()

  let step = $state<1 | 2>(1)
  let name = $state('')
  let email = $state('')
  let password = $state('')
  let cpf = $state('')
  let phone = $state('')
  let nationality = $state('Brasileira')
  let cep = $state('')
  let addressLine = $state('')
  let city = $state('')
  let stateUf = $state('')
  let fieldErrors = $state<Partial<Record<keyof RegisterPFInput, string>>>({})

  const STEP1_FIELDS: (keyof RegisterPFInput)[] = ['name', 'email', 'password', 'cpf']
  const ufOptions = UF_LIST.map((uf) => ({ value: uf, label: uf }))

  function handleNameInput(e: Event) {
    name = (e.target as HTMLInputElement).value
  }
  function handleEmailInput(e: Event) {
    email = (e.target as HTMLInputElement).value
  }
  function handlePasswordInput(e: Event) {
    password = (e.target as HTMLInputElement).value
  }
  function handleCpfInput() {
    cpf = formatCpf(cpf)
  }

  function handlePhoneInput() {
    phone = formatPhone(phone)
  }

  function handleCepInput() {
    cep = formatCep(cep)
  }

  function collectErrors(issues: { path: (string | number)[]; message: string }[]) {
    return Object.fromEntries(issues.map((i) => [i.path[0], $t(String(i.message))]))
  }

  function handleContinue() {
    const parsed = RegisterPFStep1Schema.safeParse({ name, email, password, cpf })
    if (!parsed.success) {
      fieldErrors = collectErrors(parsed.error.issues)
      return
    }
    fieldErrors = {}
    step = 2
  }

  function handleBack() {
    if (step === 2) {
      step = 1
      return
    }
    onBack()
  }

  function handleSubmit() {
    const parsed = RegisterPFInputSchema.safeParse({
      name,
      email,
      password,
      cpf,
      phone,
      nationality,
      cep,
      addressLine,
      city,
      state: stateUf,
    })
    if (!parsed.success) {
      fieldErrors = collectErrors(parsed.error.issues)
      return
    }
    fieldErrors = {}
    onSubmit(parsed.data)
  }

  // Handle server field errors: merge into local errors and go back to step 1 if needed
  let prevServerErrors: string | undefined
  $effect(() => {
    const current = serverFieldErrors
    if (!current) return
    const key = JSON.stringify(current)
    if (key === prevServerErrors) return
    prevServerErrors = key
    untrack(() => {
      fieldErrors = { ...fieldErrors, ...current }
      if (STEP1_FIELDS.some((f) => current[f])) step = 1
    })
  })
</script>

<div class="registerpf">
  <div class="registerpf__header">
    <IconButton
      icon="back"
      ariaLabel={$t('auth.register_pf.back')}
      onclick={handleBack}
    />
    <span class="registerpf__create-label">{$t('auth.register_pf.create_account')}</span>
  </div>

  {#if step === 1}
    <div class="registerpf__heading">
      <p class="registerpf__step">{$t('auth.register_pf.step_indicator', { step: 1 })}</p>
      <h1 class="registerpf__title">
        <span class="registerpf__title-accent">{$t('auth.register_pf.title_accent')}</span>
        {' '}{$t('auth.register_pf.title')}
      </h1>
      <p class="registerpf__lead">{$t('auth.register_pf.lead')}</p>
    </div>

    <div class="registerpf__fields">
      <Input
        id="register-name"
        label={$t('auth.register_pf.name_label')}
        placeholder={$t('auth.register_pf.name_placeholder')}
        value={name}
        oninput={handleNameInput}
        error={fieldErrors.name}
        name="name"
      />
      <Input
        id="register-email"
        type="email"
        label={$t('auth.register_pf.email_label')}
        placeholder={$t('auth.register_pf.email_placeholder')}
        value={email}
        oninput={handleEmailInput}
        error={fieldErrors.email}
        inputmode="email"
        name="email"
      />
      <Input
        id="register-password"
        type="password"
        label={$t('auth.register_pf.password_label')}
        placeholder={$t('auth.register_pf.password_placeholder')}
        value={password}
        oninput={handlePasswordInput}
        error={fieldErrors.password}
        name="password"
      />
      <Input
        id="register-cpf"
        label={$t('auth.register_pf.cpf_label')}
        placeholder={$t('auth.register_pf.cpf_placeholder')}
        value={cpf}
        oninput={handleCpfInput}
        error={fieldErrors.cpf}
        inputmode="numeric"
        maxlength={14}
        name="cpf"
      />
    </div>

    <div class="registerpf__google">
      <Button variant="ghost" size="lg" onclick={onGoogleSignIn}>
        <svg class="registerpf__google-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>{$t('auth.register_pf.google')}</span>
      </Button>
    </div>

    <div class="registerpf__divider">
      <span class="registerpf__divider-line"></span>
      <span class="registerpf__divider-text">{$t('auth.register_pf.divider')}</span>
      <span class="registerpf__divider-line"></span>
    </div>

    <div class="registerpf__cta">
      <button type="button" class="registerpf__cta-btn" onclick={handleContinue}>
        {$t('auth.register_pf.continue')}
      </button>
    </div>
  {:else}
    <div class="registerpf__heading">
      <p class="registerpf__step">{$t('auth.register_pf.step_indicator', { step: 2 })}</p>
      <h1 class="registerpf__title">{$t('auth.register_pf.step2_title')}</h1>
      <p class="registerpf__lead">{$t('auth.register_pf.step2_lead')}</p>
    </div>

    <div class="registerpf__fields">
      <Input
        id="register-phone"
        label={$t('auth.register_pf.phone_label')}
        placeholder={$t('auth.register_pf.phone_placeholder')}
        bind:value={phone}
        oninput={handlePhoneInput}
        error={fieldErrors.phone}
        inputmode="tel"
        maxlength={15}
        name="phone"
      />
      <Input
        id="register-nationality"
        label={$t('auth.register_pf.nationality_label')}
        placeholder={$t('auth.register_pf.nationality_placeholder')}
        bind:value={nationality}
        error={fieldErrors.nationality}
        name="nationality"
      />
      <Input
        id="register-cep"
        label={$t('auth.register_pf.cep_label')}
        placeholder={$t('auth.register_pf.cep_placeholder')}
        bind:value={cep}
        oninput={handleCepInput}
        error={fieldErrors.cep}
        inputmode="numeric"
        maxlength={9}
        name="cep"
      />
      <Input
        id="register-address"
        label={$t('auth.register_pf.address_label')}
        placeholder={$t('auth.register_pf.address_placeholder')}
        bind:value={addressLine}
        error={fieldErrors.addressLine}
        name="addressLine"
      />
      <div class="registerpf__city-group">
        <Input
          id="register-city"
          label={$t('auth.register_pf.city_label')}
          placeholder={$t('auth.register_pf.city_placeholder')}
          bind:value={city}
          error={fieldErrors.city}
          hint={!fieldErrors.city ? $t('auth.register_pf.city_hint') : undefined}
          name="city"
        />
        <span class="registerpf__city-icon" aria-hidden="true">
          <MapPin size={16} />
        </span>
      </div>
      <Select
        id="register-state"
        label={$t('auth.register_pf.state_label')}
        placeholder={$t('auth.register_pf.state_placeholder')}
        options={ufOptions}
        bind:value={stateUf}
        error={fieldErrors.state}
        name="state"
      />
    </div>

    {#if error}
      <p class="registerpf__error" role="alert">{error}</p>
    {/if}

    <div class="registerpf__cta">
      <Button variant="pk" size="lg" type="button" onclick={handleSubmit} disabled={loading}>
        {#if loading}
          <span class="registerpf__cta-loading">{$t('common.loading')}</span>
        {:else}
          <span>{$t('auth.register_pf.submit')}</span>
          <ArrowRight size={14} />
        {/if}
      </Button>
    </div>
  {/if}

  {#if step === 1 && error}
    <p class="registerpf__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .registerpf {
    display: flex;
    flex-direction: column;
    max-width: 40rem;
    width: 100%;
    padding: 0.8rem 1rem;
    margin: 0 auto;
  }

  .registerpf__header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.6rem;
  }

  .registerpf__create-label {
    font-family: var(--font-lato);
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--bk);
  }

  .registerpf__heading {
    margin-bottom: 1.6rem;
  }

  .registerpf__step {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    color: #9CA3AF;
    margin: 0 0 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .registerpf__title {
    font-family: var(--sr);
    font-size: 1.6rem;
    font-weight: 300;
    color: var(--bk);
    margin: 0 0 0.4rem;
    line-height: 1.2;
  }

  .registerpf__title-accent {
    color: var(--pk);
  }

  .registerpf__lead {
    font-family: var(--font-lato);
    font-size: 0.82rem;
    color: #6B7280;
    margin: 0;
    line-height: 1.4;
  }

  .registerpf__fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.2rem;
  }

  .registerpf__google {
    margin-bottom: 1rem;
  }

  .registerpf__google :global(button) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }

  .registerpf__google-icon {
    flex-shrink: 0;
  }

  .registerpf__divider {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .registerpf__divider-line {
    flex: 1;
    height: 1px;
    background: #EDE9E4;
  }

  .registerpf__divider-text {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    color: #9CA3AF;
    white-space: nowrap;
  }

  .registerpf__city-group {
    position: relative;
  }

  .registerpf__city-icon {
    position: absolute;
    right: 0.8rem;
    top: 2.4rem;
    color: #9CA3AF;
    pointer-events: none;
  }

  .registerpf__cta {
    margin-top: 0.4rem;
  }

  .registerpf__cta :global(button) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .registerpf__cta-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.3rem;
    border-radius: 1rem;
    background: var(--pk);
    border: none;
    cursor: pointer;
    font-family: var(--font-lato);
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    box-shadow: 0 4px 16px rgba(255, 60, 172, 0.3);
    transition: opacity 0.15s;
  }

  .registerpf__cta-btn:hover {
    opacity: 0.9;
  }

  .registerpf__cta-loading {
    font-family: var(--font-lato);
  }

  .registerpf__error {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: #F87171;
    margin: 0.8rem 0 0;
    text-align: center;
  }
</style>
