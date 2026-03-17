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
		title: string;
		impegno: Impegno;
	};

	let resources: Resource[] = $derived.by(() =>
		pageData.aule.map((aula) => ({ id: aula.id, title: aula.descrizione }))
	);

	let timelineEventsMap: Promise<Map<string, TimelineEvent[]>> = $derived.by(() => {
		const newTimelineEvent = (resId: string, impegno: Impegno): TimelineEvent => ({
			resId: resId,
			title: impegno.nome,
			impegno: impegno,
			startTime: new Date(impegno.dataInizio),
			endTime: new Date(impegno.dataFine)
		});

		return (async () => {
			const impegni = await impegniPromise;
			const events = impegni.flatMap((i) => i.aule.map((aula) => newTimelineEvent(aula.id, i)));

			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const map = new Map<string, TimelineEvent[]>();
			for (const e of events) {
				let arr = map.get(e.resId);
				if (!arr) {
					arr = [];
					map.set(e.resId, arr);
				}
				arr.push(e);
			}

			for (const arr of map.values()) {
				arr.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
			}

			return map;
		})();
	});

	let currentTime = $state(new Date());

	let sortedResources = $derived.by(() => {
		return resources.toSorted((a, b) => a.title.localeCompare(b.title));
	});

	// Update current time every minute
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 60000); // Update every minute

		return () => clearInterval(interval);
	});

	// Get current activity for a resource
	const getCurrentActivity = (resourceEvents: TimelineEvent[], time: Date) => {
		const currentEvent = resourceEvents.find((e) => e.startTime <= time && e.endTime >= time);
		return currentEvent;
	};

	// Get next activity for a resource
	const getNextActivity = (resourceEvents: TimelineEvent[], time: Date) => {
		const futureEvent = resourceEvents.find((e) => e.startTime > time);
		return futureEvent;
	};
</script>

{#snippet roomCard(eventsMap: Map<string, TimelineEvent[]>, resource: Resource)}
	{@const resourceEvents = eventsMap.get(resource.id) || []}
	{@const currentActivity = getCurrentActivity(resourceEvents, currentTime)}
	{@const nextActivity = getNextActivity(resourceEvents, currentTime)}
	<a
		href={resolve('/cal/[calId]/[aulaId]', {
			calId: page.params.calId as string,
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
						Until {dayjs(currentActivity.endTime).format('HH:mm')}
					</p>
				</div>
			{:else}
				<div class="mt-2">
					<div class="badge badge-sm mb-2">VACANT</div>
					{#if nextActivity}
						<p class="text-xs opacity-90 mt-1">
							Next: {dayjs(nextActivity.startTime).format('HH:mm')}
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

{#await timelineEventsMap}
	<div class="flex justify-center items-center h-32">
		<div class="loading loading-spinner text-primary"></div>
	</div>
{:then eventsMap}
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each sortedResources as resource (resource.id)}
			{@render roomCard(eventsMap, resource)}
		{/each}
	</div>
{/await}
