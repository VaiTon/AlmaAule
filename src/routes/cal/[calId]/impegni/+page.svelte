<script lang="ts">
	import { getActualImpegniAule } from '$lib/impegni';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { CAL_MAP } from '$lib/cals';
	import { page } from '$app/state';
	import Timeline from '$lib/Timeline.svelte';
	import EventModal from '$lib/EventModal.svelte';
	import dayjs from 'dayjs';
	import { goto as svelteGoto } from '$app/navigation';
	import type { Impegno } from '$lib/api';

	let { data: pageData } = $props();

	const calId = page.params.calId;
	const cal = CAL_MAP.find((c) => c.id === calId);

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
		pageData.impegni
			.map((impegno) =>
				impegno.aule.map((aula) => ({
					id: aula.id,
					title: aula.descrizione
				}))
			)
			.flat()
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

	let modalOpen = $state(false);
	let modalEvent = $state<Impegno | undefined>(undefined);

	function handleEventClick(event: Impegno) {
		modalEvent = event;
		modalOpen = true;
	}
	function handleModalClose() {
		modalOpen = false;
	}
</script>

<div class="mb-4 flex items-center gap-4">
	<button
		class="btn btn-sm btn-ghost"
		on:click={() => goto(`/cal/${cal?.id ?? ''}`)}
		aria-label="Back to calendar"
	>
		← Back
	</button>
	<h1 class="text-2xl font-bold">Resource Timeline for {cal?.name ?? calId}</h1>
</div>

<!-- Custom Timeline: Use Timeline.svelte component -->
<div class="mb-4 flex flex-col sm:flex-row items-center gap-2">
	<label for="day-select" class="font-semibold">Select day:</label>
	<input
		id="day-select"
		type="date"
		class="input input-bordered input-sm"
		value={selectedDay}
		max="2100-12-31"
		on:change={onDayChange}
	/>
</div>

<Timeline {resources} {hours} events={timelineEvents} onEventClick={handleEventClick} />
<EventModal event={modalEvent} open={modalOpen} onClose={() => (modalOpen = false)} />
