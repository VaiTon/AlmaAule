<script lang="ts">
	import type { Impegno } from './api';

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

	// Helper to get the hour offset (0 = first hour)
	function getHourOffset(date: Date) {
		return date.getHours() - hours[0];
	}
	// Helper to get event bar width in columns
	function getEventSpan(start: Date, end: Date) {
		const startHour = start.getHours() + start.getMinutes() / 60;
		const endHour = end.getHours() + end.getMinutes() / 60;
		const firstHour = hours[0];
		const lastHour = hours[hours.length - 1] + 1;
		const left = Math.max(0, startHour - firstHour);
		const right = Math.min(lastHour, endHour) - firstHour;
		return {
			left,
			width: Math.max(0.5, right - left)
		};
	}
</script>

<div class="overflow-x-auto">
	<div class="min-w-[700px]">
		<!-- Time axis -->
		<div class="flex border-b border-base-300 bg-base-200 sticky top-0 z-10">
			<div class="w-48"></div>
			{#each hours as hour}
				<div class="flex-1 text-center py-2 text-xs font-semibold border-l border-base-300">
					{hour}:00
				</div>
			{/each}
		</div>
		<!-- Resource rows -->
		{#each resources as resource}
			<div
				class="flex border-b border-base-300 items-center bg-base-100 hover:bg-base-200 transition relative"
				style="height:3rem;"
			>
				<div class="w-48 px-2 py-2 font-medium truncate z-10">{resource.title}</div>
				{#each hours as _}
					<div class="flex-1 h-12 border-l border-base-300"></div>
				{/each}
				<!-- Render events for this resource -->
				{#if events}
					{#each events.filter((e) => e.resourceId === resource.id) as event}
						{@const { left, width } = getEventSpan(event.start, event.end)}
						<div
							class="absolute top-2 h-8 bg-primary text-primary-content rounded shadow flex items-center px-2 text-xs font-semibold overflow-hidden whitespace-nowrap truncate cursor-pointer"
							style="
								left: calc(12rem + {left} * (100% - 12rem) / {hours.length});
								width: calc({width} * (100% - 12rem) / {hours.length});
								min-width: 2.5rem;
								z-index: 5;
							"
							title={event.title}
							on:click={() => onEventClick?.(event.impegno)}
						>
							{event.title}
						</div>
					{/each}
				{/if}
			</div>
		{/each}
	</div>
</div>
