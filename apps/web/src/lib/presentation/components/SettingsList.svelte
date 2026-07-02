<script lang="ts">
	import { t } from '$lib/i18n';
	import { Toggle, LanguageToggle, CountBadge } from '@babyclothes/design-system';

	type SettingsLink = {
		type: 'link';
		label: string;
		href?: string;
		count?: number;
		onclick?: () => void;
	};

	type SettingsToggle = {
		type: 'toggle';
		label: string;
		checked: boolean;
		onchange: (checked: boolean) => void;
	};

	type SettingsLanguage = {
		type: 'language';
		label: string;
		currentLang: 'pt' | 'en';
		onchange: (lang: 'pt' | 'en') => void;
	};

	type SettingsAction = {
		type: 'action';
		label: string;
		variant: 'default' | 'danger';
		onclick: () => void;
	};

	type SettingsItem = SettingsLink | SettingsToggle | SettingsLanguage | SettingsAction;

	let {
		items,
	}: { items: SettingsItem[] } = $props();

	function getAriaLabel(item: SettingsItem): string {
		switch (item.type) {
			case 'link': {
				const countText = item.count !== undefined
					? $t('settings.a11y_count', { count: String(item.count) })
					: '';
				return countText
					? `${item.label}, ${countText}`
					: item.label;
			}
			case 'toggle':
				return item.label;
			case 'language':
				return `${item.label}: ${item.currentLang}`;
			case 'action':
				return item.label;
		}
	}
</script>

<ul class="settings__list">
	{#each items as item, index}
		<li class="settings__row" class:settings__row--last={index === items.length - 1}>
			{#if item.type === 'link'}
				<button
					class="settings__button"
					aria-label={getAriaLabel(item)}
					onclick={item.onclick}
				>
					<span class="settings__label">{item.label}</span>
					<span class="settings__control">
						{#if item.count !== undefined}
							<CountBadge
								count={item.count}
								max={99}
								variant="dark"
								size="sm"
							/>
						{/if}
						<svg
							class="settings__chevron"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</span>
				</button>
			{:else if item.type === 'toggle'}
				<div class="settings__button" role="group" aria-label={getAriaLabel(item)}>
					<span class="settings__label">{item.label}</span>
					<span class="settings__control">
						<Toggle
							variant="switch"
							checked={item.checked}
							onchange={item.onchange}
						/>
					</span>
				</div>
			{:else if item.type === 'language'}
				<div class="settings__button" role="group" aria-label={getAriaLabel(item)}>
					<span class="settings__label">{item.label}</span>
					<span class="settings__control">
						<LanguageToggle
							current={item.currentLang}
							onchange={item.onchange}
						/>
					</span>
				</div>
			{:else if item.type === 'action'}
				<button
					class="settings__button settings__button--action"
					class:settings__button--danger={item.variant === 'danger'}
					aria-label={getAriaLabel(item)}
					onclick={item.onclick}
				>
					<span
						class="settings__label"
						class:settings__label--danger={item.variant === 'danger'}
					>
						{item.label}
					</span>
					{#if item.variant === 'default'}
						<span class="settings__control">
							<svg
								class="settings__chevron"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</span>
					{/if}
				</button>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.settings__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.settings__row {
		border-bottom: 1px solid #F3F4F6;
	}

	.settings__row--last {
		border-bottom: none;
	}

	.settings__button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 1rem 0;
		min-height: 2.75rem;
		background: none;
		border: none;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.85rem;
		text-align: left;
		color: var(--bk);
		cursor: default;
		gap: 0.75rem;
	}

	button.settings__button {
		cursor: pointer;
	}

	button.settings__button:hover {
		opacity: 0.8;
	}

	.settings__button:focus-visible {
		border-radius: 0.375rem;
		box-shadow: 0 0 0 0.2rem var(--pk);
		outline: none;
	}

	.settings__label {
		flex: 1;
		min-width: 0;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.85rem;
		color: var(--bk);
	}

	.settings__label--danger {
		color: #EF4444;
	}

	.settings__control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.settings__chevron {
		flex-shrink: 0;
		color: var(--gr);
	}

	.settings__button--danger .settings__label--danger {
		text-align: center;
	}
</style>
