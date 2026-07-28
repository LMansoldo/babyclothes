<script lang="ts">
  export interface SelectOption {
    value: string;
    label: string;
  }

  let {
    id,
    options,
    value = $bindable(''),
    label,
    placeholder,
    error,
    hint,
    disabled = false,
    name,
    onchange,
    onblur,
  }: {
    id: string;
    options: SelectOption[];
    value?: string;
    label?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    name?: string;
    onchange?: (value: string) => void;
    onblur?: (e: FocusEvent) => void;
  } = $props();

  const selectState = $derived(error ? 'error' : 'default');

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    value = target.value;
    onchange?.(target.value);
  }
</script>

<div class="select">
  {#if label}
    <label class="select__label" for={id}>{label}</label>
  {/if}

  <div class="select__wrapper select__wrapper--{selectState}" class:select__wrapper--disabled={disabled}>
    <select
      {id}
      {name}
      {disabled}
      bind:value
      onchange={handleChange}
      {onblur}
      class="select__el"
      class:select__el--placeholder={!value}
    >
      {#if placeholder}
        <option value="" disabled>{placeholder}</option>
      {/if}
      {#each options as opt (opt.value)}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>

    <svg class="select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>

  {#if error}
    <span class="select__error">{error}</span>
  {:else if hint}
    <span class="select__hint">{hint}</span>
  {/if}
</div>

<style>
  .select {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .select__label {
    font-family: var(--font-lato);
    font-size: 0.8rem;
    font-weight: 700;
    color: #374151;
  }

  .select__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--wh);
    border: 0.09375rem solid #D1D5DB;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: border-color var(--transition-base, 0.2s), box-shadow var(--transition-base, 0.2s);
  }

  .select__wrapper:focus-within {
    border-color: var(--pk, #ff3cac);
    box-shadow: 0 0 0 0.3rem rgba(255, 60, 172, .12);
  }

  .select__wrapper--error {
    border-color: var(--color-error, #dc2626);
  }

  .select__wrapper--error:focus-within {
    border-color: var(--color-error, #dc2626);
    box-shadow: 0 0 0 0.3rem rgba(220, 38, 38, .12);
  }

  .select__wrapper--disabled {
    opacity: 0.55;
    pointer-events: none;
  }

  .select__el {
    appearance: none;
    -webkit-appearance: none;
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 0.65rem 2.2rem 0.65rem 0.875rem;
    font-family: var(--font-lato, 'Inter', sans-serif);
    font-size: 0.875rem;
    color: var(--bk, #000);
    min-width: 0;
    cursor: pointer;
  }

  .select__el--placeholder {
    color: #9CA3AF;
  }

  .select__el:disabled {
    cursor: not-allowed;
  }

  .select__chevron {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #6B7280;
    flex-shrink: 0;
  }

  .select__error {
    font-family: var(--font-lato);
    font-size: 0.7rem;
    color: var(--color-error, #dc2626);
  }

  .select__hint {
    font-family: var(--font-lato);
    font-size: 0.7rem;
    color: var(--color-gray, #6B7280);
  }
</style>
