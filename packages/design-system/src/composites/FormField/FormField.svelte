<script lang="ts">
  let {
    label,
    name,
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    required = false,
    disabled = false,
    error,
    hint,
    suffix,
    prefix,
    inputmode,
    oninput,
  }: {
    label: string
    name: string
    type?: 'text' | 'date' | 'number' | 'textarea'
    value?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    suffix?: string
    prefix?: string
    inputmode?: 'text' | 'numeric' | 'decimal' | 'email'
    oninput?: (value: string) => void
  } = $props()

  const errorId = $derived(`${name}-error`)
  const hintId = $derived(`${name}-hint`)
  const describedBy = $derived(error ? errorId : hint ? hintId : undefined)

</script>

<div class="form-field">
  <label class="form-field__label" for={name}>
    {label}
    {#if required}
      <span class="form-field__required" aria-hidden="true">*</span>
    {/if}
  </label>

  <div
    class="form-field__wrapper"
    class:form-field__wrapper--error={!!error}
    class:form-field__wrapper--disabled={disabled}
  >
    {#if prefix}
      <span class="form-field__prefix">{prefix}</span>
    {/if}

    {#if type === 'textarea'}
      <textarea
        id={name}
        {name}
        class="form-field__input form-field__input--textarea"
        {placeholder}
        {disabled}
        {required}
        bind:value
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
        oninput={() => oninput?.(value)}
      ></textarea>
    {:else}
      <input
        id={name}
        {name}
        type={type}
        class="form-field__input"
        {placeholder}
        {disabled}
        {required}
        {inputmode}
        bind:value
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
        oninput={(e) => oninput?.(value)}
      />
    {/if}

    {#if suffix}
      <span class="form-field__suffix">{suffix}</span>
    {/if}
  </div>

  {#if error}
    <span id={errorId} class="form-field__feedback form-field__feedback--error" role="alert">
      {error}
    </span>
  {:else if hint}
    <span id={hintId} class="form-field__feedback form-field__feedback--hint">
      {hint}
    </span>
  {/if}
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;
  }

  .form-field__label {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--bk);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.15rem;
  }

  .form-field__required {
    color: #EF4444;
    font-size: 0.85rem;
    line-height: 1;
  }

  .form-field__wrapper {
    display: flex;
    align-items: center;
    background: #F3F4F6;
    border: 0.15rem solid transparent;
    border-radius: 0.75rem;
    overflow: hidden;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
  }

  .form-field__wrapper:focus-within {
    border-color: #D1D5DB;
  }

  .form-field__wrapper--error {
    border-color: #EF4444;
  }

  .form-field__wrapper--error:focus-within {
    border-color: #EF4444;
  }

  .form-field__wrapper--disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .form-field__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 0.75rem;
    font-family: var(--font-lato);
    font-size: 0.875rem;
    color: var(--bk);
    min-width: 0;
  }

  .form-field__input::placeholder {
    color: var(--gr2);
  }

  .form-field__input:focus-visible {
    outline: none;
  }

  .form-field__input--textarea {
    min-height: 5rem;
    resize: vertical;
  }

  .form-field__prefix,
  .form-field__suffix {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--gr);
    padding: 0 0.75rem;
    flex-shrink: 0;
    user-select: none;
  }

  .form-field__feedback {
    font-family: var(--font-lato);
    font-size: 0.6rem;
    line-height: 1.3;
  }

  .form-field__feedback--error {
    color: #EF4444;
  }

  .form-field__feedback--hint {
    color: var(--gr);
  }
</style>
