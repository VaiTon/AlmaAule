<script lang="ts">
	import dayjs from 'dayjs';

	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { Impegno } from '$lib/api';

	import { onMount } from 'svelte';

	let { data: pageData } = $props();
	let { cal, impegni: impegniPromise } = $derived(pageData);

	// Representation of a resource (classroom)
	type Resource = { id: string; title: string };

	// Representation of a timeline event (booking)
	type TimelineEvent = {
		resId: string; // Resource ID
		startTime: Date;
		endTime: Date;
		startTimeFormatted: string;
		endTimeFormatted: string;
		title: string;
		impegno: Impegno;
	};

	let showVacantOnly = $state(false);

	let resources: Resource[] = $derived.by(() => {
		const mapped = pageData.aule.map((aula) => ({ id: aula.id, title: aula.descrizione }));
		return mapped.sort((a, b) => a.title.localeCompare(b.title));
	});

	let timelineEvents: Promise<Map<string, TimelineEvent[]>> = $derived.by(() => {
		const newTimelineEvent = (resId: string, impegno: Impegno): TimelineEvent => {
			const startTime = new Date(impegno.dataInizio);
			const endTime = new Date(impegno.dataFine);
			return {
				resId: resId,
				title: impegno.nome,
				impegno: impegno,
				startTime,
				endTime,
				startTimeFormatted: dayjs(startTime).format('HH:mm'),
				endTimeFormatted: dayjs(endTime).format('HH:mm')
			};
		};

		return (async () => {
			const impegni = await impegniPromise;
			const allEvents = impegni.flatMap((i) => i.aule.map((aula) => newTimelineEvent(aula.id, i)));

			// Group events by resource ID for O(1) lookups during rendering
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const eventsMap = new Map<string, TimelineEvent[]>();
			for (const event of allEvents) {
				const resEvents = eventsMap.get(event.resId) || [];
				resEvents.push(event);
				eventsMap.set(event.resId, resEvents);
			}

			// Pre-sort events chronologically to avoid sorting on every render loop
			for (const resEvents of eventsMap.values()) {
				resEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
			}

			return eventsMap;
		})();
	});

	let currentTime = $state(new Date());

	// Update current time every minute
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 60000); // Update every minute

		return () => clearInterval(interval);
	});

	// Get current activity for a resource
	const getCurrentActivity = (
		eventsMap: Map<string, TimelineEvent[]>,
		resId: string,
		time: Date
	) => {
		const events = eventsMap.get(resId);
		if (!events) return undefined;

		// The list is sorted, so we can just find the one that spans the current time
		return events.find((e) => e.startTime <= time && e.endTime >= time);
	};

	// Get next activity for a resource
	const getNextActivity = (
		eventsMap: Map<string, TimelineEvent[]>,
		resourceId: string,
		time: Date
	) => {
		const events = eventsMap.get(resourceId);
		if (!events) return undefined;

		// Since events are pre-sorted chronologically, the first event in the future is the next activity
		return events.find((e) => e.startTime > time);
	};
</script>

{#snippet roomCard(eventsMap: Map<string, TimelineEvent[]>, resource: Resource)}
	{@const currentActivity = getCurrentActivity(eventsMap, resource.id, currentTime)}
	{@const nextActivity = getNextActivity(eventsMap, resource.id, currentTime)}
	<a
		href={resolve('/cal/[calId]/[aulaId]', {
			calId: page.params.calId!,
			aulaId: resource.id
		})}
		class={[
			'card border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
			{
				'border-error bg-error/10': currentActivity,
				'border-success bg-success/10': !currentActivity
			}
		]}
	>
		<div class="card-body p-4">
			<h2 class="card-title text-base font-bold truncate" title={resource.title}>
				{resource.title}
			</h2>

			{#if currentActivity}
				<div class="mt-2">
					<div class="badge badge-sm mb-2">OCCUPIED</div>
					<p class="text-sm font-semibold truncate" title={currentActivity.title}>
						{currentActivity.title ||
							currentActivity.impegno.causaleIndisponibilita ||
							'Activity in progress'}
					</p>
					<p class="text-xs opacity-90 mt-1">
						Until {currentActivity.endTimeFormatted}
					</p>
				</div>
			{:else}
				<div class="mt-2">
					<div class="badge badge-sm mb-2">VACANT</div>
					{#if nextActivity}
						<p class="text-xs opacity-90 mt-1">
							Next: {nextActivity.startTimeFormatted}
						</p>
						<p class="text-xs opacity-75 truncate" title={nextActivity.title}>
							{nextActivity.title}
						</p>
					{:else}
						<p class="text-xs opacity-90 mt-1">Vacant for the rest of the day</p>
					{/if}
				</div>
			{/if}
		</div>
	</a>
{/snippet}

<div class="mb-4 flex items-center gap-4">
	<a class="btn btn-primary" href={resolve('/')} aria-label="Back to home page"> ← Back </a>
	<h1 class="text-2xl font-bold">Availability for '{cal.name}' rooms</h1>
</div>
<div class="mb-4 flex items-center gap-4">
	<input
		type="checkbox"
		id="showVacantOnly"
		class="toggle"
		bind:checked={showVacantOnly}
		aria-label="Show only vacant rooms"
	/>
	<label for="showVacantOnly" class="text-sm">Show only vacant rooms</label>
</div>

{#await timelineEvents}
	<div class="flex justify-center items-center h-32">
		<div class="loading loading-spinner text-primary"></div>
	</div>
{:then events}
	{@const filteredResources = resources.filter(
		(r) => !showVacantOnly || !getCurrentActivity(events, r.id, currentTime)
	)}
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredResources as resource (resource.id)}
			{@render roomCard(events, resource)}
		{/each}
	</div>
{/await}
