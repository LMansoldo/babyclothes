<script lang="ts">
  import { Camera, Plus, X, ArrowLeft, ArrowRight } from 'lucide-svelte'
  import { t } from '$lib/i18n'

  type FormData = {
    title: string
    category: string
    size: string
    condition: string
    gender: string
    photos: File[]
    price: number
    description: string
  }

  let {
    currentStep = 1,
    totalSteps = 2,
    formData = {
      title: '',
      category: '',
      size: '',
      condition: '',
      gender: '',
      photos: [],
      price: 0,
      description: '',
    },
    onSubmit,
    onBack,
  }: {
    currentStep?: 1 | 2
    totalSteps?: number
    formData?: FormData
    onSubmit?: (data: FormData) => void
    onBack?: () => void
  } = $props()

  const categories = $derived([
    $t('item_form.category_romper'),
    $t('item_form.category_bodysuit'),
    $t('item_form.category_dress'),
    $t('item_form.category_coat'),
    $t('item_form.category_set'),
    $t('item_form.category_accessory'),
  ])
  const sizes = ['RN', 'P', 'M', 'G', 'GG', '1', '2']
  const conditions = $derived([
    $t('item_form.condition_new'),
    $t('item_form.condition_like_new'),
    $t('item_form.condition_used'),
  ])
  const genders = $derived([
    $t('item_form.gender_girl'),
    $t('item_form.gender_boy'),
    $t('item_form.gender_unisex'),
  ])

  // svelte-ignore state_referenced_locally
  let title = $state(formData.title)
  // svelte-ignore state_referenced_locally
  let category = $state(formData.category)
  // svelte-ignore state_referenced_locally
  let size = $state(formData.size)
  // svelte-ignore state_referenced_locally
  let condition = $state(formData.condition)
  // svelte-ignore state_referenced_locally
  let gender = $state(formData.gender)
  // svelte-ignore state_referenced_locally
  let photos = $state<File[]>(formData.photos)
  // svelte-ignore state_referenced_locally
  let price = $state(formData.price)
  // svelte-ignore state_referenced_locally
  let description = $state(formData.description)
  let photoUrls = $state<string[]>([])

  const stepLabel = $derived(currentStep === 1 ? $t('item_form.step_info') : $t('item_form.step_photos_price'))
  const progressPercent = $derived((currentStep / totalSteps) * 100)
  const isLastStep = $derived(currentStep === totalSteps)

  function handlePhotoDrop(e: DragEvent) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    )
    addPhotos(files)
  }

  function handlePhotoInput(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    addPhotos(files)
    input.value = ''
  }

  function addPhotos(files: File[]) {
    photos = [...photos, ...files]
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = () => {
        photoUrls = [...photoUrls, reader.result as string]
      }
      reader.readAsDataURL(file)
    }
  }

  function removePhoto(index: number) {
    photos = photos.filter((_, i) => i !== index)
    photoUrls = photoUrls.filter((_, i) => i !== index)
  }

  function handleContinue() {
    onSubmit?.({
      title,
      category,
      size,
      condition,
      gender,
      photos,
      price,
      description,
    })
  }

  function handleBack() {
    onBack?.()
  }

  function handlePriceInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value
    const parsed = parseFloat(raw)
    price = isNaN(parsed) ? 0 : parsed
  }
</script>

<div class="itemform">
  <!-- Header -->
  <div class="itemform__header">
    <h2 class="itemform__title">{$t('item_form.new_listing')}</h2>
    <span class="itemform__step">{currentStep} {$t('common.of')} {totalSteps} &mdash; {stepLabel}</span>
  </div>

  <!-- Body -->
  <div class="itemform__body">
    {#if currentStep === 1}
      <!-- Step 1: Info -->

      <div class="itemform__field">
        <label class="itemform__label" for="item-title">{$t('item_form.title_label')}</label>
        <input
          id="item-title"
          class="itemform__input"
          type="text"
          placeholder={$t('item_form.title_placeholder')}
          bind:value={title}
        />
      </div>

      <div class="itemform__field">
        <span class="itemform__label">{$t('item_form.category_label')}</span>
        <div class="itemform__chipgroup">
          {#each categories as cat (cat)}
            <button
              type="button"
              class="itemform__chip"
              class:itemform__chip--on={category === cat}
              onclick={() => (category = category === cat ? '' : cat)}
            >
              {cat}
            </button>
          {/each}
        </div>
      </div>

      <div class="itemform__field">
        <span class="itemform__label">{$t('item_form.size_label')}</span>
        <div class="itemform__chipgroup">
          {#each sizes as s (s)}
            <button
              type="button"
              class="itemform__chip"
              class:itemform__chip--on={size === s}
              onclick={() => (size = size === s ? '' : s)}
            >
              {s}
            </button>
          {/each}
        </div>
      </div>

      <div class="itemform__field">
        <span class="itemform__label">{$t('item_form.condition_label')}</span>
        <div class="itemform__chipgroup">
          {#each conditions as cond (cond)}
            <button
              type="button"
              class="itemform__chip"
              class:itemform__chip--pkon={condition === cond}
              onclick={() => (condition = condition === cond ? '' : cond)}
            >
              {cond}
            </button>
          {/each}
        </div>
      </div>

      <div class="itemform__field">
        <span class="itemform__label">{$t('item_form.gender_label')}</span>
        <div class="itemform__chipgroup">
          {#each genders as g (g)}
            <button
              type="button"
              class="itemform__chip"
              class:itemform__chip--on={gender === g}
              onclick={() => (gender = gender === g ? '' : g)}
            >
              {g}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <!-- Step 2: Photos & Price -->

      <div class="itemform__field">
        <span class="itemform__label">{$t('item_form.photos_label')}</span>

        {#if photos.length === 0}
          <div
            class="itemform__photodrop"
            ondragover={(e) => e.preventDefault()}
            ondrop={handlePhotoDrop}
            role="button"
            tabindex="0"
            aria-label={$t('item_form.photo_drop_aria')}
          >
            <label class="itemform__photodrop-area">
              <input
                type="file"
                accept="image/*"
                multiple
                class="sr-only"
                onchange={handlePhotoInput}
              />
              <span class="itemform__photo-icon">
                <Camera size={18} strokeWidth={2} />
              </span>
              <span class="itemform__photo-lbl">{$t('item_form.photo_drop_text')}</span>
              <span class="itemform__photo-sub">{$t('item_form.photo_drop_hint')}</span>
            </label>
          </div>
        {:else}
          <div class="itemform__thumbs">
            {#each photoUrls as url, i (url)}
              <div class="itemform__thumb">
                <img src={url} alt={$t('item_form.photo_alt', { index: i + 1 })} class="itemform__thumb-img" />
                <button
                  type="button"
                  class="itemform__thumb-remove"
                  aria-label={$t('item_form.remove_photo')}
                  onclick={() => removePhoto(i)}
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            {/each}
            <label class="itemform__thumb itemform__thumb--add">
              <input
                type="file"
                accept="image/*"
                multiple
                class="sr-only"
                onchange={handlePhotoInput}
              />
              <Plus size={18} strokeWidth={2.5} />
            </label>
          </div>
        {/if}
      </div>

      <div class="itemform__field">
        <label class="itemform__label" for="item-price">{$t('item_form.price_label')}</label>
        <input
          id="item-price"
          class="itemform__input"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          value={price || ''}
          oninput={handlePriceInput}
        />
      </div>

      <div class="itemform__field">
        <label class="itemform__label" for="item-desc">{$t('item_form.description_label')}</label>
        <textarea
          id="item-desc"
          class="itemform__input itemform__input--textarea"
          rows="4"
          placeholder={$t('item_form.description_placeholder')}
          bind:value={description}
        ></textarea>
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <div class="itemform__footer">
    <div class="itemform__progress">
      <div class="itemform__progress-fill" style="width: {progressPercent}%"></div>
    </div>

    <div class="itemform__actions">
      {#if currentStep > 1}
        <button type="button" class="itemform__btn itemform__btn--ghost" onclick={handleBack}>
          <ArrowLeft size={14} strokeWidth={2.5} />
          {$t('common.back')}
        </button>
      {/if}

      {#if isLastStep}
        <button type="button" class="itemform__btn itemform__btn--primary" onclick={handleContinue}>
          {$t('item_form.publish')}
        </button>
      {:else}
        <button type="button" class="itemform__btn itemform__btn--dark" onclick={handleContinue}>
          {$t('common.continue')}
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .itemform {
    background: var(--wh);
    border: 0.1rem solid rgba(0, 0, 0, 0.08);
    border-radius: 1.6rem;
    overflow: hidden;
    max-width: 44rem;
    box-shadow: 0 0.2rem 1.2rem rgba(0, 0, 0, 0.06);
  }

  .itemform__header {
    padding: 1.1rem 1.3rem;
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.07);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .itemform__title {
    font-family: var(--ld);
    font-size: 0.9rem;
    font-weight: 900;
    color: var(--bk);
    letter-spacing: -0.01em;
    margin: 0;
  }

  .itemform__step {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.78rem;
    color: var(--pk);
  }

  .itemform__body {
    padding: 1.2rem 1.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .itemform__field {
    display: flex;
    flex-direction: column;
  }

  .itemform__label {
    font-family: var(--ld);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: rgba(0, 0, 0, 0.55);
    display: block;
    margin-bottom: 0.3rem;
  }

  .itemform__input {
    background: var(--of2);
    border: 0.15rem solid rgba(0, 0, 0, 0.09);
    border-radius: 1rem;
    padding: 0.55rem 0.85rem;
    font-family: var(--vd);
    font-size: 0.8rem;
    color: var(--bk);
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
  }

  .itemform__input:focus {
    border-color: var(--pk);
    background: var(--wh);
    box-shadow: 0 0 0 0.3rem rgba(255, 60, 172, 0.08);
  }

  .itemform__input::placeholder {
    color: rgba(0, 0, 0, 0.2);
  }

  .itemform__input--textarea {
    min-height: 8rem;
    line-height: 1.5;
  }

  .itemform__chipgroup {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .itemform__chip {
    background: var(--of2);
    border: 0.1rem solid rgba(0, 0, 0, 0.1);
    border-radius: 0.7rem;
    padding: 0.28rem 0.62rem;
    font-family: var(--ld);
    font-size: 0.68rem;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.38);
    cursor: pointer;
    transition: all 0.15s;
    line-height: 1.4;
  }

  .itemform__chip:hover {
    border-color: rgba(0, 0, 0, 0.22);
    color: var(--bk);
  }

  .itemform__chip--on {
    background: var(--bk);
    border-color: var(--bk);
    color: var(--wh);
  }

  .itemform__chip--pkon {
    background: var(--pk3);
    border-color: var(--pk2);
    color: var(--pk);
  }

  .itemform__photodrop {
    border: 0.2rem dashed rgba(0, 0, 0, 0.12);
    border-radius: 1.2rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .itemform__photodrop:hover {
    border-color: rgba(255, 60, 172, 0.3);
    background: var(--pk3);
  }

  .itemform__photodrop-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    text-align: center;
  }

  .itemform__photo-icon {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    background: var(--of2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.4);
  }

  .itemform__photo-lbl {
    font-family: var(--ld);
    font-size: 0.7rem;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.35);
  }

  .itemform__photo-sub {
    font-size: 0.62rem;
    color: var(--gr);
  }

  .itemform__thumbs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .itemform__thumb {
    width: 5.6rem;
    height: 5.6rem;
    border-radius: 0.8rem;
    background: var(--of2);
    position: relative;
    overflow: hidden;
    border: 0.1rem solid rgba(0, 0, 0, 0.08);
  }

  .itemform__thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .itemform__thumb-remove {
    position: absolute;
    top: 0.2rem;
    right: 0.2rem;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: var(--wh);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background 0.15s;
  }

  .itemform__thumb-remove:hover {
    background: var(--pk);
  }

  .itemform__thumb--add {
    border: 0.15rem dashed rgba(0, 0, 0, 0.14);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.3);
    transition: all 0.15s;
  }

  .itemform__thumb--add:hover {
    border-color: var(--pk);
    color: var(--pk);
    background: var(--pk3);
  }

  .itemform__footer {
    padding: 0.9rem 1.3rem;
    border-top: 0.1rem solid rgba(0, 0, 0, 0.07);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .itemform__progress {
    width: 100%;
    height: 0.2rem;
    background: var(--of2);
    border-radius: 0.1rem;
    overflow: hidden;
  }

  .itemform__progress-fill {
    height: 100%;
    background: var(--pk);
    border-radius: 0.1rem;
    transition: width 0.3s ease;
  }

  .itemform__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
  }

  .itemform__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: none;
    border-radius: 1rem;
    padding: 0.55rem 1rem;
    font-family: var(--ld);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  .itemform__btn--dark {
    background: var(--bk);
    color: var(--wh);
  }

  .itemform__btn--dark:hover {
    opacity: 0.88;
  }

  .itemform__btn--primary {
    background: var(--pk);
    color: var(--wh);
  }

  .itemform__btn--primary:hover {
    opacity: 0.9;
  }

  .itemform__btn--ghost {
    background: var(--of2);
    color: var(--bk);
    border: 0.1rem solid rgba(0, 0, 0, 0.08);
  }

  .itemform__btn--ghost:hover {
    background: var(--of3);
  }

  :global(.sr-only) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
