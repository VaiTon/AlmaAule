<script lang="ts">
	import dayjs from 'dayjs';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Impegno } from '$lib/api';

	import EventModal from '$lib/EventModal.svelte';
	import Timeline from '$lib/Timeline.svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let { data: pageData } = $props();
	let { cal } = $derived(pageData);

	const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8:00 to 20:00

	let urlDay = $derived(page.url.searchParams.get('day'));
	let selectedDay = $derived(urlDay ?? dayjs().format('YYYY-MM-DD'));

	function onDayChange(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.set('day', value);
		goto(`${page.url.pathname}?${params.toString()}`, { replaceState: true });
	}

	let resources = $derived.by(() =>
		pageData.aule.map((aula) => ({
			id: aula.id,
			title: aula.descrizione
		}))
	);

	type TimelineEvent = {
		resourceId: string;
		start: Date;
		end: Date;
		title: string;
		impegno: Impegno;
	};

	let loadingEvents = $state(false);
	let timelineEvents: TimelineEvent[] = $state([]);

	$effect(() => {
		loadingEvents = true;
		pageData.impegni.then((i) => {
			timelineEvents = i.flatMap((impegno) =>
				impegno.aule.map((aula) => ({
					resourceId: aula.id,
					start: new Date(impegno.dataInizio),
					end: new Date(impegno.dataFine),
					title: impegno.nome,
					impegno: impegno
				}))
			);
			loadingEvents = false;
		});
	});

	let eventModal: EventModal | undefined = $state(undefined);
	function handleEventClick(event: Impegno) {
		eventModal?.showModal(event);
	}
</script>

<div class="mb-4 flex items-center gap-4">
	<a class="btn btn-primary" href="/" aria-label="Back to calendar"> ← Back </a>
	<h1 class="text-2xl font-bold">Resource Timeline for {cal.name}</h1>
</div>

<div class="mb-4 flex flex-col sm:flex-row items-center gap-2">
	<label for="day-select" class="font-semibold">Select day:</label>
	<div class="flex items-center gap-2">
		<button
			type="button"
			class="btn btn-sm btn-outline"
			aria-label="Previous day"
			onclick={() => {
				const prev = dayjs(selectedDay).subtract(1, 'day').format('YYYY-MM-DD');
				const params = new SvelteURLSearchParams(page.url.searchParams);
				params.set('day', prev);
				goto(`${page.url.pathname}?${params.toString()}`, { replaceState: true });
			}}
		>
			←
		</button>
		<input
			id="day-select"
			type="date"
			class="input input-bordered input-sm"
			value={selectedDay}
			max="2100-12-31"
			onchange={onDayChange}
		/>
		<button
			type="button"
			class="btn btn-sm btn-outline"
			aria-label="Next day"
			onclick={() => {
				const next = dayjs(selectedDay).add(1, 'day').format('YYYY-MM-DD');
				const params = new SvelteURLSearchParams(page.url.searchParams);
				params.set('day', next);
				goto(`${page.url.pathname}?${params.toString()}`, { replaceState: true });
			}}
		>
			→
		</button>
	</div>

	{#if loadingEvents}
		<span class="loading loading-spinner loading-sm"></span>
	{:else}
		<span class="text-sm text-gray-500">
			{timelineEvents.length} events loaded
		</span>
	{/if}
</div>

<Timeline {resources} {hours} events={timelineEvents} onEventClick={handleEventClick} />
<EventModal bind:this={eventModal} />
