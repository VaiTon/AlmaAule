<script lang="ts">
	import dayjs from 'dayjs';
	import type { Impegno } from './api';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	type Props = {
		calId: string;
		resources: { id: string; title: string }[];
		hours?: number[];
		events?: { resourceId: string; start: Date; end: Date; title: string; impegno: Impegno }[];
		onEventClick?: (event: Impegno) => void;
	};

	let {
		calId,
		events,
		resources,
		onEventClick,
		hours = Array.from({ length: 13 }, (_, i) => 8 + i)
	}: Props = $props();

	const labelWidth = '15rem'; // Width for resource labels
	let currentTime = $state(new Date());

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

	// Calculate the position of the current time line
	function getCurrentTimePosition() {
		const now = currentTime;
		const currentHour = now.getHours() + now.getMinutes() / 60;
		const firstHour = hours[0];
		const lastHour = hours[hours.length - 1] + 1;

		// Only show if within the visible hours range
		if (currentHour < firstHour || currentHour > lastHour) {
			return null;
		}

		const position = currentHour - firstHour;
		// Match the exact formula used for events
		return `calc(${labelWidth} + ${position} * (100% - 12rem) / ${hours.length})`;
	}

	let currentTimePosition = $derived(getCurrentTimePosition());

	// Update current time every minute
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 60000); // Update every minute

		return () => clearInterval(interval);
	});
</script>

<!-- Desktop Timeline View -->
<div class="hidden md:block overflow-x-auto">
	<div class="min-w-175 relative">
		<!-- Current time line -->
		{#if currentTimePosition}
			<div
				class="absolute top-0 bottom-0 w-0.5 bg-red-600 pointer-events-none"
				style="left: {currentTimePosition}; z-index: 20;"
			></div>
		{/if}
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
					href={resolve('/cal/[calId]/[aulaId]', { calId: calId, aulaId: resource.id })}
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

<!-- Mobile List View -->
<div class="md:hidden space-y-4">
	{#each sortedResources as resource (resource.id)}
		{@const resourceEvents = events?.filter((e) => e.resourceId === resource.id) || []}
		{#if resourceEvents.length > 0 || true}
			<div class="bg-base-100 rounded-lg shadow border border-base-300 overflow-hidden">
				<a
					class="block bg-base-200 px-4 py-3 font-semibold text-sm border-b border-base-300 hover:bg-base-300 transition"
					href={resolve('/cal/[calId]/[aulaId]', { calId: calId, aulaId: resource.id })}
				>
					{resource.title}
				</a>
				{#if resourceEvents.length > 0}
					<div class="divide-y divide-base-300">
						{#each resourceEvents.sort((a, b) => a.start.getTime() - b.start.getTime()) as event (event.start + event.title)}
							{@const isNow = currentTime >= event.start && currentTime <= event.end}
							<button
								class="w-full text-left px-4 py-3 hover:bg-base-200 transition"
								class:bg-red-50={isNow}
								class:border-l-4={isNow}
								class:border-red-600={isNow}
								onclick={() => onEventClick?.(event.impegno)}
							>
								<div class="flex items-start justify-between gap-2">
									<div class="flex-1 min-w-0">
										<div class="font-medium text-sm truncate">
											{event.title
												? event.title
												: event.impegno.causaleIndisponibilita
													? `🚧 ${event.impegno.causaleIndisponibilita}`
													: 'Unknown Event'}
										</div>
										<div class="text-xs text-base-content/70 mt-1">
											{dayjs(event.start).format('HH:mm')} - {dayjs(event.end).format('HH:mm')}
											<span class="text-base-content/50">
												({dayjs.duration(dayjs(event.end).diff(dayjs(event.start))).humanize()})
											</span>
										</div>
									</div>
									{#if isNow}
										<span class="badge badge-error badge-sm shrink-0">In corso</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="px-4 py-6 text-center text-sm text-base-content/50">
						Nessun evento
					</div>
				{/if}
			</div>
		{/if}
	{/each}
</div>
