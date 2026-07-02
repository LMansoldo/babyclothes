<script lang="ts">
  type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'url'

  let {
    id,
    type = 'text',
    label,
    placeholder,
    value = $bindable(''),
    hint,
    error,
    success,
    prefix,
    suffixLabel,
    onsuffixclick,
    oninput,
    disabled = false,
  }: {
    id: string
    type?: InputType
    label?: string
    placeholder?: string
    value?: string
    hint?: string
    error?: string
    success?: string
    prefix?: string
    suffixLabel?: string
    onsuffixclick?: () => void
    oninput?: (e: Event) => void
    disabled?: boolean
  } = $props()

  let showPassword = $state(false)

  const inputType = $derived(
    type === 'password' ? (showPassword ? 'text' : 'password') : type
  )

  const state = $derived(error ? 'error' : success ? 'success' : 'default')
</script>

<div class="input-field">
  {#if label}
    <label class="input-label" for={id}>{label}</label>
  {/if}

  <div class="input-wrapper input-wrapper--{state}" class:input-wrapper--has-prefix={!!prefix} class:input-wrapper--has-suffix={!!suffixLabel || type === 'password'}>
    {#if prefix}
      <span class="input-prefix">{prefix}</span>
    {/if}

    <input
      {id}
      type={inputType}
      {placeholder}
      bind:value
      {disabled}
      {oninput}
      class="input-el"
    />

    {#if type === 'password'}
      <button
        type="button"
        class="input-suffix-btn input-suffix-btn--password"
        onclick={() => showPassword = !showPassword}
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {#if showPassword}
          <!-- SVG eye-off icon -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        {:else}
          <!-- SVG eye icon -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        {/if}
      </button>
    {:else if suffixLabel}
      <button
        type="button"
        class="input-suffix-btn"
        onclick={onsuffixclick}
      >
        {suffixLabel}
      </button>
    {/if}
  </div>

  {#if error}
    <span class="input-feedback input-feedback--error">{error}</span>
  {:else if success}
    <span class="input-feedback input-feedback--success">{success}</span>
  {:else if hint}
    <span class="input-feedback input-feedback--hint">{hint}</span>
  {/if}
</div>

<style>
  .input-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .input-label {
    font-family: var(--font-lato);
    font-size: 0.8rem;
    font-weight: 700;
    color: #374151;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    background: var(--color-white);
    border: 0.075rem solid #D1D5DB;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
  }

  .input-wrapper:focus-within {
    border-color: var(--color-pink);
    box-shadow: 0 0 0 0.3rem rgba(255, 60, 172, .12);
  }

  .input-wrapper--error {
    border-color: var(--color-error);
  }

  .input-wrapper--error:focus-within {
    border-color: var(--color-error);
    box-shadow: 0 0 0 0.3rem rgba(220, 38, 38, .12);
  }

  .input-wrapper--success {
    border-color: var(--color-success);
  }

  .input-wrapper--success:focus-within {
    border-color: var(--color-success);
    box-shadow: 0 0 0 0.3rem rgba(22, 163, 74, .12);
  }

  .input-el {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 0.65rem 0.875rem;
    font-family: var(--font-lato);
    font-size: .875rem;
    color: var(--color-black);
    min-width: 0;
  }

  .input-el::placeholder {
    color: var(--color-gray-2);
  }

  .input-prefix {
    padding: 0 0.5rem 0 0.875rem;
    font-family: var(--font-lato);
    font-size: .82rem;
    font-weight: 700;
    color: var(--color-gray);
    flex-shrink: 0;
    background: var(--color-bg-2);
    align-self: stretch;
    display: flex;
    align-items: center;
    border-right: 0.15rem solid rgba(0, 0, 0, .08);
  }

  .input-suffix-btn {
    padding: 0 1rem;
    height: 100%;
    border: none;
    border-left: 0.15rem solid rgba(0, 0, 0, .08);
    background: var(--color-bg-2);
    color: var(--color-black);
    font-family: var(--font-lato);
    font-size: .72rem;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--transition-base);
    align-self: stretch;
    display: flex;
    align-items: center;
  }

  .input-suffix-btn--password {
    padding: 0 0.75rem;
    border-left: none;
    background: transparent;
  }

  .input-suffix-btn:hover {
    background: var(--color-bg-3);
  }

  .input-suffix-btn--password:hover {
    background: transparent;
    color: var(--color-pink);
  }

  .input-feedback {
    font-family: var(--font-lato);
    font-size: .7rem;
  }

  .input-feedback--hint { color: var(--color-gray); }
  .input-feedback--error { color: var(--color-error); }
  .input-feedback--success { color: var(--color-success); }
</style>
