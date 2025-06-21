<script lang="ts">
	import dayjs from 'dayjs';

	import { goto } from '$app/navigation';
	import { CAL_MAP } from '$lib/cals';
	import { page } from '$app/state';
	import Timeline from '$lib/Timeline.svelte';
	import EventModal from '$lib/EventModal.svelte';
	import { goto as svelteGoto } from '$app/navigation';
	import type { Impegno } from '$lib/api';

	let { data: pageData } = $props();
	let { cal } = $derived(pageData);

	const calId = page.params.calId;

	const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8:00 to 20:00

	let urlDay = page.url.searchParams.get('day');
	let selectedDay = urlDay ?? dayjs().format('YYYY-MM-DD');

	function onDayChange(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		const params = new URLSearchParams(page.url.searchParams);
		params.set('day', value);
		svelteGoto(`${page.url.pathname}?${params.toString()}`, { replaceState: true });
	}

	let resources = $derived.by(() =>
		pageData.aule.map((aula) => ({
			id: aula.id,
			title: aula.descrizione
		}))
	);

	let timelineEvents = $derived.by(() =>
		pageData.impegni.flatMap((impegno) =>
			impegno.aule.map((aula) => ({
				resourceId: aula.id,
				start: new Date(impegno.dataInizio),
				end: new Date(impegno.dataFine),
				title: impegno.nome,
				impegno: impegno
			}))
		)
	);

	let eventModal: EventModal | undefined = $state(undefined);
	function handleEventClick(event: Impegno) {
		eventModal?.showModal(event);
	}
</script>

<div class="mb-4 flex items-center gap-4">
	<a class="btn btn-primary" href={`/`} aria-label="Back to calendar"> ← Back </a>
	<h1 class="text-2xl font-bold">Resource Timeline for {cal.name}</h1>
</div>

<div class="mb-4 flex flex-col sm:flex-row items-center gap-2">
	<label for="day-select" class="font-semibold">Select day:</label>
	<input
		id="day-select"
		type="date"
		class="input input-bordered input-sm"
		value={selectedDay}
		max="2100-12-31"
		onchange={onDayChange}
	/>
</div>

<Timeline {resources} {hours} events={timelineEvents} onEventClick={handleEventClick} />
<EventModal bind:this={eventModal} />
