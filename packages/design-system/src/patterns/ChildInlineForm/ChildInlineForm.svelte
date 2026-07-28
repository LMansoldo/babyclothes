<script lang="ts">
  export interface ChildInlineFormValues {
    name: string
    ageMonths: string
    currentHeightCm: string
    currentWeightKg: string
    birthHeightCm: string
    birthWeightG: string
  }

  export interface ChildInlineFormLabels {
    name: string
    ageMonths: string
    currentHeight: string
    currentWeight: string
    birthHeight: string
    birthWeight: string
    submit: string
  }

  export interface ChildInlineFormUnits {
    age?: string
    height?: string
    weight?: string
    birthWeight?: string
  }

  export interface ChildInlineFormProps {
    initial?: Partial<ChildInlineFormValues>
    loading?: boolean
    submitLabel: string
    labels: ChildInlineFormLabels
    units?: ChildInlineFormUnits
    onSubmit?: (values: ChildInlineFormValues) => void
  }

  let {
    initial,
    loading = false,
    submitLabel,
    labels,
    units = {},
    onSubmit,
  }: ChildInlineFormProps = $props()

  const defaultUnits: Required<ChildInlineFormUnits> = {
    age: 'months',
    height: 'cm',
    weight: 'kg',
    birthWeight: 'g',
  }

  const resolvedUnits = $derived({ ...defaultUnits, ...units })

  let name = $state(initial?.name ?? '')
  let ageMonths = $state(initial?.ageMonths ?? '')
  let currentHeightCm = $state(initial?.currentHeightCm ?? '')
  let currentWeightKg = $state(initial?.currentWeightKg ?? '')
  let birthHeightCm = $state(initial?.birthHeightCm ?? '')
  let birthWeightG = $state(initial?.birthWeightG ?? '')

  function handleSubmit(event: Event) {
    event.preventDefault()
    if (loading) return
    onSubmit?.({
      name,
      ageMonths,
      currentHeightCm,
      currentWeightKg,
      birthHeightCm,
      birthWeightG,
    })
  }
</script>

<form class="childinlineform" onsubmit={handleSubmit}>
  <div class="childinlineform__grid">
    <div class="childinlineform__field childinlineform__field--full">
      <label class="childinlineform__label" for="child-name">{labels.name}</label>
      <input
        id="child-name"
        type="text"
        class="childinlineform__input"
        bind:value={name}
        disabled={loading}
      />
    </div>

    <div class="childinlineform__field">
      <label class="childinlineform__label" for="child-age">{labels.ageMonths}</label>
      <div class="childinlineform__input-group">
        <input
          id="child-age"
          type="number"
          inputmode="numeric"
          class="childinlineform__input"
          bind:value={ageMonths}
          disabled={loading}
          min="0"
          max="72"
        />
        <span class="childinlineform__suffix">{resolvedUnits.age}</span>
      </div>
    </div>

    <div class="childinlineform__field">
      <label class="childinlineform__label" for="child-height">{labels.currentHeight}</label>
      <div class="childinlineform__input-group">
        <input
          id="child-height"
          type="number"
          inputmode="decimal"
          class="childinlineform__input"
          bind:value={currentHeightCm}
          disabled={loading}
          min="30"
          max="150"
          step="0.1"
        />
        <span class="childinlineform__suffix">{resolvedUnits.height}</span>
      </div>
    </div>

    <div class="childinlineform__field">
      <label class="childinlineform__label" for="child-weight">{labels.currentWeight}</label>
      <div class="childinlineform__input-group">
        <input
          id="child-weight"
          type="number"
          inputmode="decimal"
          class="childinlineform__input"
          bind:value={currentWeightKg}
          disabled={loading}
          min="1"
          max="40"
          step="0.1"
        />
        <span class="childinlineform__suffix">{resolvedUnits.weight}</span>
      </div>
    </div>

    <div class="childinlineform__field">
      <label class="childinlineform__label" for="child-birth-height">{labels.birthHeight}</label>
      <div class="childinlineform__input-group">
        <input
          id="child-birth-height"
          type="number"
          inputmode="decimal"
          class="childinlineform__input"
          bind:value={birthHeightCm}
          disabled={loading}
          min="30"
          max="70"
          step="0.1"
        />
        <span class="childinlineform__suffix">{resolvedUnits.height}</span>
      </div>
    </div>

    <div class="childinlineform__field">
      <label class="childinlineform__label" for="child-birth-weight">{labels.birthWeight}</label>
      <div class="childinlineform__input-group">
        <input
          id="child-birth-weight"
          type="number"
          inputmode="numeric"
          class="childinlineform__input"
          bind:value={birthWeightG}
          disabled={loading}
          min="500"
          max="6000"
        />
        <span class="childinlineform__suffix">{resolvedUnits.birthWeight}</span>
      </div>
    </div>
  </div>

  <button
    type="submit"
    class="childinlineform__submit"
    disabled={loading}
  >
    {#if loading}
      <span class="childinlineform__spinner" aria-hidden="true"></span>
    {/if}
    {submitLabel}
  </button>
</form>

<style>
  .childinlineform {
    width: 100%;
  }

  .childinlineform__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .childinlineform__field--full {
    grid-column: 1 / -1;
  }

  .childinlineform__label {
    display: block;
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    color: #374151;
    margin-bottom: 0.3rem;
  }

  .childinlineform__input-group {
    display: flex;
    align-items: center;
    background: var(--color-white);
    border: 0.1rem solid #D1D5DB;
    border-radius: 0.625rem;
    overflow: hidden;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
  }

  .childinlineform__input-group:focus-within {
    border-color: var(--color-pink);
    box-shadow: 0 0 0 0.3rem rgba(255, 60, 172, 0.12);
  }

  .childinlineform__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 0.55rem 0.7rem;
    font-family: var(--font-lato);
    font-size: 0.82rem;
    color: var(--color-black);
    min-width: 0;
    width: 100%;
  }

  .childinlineform__input-group .childinlineform__input {
    width: auto;
  }

  .childinlineform__input::placeholder {
    color: var(--color-gray-2);
  }

  .childinlineform__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .childinlineform__suffix {
    padding: 0 0.6rem;
    font-family: var(--font-lato);
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--color-gray);
    background: var(--color-bg-2);
    align-self: stretch;
    display: flex;
    align-items: center;
    border-left: 0.075rem solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  .childinlineform__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    margin-top: 1rem;
    padding: 0.7rem 1.2rem;
    border: none;
    border-radius: 0.5rem;
    background: var(--color-pink);
    color: #fff;
    font-family: var(--font-lato);
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }

  .childinlineform__submit:hover:not(:disabled) {
    transform: translateY(-0.1rem);
    box-shadow: var(--shadow-pk);
  }

  .childinlineform__submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .childinlineform__spinner {
    display: inline-block;
    width: 0.7rem;
    height: 0.7rem;
    border: 0.1rem solid rgba(255, 255, 255, 0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: bc-spin 0.6s linear infinite;
    flex-shrink: 0;
  }
</style>
