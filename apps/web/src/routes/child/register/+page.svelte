<script lang="ts">
  import { goto } from '$app/navigation'
  import { t } from '$lib/i18n'
  import { ArrowLeft } from 'lucide-svelte'

  let name = $state('')
  let birthDate = $state('')
  let weight = $state('')
  let height = $state('')

  function handleSubmit() {
    console.log('Register child:', { name, birthDate, weight, height })
    goto('/child')
  }

  function handleBack() {
    goto('/child')
  }
</script>

<svelte:head>
  <title>{$t('child.register')} | BabyClothes</title>
</svelte:head>

<div class="register-page">
  <header class="register-page__header">
    <button class="register-page__back" onclick={handleBack}>
      <ArrowLeft size={18} />
    </button>
    <h1 class="register-page__title">{$t('child.register')}</h1>
  </header>

  <form class="register-page__form" onsubmit={(e) => { e.preventDefault(); handleSubmit() }}>
    <div class="register-page__field">
      <label class="register-page__label" for="child-name">{$t('child.name')}</label>
      <input
        id="child-name"
        type="text"
        class="register-page__input"
        bind:value={name}
        placeholder="Nome da criança"
      />
    </div>

    <div class="register-page__field">
      <label class="register-page__label" for="birth-date">Data de nascimento</label>
      <input
        id="birth-date"
        type="date"
        class="register-page__input"
        bind:value={birthDate}
      />
    </div>

    <div class="register-page__row">
      <div class="register-page__field">
        <label class="register-page__label" for="weight">Peso ao nascer (g)</label>
        <input
          id="weight"
          type="number"
          class="register-page__input"
          bind:value={weight}
          placeholder="3200"
        />
      </div>

      <div class="register-page__field">
        <label class="register-page__label" for="height">Altura ao nascer (cm)</label>
        <input
          id="height"
          type="number"
          class="register-page__input"
          bind:value={height}
          placeholder="49"
        />
      </div>
    </div>

    <button type="submit" class="register-page__submit">
      {$t('child.register')}
    </button>
  </form>
</div>

<style>
  .register-page {
    min-height: 100vh;
    background: var(--wh);
  }

  .register-page__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  }

  .register-page__back {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--of2);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bk);
    transition: background 0.15s;
  }

  .register-page__back:hover {
    background: var(--of3);
  }

  .register-page__title {
    font-family: var(--ld);
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0;
  }

  .register-page__form {
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .register-page__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  .register-page__row {
    display: flex;
    gap: 0.75rem;
  }

  .register-page__label {
    font-family: var(--ld);
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.45);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .register-page__input {
    background: var(--of2);
    border: 1.5px solid rgba(0, 0, 0, 0.09);
    border-radius: 10px;
    padding: 0.7rem 0.9rem;
    font-family: var(--vd);
    font-size: 0.85rem;
    color: var(--bk);
    outline: none;
    transition: border-color 0.2s;
  }

  .register-page__input:focus {
    border-color: var(--pk);
    background: var(--wh);
  }

  .register-page__submit {
    background: var(--pk);
    color: var(--wh);
    border: none;
    border-radius: 10px;
    padding: 0.8rem;
    font-family: var(--ld);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-top: 0.5rem;
  }

  .register-page__submit:hover {
    opacity: 0.9;
  }
</style>
