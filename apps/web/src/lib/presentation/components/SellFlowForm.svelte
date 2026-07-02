<script lang="ts">
	import { t } from '$lib/i18n';
	import { FormField, FilterChipGroup, PhotoUploader, ProgressBar } from '@babyclothes/design-system';
	import { AlertCircle, Check } from 'lucide-svelte';

	interface PhotoItem {
		id: string;
		file: File;
	}

	interface SellFormData {
		title: string;
		category: string;
		size: string;
		condition: string;
		gender: string;
		photos: PhotoItem[];
		price: number;
		description: string;
	}

	let {
		step = 1,
		onStepComplete,
		onSubmit,
		isLoading = false,
		error = '',
		categories,
		sizes,
		conditions,
		genders,
	}: {
		step?: 1 | 2;
		onStepComplete?: (step: 1 | 2) => void;
		onSubmit?: (data: SellFormData) => void;
		isLoading?: boolean;
		error?: string;
		categories: { value: string; label: string }[];
		sizes: string[];
		conditions: string[];
		genders: string[];
	} = $props();

	let title = $state('');
	let category = $state('');
	let size = $state('');
	let condition = $state('');
	let gender = $state('');
	let photos = $state<PhotoItem[]>([]);
	let price = $state('');
	let description = $state('');

	let validationErrors = $state<Record<string, string>>({});
	let hasAttemptedSubmit = $state(false);

	const stepLabel = $derived(
		step === 2 ? $t('sell.step_2_of_2') : $t('sell.step_1_of_2')
	);

	const sizeItems = $derived(
		sizes.map((s) => ({ value: s, label: s, selected: size === s }))
	);

	const conditionItems = $derived(
		conditions.map((c) => ({ value: c, label: c, selected: condition === c }))
	);

	const genderItems = $derived(
		genders.map((g) => ({ value: g, label: g, selected: gender === g }))
	);

	const categoryItems = $derived(
		categories.map((cat) => ({
			value: cat.value,
			label: cat.label,
			selected: category === cat.value,
		}))
	);

	const photoDisplayItems = $derived(
		photos.map((p) => ({ id: p.id, url: undefined, file: p.file }))
	);

	function validateStep1(): boolean {
		const errors: Record<string, string> = {};

		if (!title.trim()) {
			errors.title = $t('sell.validation.required');
		}
		if (!category) {
			errors.category = $t('sell.validation.required');
		}
		if (!size) {
			errors.size = $t('sell.validation.required');
		}
		if (!condition) {
			errors.condition = $t('sell.validation.required');
		}
		if (!gender) {
			errors.gender = $t('sell.validation.required');
		}

		validationErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function validateStep2(): boolean {
		const errors: Record<string, string> = {};

		if (photos.length === 0) {
			errors.photos = $t('sell.validation.at_least_one_photo');
		}

		const priceNum = parseFloat(price);
		if (!price || isNaN(priceNum) || priceNum <= 0) {
			errors.price = $t('sell.validation.price_required');
		}

		validationErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function handleContinue() {
		hasAttemptedSubmit = true;
		if (validateStep1()) {
			onStepComplete?.(1);
		}
	}

	function handleSubmit() {
		hasAttemptedSubmit = true;
		if (validateStep2()) {
			const formData: SellFormData = {
				title: title.trim(),
				category,
				size,
				condition,
				gender,
				photos,
				price: parseFloat(price),
				description: description.trim(),
			};
			onSubmit?.(formData);
		}
	}

	function handleCategoryChange(selectedValues: string[]) {
		category = selectedValues[0] ?? '';
		if (hasAttemptedSubmit && validationErrors.category) {
			const next = { ...validationErrors };
			delete next.category;
			validationErrors = next;
		}
	}

	function handleSizeChange(selectedValues: string[]) {
		size = selectedValues[0] ?? '';
		if (hasAttemptedSubmit && validationErrors.size) {
			const next = { ...validationErrors };
			delete next.size;
			validationErrors = next;
		}
	}

	function handleConditionChange(selectedValues: string[]) {
		condition = selectedValues[0] ?? '';
		if (hasAttemptedSubmit && validationErrors.condition) {
			const next = { ...validationErrors };
			delete next.condition;
			validationErrors = next;
		}
	}

	function handleGenderChange(selectedValues: string[]) {
		gender = selectedValues[0] ?? '';
		if (hasAttemptedSubmit && validationErrors.gender) {
			const next = { ...validationErrors };
			delete next.gender;
			validationErrors = next;
		}
	}

	function handlePhotoAdd() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.multiple = true;
		input.onchange = () => {
			const files = Array.from(input.files ?? []);
			const newPhotos: PhotoItem[] = files.map((file) => ({
				id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
				file,
			}));
			photos = [...photos, ...newPhotos].slice(0, 4);
			if (hasAttemptedSubmit && validationErrors.photos) {
				const next = { ...validationErrors };
				delete next.photos;
				validationErrors = next;
			}
		};
		input.click();
	}

	function handlePhotoRemove(id: string) {
		photos = photos.filter((p) => p.id !== id);
	}

	function handleTitleInput(value: string) {
		title = value;
		if (hasAttemptedSubmit && validationErrors.title && value.trim()) {
			const next = { ...validationErrors };
			delete next.title;
			validationErrors = next;
		}
	}

	function handlePriceInput(value: string) {
		price = value;
		if (hasAttemptedSubmit && validationErrors.price) {
			const num = parseFloat(value);
			if (!isNaN(num) && num > 0) {
				const next = { ...validationErrors };
				delete next.price;
				validationErrors = next;
			}
		}
	}
</script>

<form
	class="sell-flow"
	aria-label={$t('sell.title')}
	on:submit|preventDefault={(e) => {
		if (step === 1) {
			handleContinue();
		} else {
			handleSubmit();
		}
	}}
>
	{#if step === 1}
		<fieldset class="sell-flow__step">
			<legend class="sell-flow__legend">{stepLabel}</legend>

			<ProgressBar
				value={50}
				max={100}
				variant="dark"
				showLabel
				ariaValueText={$t('sell.step_1_of_2')}
			/>

			<div class="sell-flow__fields">
				<FormField
					label={$t('sell.title_label')}
					name="title"
					type="text"
					value={title}
					required
					placeholder={$t('sell.title_placeholder')}
					error={hasAttemptedSubmit ? validationErrors.title : undefined}
					oninput={handleTitleInput}
				/>

				<FilterChipGroup
					label={$t('sell.category')}
					items={categoryItems}
					variant="category"
					multiselect={false}
					onchange={handleCategoryChange}
				/>

				{#if hasAttemptedSubmit && validationErrors.category}
					<p class="sell-flow__error">{validationErrors.category}</p>
				{/if}

				<FilterChipGroup
					label={$t('sell.size')}
					items={sizeItems}
					variant="size"
					multiselect={false}
					onchange={handleSizeChange}
				/>

				{#if hasAttemptedSubmit && validationErrors.size}
					<p class="sell-flow__error">{validationErrors.size}</p>
				{/if}

				<FilterChipGroup
					label={$t('sell.condition')}
					items={conditionItems}
					variant="condition"
					multiselect={false}
					onchange={handleConditionChange}
				/>

				{#if hasAttemptedSubmit && validationErrors.condition}
					<p class="sell-flow__error">{validationErrors.condition}</p>
				{/if}

				<FilterChipGroup
					label={$t('sell.gender')}
					items={genderItems}
					variant="gender"
					multiselect={false}
					onchange={handleGenderChange}
				/>

				{#if hasAttemptedSubmit && validationErrors.gender}
					<p class="sell-flow__error">{validationErrors.gender}</p>
				{/if}
			</div>

			<button
				type="submit"
				class="sell-flow__continue"
				disabled={isLoading}
			>
				{isLoading ? $t('sell.continuing') : $t('sell.continue')}
			</button>
		</fieldset>
	{:else if step === 2}
		<fieldset class="sell-flow__step">
			<legend class="sell-flow__legend">{stepLabel}</legend>

			<ProgressBar
				value={100}
				max={100}
				variant="dark"
				showLabel
				ariaValueText={$t('sell.step_2_of_2')}
			/>

			<div class="sell-flow__fields">
				<PhotoUploader
					photos={photoDisplayItems}
					maxPhotos={4}
					gridCols={4}
					onAdd={handlePhotoAdd}
					onRemove={handlePhotoRemove}
				/>

				{#if hasAttemptedSubmit && validationErrors.photos}
					<p class="sell-flow__error">{validationErrors.photos}</p>
				{/if}

				<FormField
					label={$t('sell.price')}
					name="price"
					type="number"
					value={price}
					placeholder="0,00"
					prefix="R$"
					inputmode="decimal"
					error={hasAttemptedSubmit ? validationErrors.price : undefined}
					oninput={handlePriceInput}
				/>

				<FormField
					label={$t('sell.description')}
					name="description"
					type="textarea"
					value={description}
					placeholder={$t('sell.description_placeholder')}
					oninput={(v) => (description = v)}
				/>
			</div>

			{#if error}
				<div class="sell-flow__api-error">
					<AlertCircle class="sell-flow__api-error-icon" size={16} />
					<span>{error}</span>
				</div>
			{/if}

			<button
				type="submit"
				class="sell-flow__submit"
				disabled={isLoading}
			>
				{#if isLoading}
					{$t('sell.publishing')}
				{:else}
					<Check class="sell-flow__submit-icon" size={16} />
					<span>{$t('sell.publish')}</span>
				{/if}
			</button>
		</fieldset>
	{/if}
</form>

<style>
	.sell-flow {
		width: 100%;
		max-width: 32rem;
		margin: 0 auto;
	}

	.sell-flow__legend {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.sell-flow__step {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.sell-flow__fields {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.sell-flow__error {
		margin: 0;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.8rem;
		color: var(--color-error);
		margin-top: -0.8rem;
		padding-left: 0.2rem;
	}

	.sell-flow__continue {
		width: 100%;
		padding: 0.8rem 1.6rem;
		background-color: var(--bk);
		color: var(--wh);
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		transition: opacity var(--transition-fast);
		min-height: 2.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sell-flow__continue:hover {
		opacity: 0.9;
	}

	.sell-flow__continue:focus-visible {
		box-shadow: 0 0 0 0.2rem var(--pk);
		outline: none;
	}

	.sell-flow__continue:disabled {
		opacity: 0.35;
		pointer-events: none;
	}

	.sell-flow__submit {
		width: 100%;
		padding: 0.8rem 1.6rem;
		background: linear-gradient(135deg, #FF3CAC, #B03EFF);
		color: var(--wh);
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		transition: opacity var(--transition-fast), transform var(--transition-fast);
		min-height: 2.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
	}

	.sell-flow__submit:hover {
		opacity: 0.92;
	}

	.sell-flow__submit:active {
		transform: scale(0.98);
	}

	.sell-flow__submit:focus-visible {
		box-shadow: 0 0 0 0.2rem var(--pk);
		outline: none;
	}

	.sell-flow__submit:disabled {
		opacity: 0.35;
		pointer-events: none;
	}

	.sell-flow__submit-icon {
		flex-shrink: 0;
	}

	.sell-flow__api-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background-color: #FEF2F2;
		border: 1px solid #FECACA;
		border-radius: var(--radius-md);
		font-family: var(--font-lato), sans-serif;
		font-size: 0.8rem;
		color: var(--color-error);
	}

	.sell-flow__api-error-icon {
		flex-shrink: 0;
	}
</style>
