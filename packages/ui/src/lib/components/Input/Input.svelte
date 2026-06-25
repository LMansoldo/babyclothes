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
        class="input-suffix-btn"
        onclick={() => showPassword = !showPassword}
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {showPassword ? 'ocultar' : 'mostrar'}
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
    font-family: var(--font-ui);
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--color-black);
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    background: var(--color-white);
    border: 0.15rem solid rgba(0, 0, 0, .12);
    border-radius: var(--radius-md);
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
    padding: 1rem 1.2rem;
    font-family: var(--font-body);
    font-size: .875rem;
    color: var(--color-black);
    min-width: 0;
  }

  .input-el::placeholder {
    color: var(--color-gray-2);
  }

  .input-prefix {
    padding: 0 1rem 0 1.2rem;
    font-family: var(--font-ui);
    font-size: .82rem;
    font-weight: 700;
    color: var(--color-gray);
    flex-shrink: 0;
  }

  .input-suffix-btn {
    padding: 0 1.2rem;
    height: 100%;
    border: none;
    border-left: 0.15rem solid rgba(0, 0, 0, .08);
    background: var(--color-bg-2);
    color: var(--color-black);
    font-family: var(--font-ui);
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--transition-base);
    align-self: stretch;
    display: flex;
    align-items: center;
  }

  .input-suffix-btn:hover {
    background: var(--color-bg-3);
  }

  .input-feedback {
    font-family: var(--font-body);
    font-size: .78rem;
  }

  .input-feedback--hint { color: var(--color-gray); }
  .input-feedback--error { color: var(--color-error); }
  .input-feedback--success { color: var(--color-success); }
</style>
