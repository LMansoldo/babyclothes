<script lang="ts">
	import { t } from '$lib/i18n';
	import { Chip } from '@babyclothes/design-system';
	import { Plus } from 'lucide-svelte';

	interface Measurement {
		date: string;
		formattedDate: string;
		age: string;
		weight: string;
		height: string;
		size: string;
	}

	interface MeasurementGroup {
		label: string;
		items: Measurement[];
	}

	let {
		childId,
		measurements,
		onAdd,
		addLabel = $t('measurements.add'),
		onViewAll,
	}: {
		childId: string;
		measurements: Measurement[];
		onAdd?: () => void;
		addLabel?: string;
		onViewAll?: () => void;
	} = $props();

	const groupedMeasurements = $derived(groupByMonthYear(measurements));

	function groupByMonthYear(items: Measurement[]): MeasurementGroup[] {
		const groupsMap = new Map<string, Measurement[]>();
		const monthFormatter = new Intl.DateTimeFormat(
			typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
			{ month: 'long' }
		);

		for (const item of items) {
			const d = new Date(item.date);
			if (isNaN(d.getTime())) continue;

			const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
			const monthName = monthFormatter.format(d);
			const label = `${monthName} ${d.getFullYear()}`;

			if (!groupsMap.has(key)) {
				groupsMap.set(key, []);
			}
			groupsMap.get(key)!.push(item);
		}

		const groups: MeasurementGroup[] = [];
		for (const [key, groupItems] of groupsMap) {
			const d = new Date(groupItems[0]?.date ?? '');
			if (isNaN(d.getTime())) {
				groups.push({ label: key, items: groupItems });
				continue;
			}
			const monthName = monthFormatter.format(d);
			const label = `${monthName} ${d.getFullYear()}`;
			groups.push({ label, items: groupItems });
		}

		return groups;
	}

	function getRowAriaLabel(item: Measurement): string {
		return `${item.formattedDate}: ${item.weight}, ${item.height}, ${$t('measurements.size_prefix')} ${item.size}`;
	}
</script>

<div class="measurements" aria-label={$t('measurements.title')}>
	<div class="measurements__header">
		<h2 class="measurements__heading">{$t('measurements.title')}</h2>
		{#if measurements.length > 0}
			<button
				class="measurements__add-link"
				onclick={onAdd}
				aria-label={addLabel}
			>
				<Plus class="measurements__add-icon" size={14} stroke-width={2.5} />
				<span>{addLabel}</span>
			</button>
		{/if}
	</div>

	{#if measurements.length === 0}
		<div class="measurements__empty">
			<p class="measurements__empty-text">{$t('measurements.empty')}</p>
			<button
				class="measurements__empty-add"
				onclick={onAdd}
				aria-label={addLabel}
			>
				{$t('measurements.add_first')}
			</button>
		</div>
	{:else}
		{#each groupedMeasurements as group}
			<div class="measurements__group">
				<p class="measurements__group-label">{group.label}</p>
				<ul class="measurements__list">
					{#each group.items as item}
						<li
							class="measurements__row"
							aria-label={getRowAriaLabel(item)}
						>
							<div class="measurements__row-info">
								<span class="measurements__date">{item.formattedDate}</span>
								<span class="measurements__age">{item.age}</span>
							</div>
							<div class="measurements__row-values">
								<span class="measurements__weight">{item.weight}</span>
								<span class="measurements__separator" aria-hidden="true">&middot;</span>
								<span class="measurements__height">{item.height}</span>
							</div>
							<div class="measurements__row-size">
								<Chip label={item.size} variant="size" selected size="sm" />
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	{/if}
</div>

<style>
	.measurements {
		width: 100%;
	}

	.measurements__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.measurements__heading {
		margin: 0;
		font-family: var(--sr);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--bk);
	}

	.measurements__add-link {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: none;
		border: none;
		padding: 0.25rem 0.5rem;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--pk);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: opacity var(--transition-fast);
	}

	.measurements__add-link:hover {
		opacity: 0.8;
	}

	.measurements__add-link:focus-visible {
		box-shadow: 0 0 0 0.2rem var(--pk);
		outline: none;
	}

	.measurements__add-icon {
		flex-shrink: 0;
	}

	.measurements__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem 1rem;
	}

	.measurements__empty-text {
		margin: 0;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.85rem;
		color: var(--gr);
		text-align: center;
	}

	.measurements__empty-add {
		background: none;
		border: 1px solid var(--pk);
		color: var(--pk);
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius-pill);
		font-family: var(--font-lato), sans-serif;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.measurements__empty-add:hover {
		background: var(--pk);
		color: var(--wh);
	}

	.measurements__empty-add:focus-visible {
		box-shadow: 0 0 0 0.2rem var(--pk);
		outline: none;
	}

	.measurements__group {
		margin-bottom: 0.5rem;
	}

	.measurements__group:last-child {
		margin-bottom: 0;
	}

	.measurements__group-label {
		margin: 0 0 0.5rem;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--gr);
		text-transform: none;
		letter-spacing: 0.02em;
	}

	.measurements__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.measurements__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.8rem 0;
		border-bottom: 1px solid #F3F4F6;
	}

	.measurements__row:last-child {
		border-bottom: none;
	}

	.measurements__row-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		flex: 1;
	}

	.measurements__date {
		font-family: var(--font-lato), sans-serif;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--bk);
	}

	.measurements__age {
		font-family: var(--font-lato), sans-serif;
		font-size: 0.7rem;
		color: var(--gr);
	}

	.measurements__row-values {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--font-lato), sans-serif;
		font-size: 0.8rem;
		color: var(--bk);
		flex-shrink: 0;
		text-align: center;
	}

	.measurements__separator {
		color: var(--gr2);
	}

	.measurements__row-size {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-shrink: 0;
		min-width: 3.5rem;
	}
</style>
