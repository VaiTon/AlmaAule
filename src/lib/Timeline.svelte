<script lang="ts">
	import dayjs from 'dayjs';
	import type { Impegno } from './api';
	import { page } from '$app/state';

	type Props = {
		resources: { id: string; title: string }[];
		hours?: number[];
		events?: { resourceId: string; start: Date; end: Date; title: string; impegno: Impegno }[];
		onEventClick?: (event: Impegno) => void;
	};

	let {
		events,
		resources,
		onEventClick,
		hours = Array.from({ length: 13 }, (_, i) => 8 + i)
	}: Props = $props();

	const labelWidth = '15rem'; // Width for resource labels

	// Helper to get event bar width in columns
	function getEventSpanStyle(start: Date, end: Date) {
		const startHour = start.getHours() + start.getMinutes() / 60;
		const endHour = end.getHours() + end.getMinutes() / 60;
		const firstHour = hours[0];
		const lastHour = hours[hours.length - 1] + 1;
		const left = Math.max(0, startHour - firstHour);
		const width = Math.min(endHour, lastHour) - Math.max(startHour, firstHour);

		return `
    		left: calc(${labelWidth} + ${left} * (100% - 12rem) / ${hours.length});
    		width: calc(${width} * (100% - 12rem) / ${hours.length} - 0.2rem);
    		min-width: 2.5rem;
    		z-index: 5;
		`;
	}

	let sortedResources = $derived.by(() => {
		return resources.toSorted((a, b) => a.title.localeCompare(b.title));
	});
</script>

<div class="overflow-x-auto">
	<div class="min-w-[700px]">
		<!-- Time axis -->
		<div class="flex border-b border-base-300 bg-base-200 sticky top-0 z-10">
			<div
				style="width: {labelWidth};"
				class="text-center py-2 text-xs font-semibold border-r border-base-300"
			>
				Resource
			</div>

			{#each hours as hour (hour)}
				<div class="flex-1 text-center py-2 text-xs font-semibold border-l border-base-300">
					{hour}:00
				</div>
			{/each}
		</div>
		<!-- Resource rows -->
		{#each sortedResources as resource (resource.id)}
			<div
				class="flex border-b border-base-300 items-center bg-base-100 hover:bg-base-200 transition relative"
				style="height: 3rem;"
			>
				<a
					class="px-2 py-2 font-medium truncate z-10 link text-start text-sm"
					style="width: {labelWidth};"
					href={page.url.pathname + '/' + resource.id}
				>
					{resource.title}
				</a>
				{#each hours as hour (hour)}
					<div class="flex-1 h-12 border-l border-base-300"></div>
				{/each}
				<!-- Render events for this resource -->
				{#if events}
					{#each events.filter((e) => e.resourceId === resource.id) as event (event.start + event.title)}
						<button
							class="absolute top-2 h-8 bg-primary text-primary-content rounded shadow flex items-center px-2 text-xs font-semibold overflow-hidden whitespace-nowrap truncate cursor-pointer"
							style={getEventSpanStyle(event.start, event.end)}
							title={event.title}
							onclick={() => onEventClick?.(event.impegno)}
						>
							{event.title
								? event.title
								: event.impegno.causaleIndisponibilita
									? `🚧 ${event.impegno.causaleIndisponibilita} 🚧`
									: 'Unknown Event'} ({dayjs
								.duration(dayjs(event.end).diff(dayjs(event.start)))
								.humanize()})
						</button>
					{/each}
				{/if}
			</div>
		{/each}
	</div>
</div>
