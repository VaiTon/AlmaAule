<script lang="ts">
	import moment from 'moment';
	import L from 'leaflet';
	import { onMount } from 'svelte';

	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

	import Debug from '$lib/Debug.svelte';
	import type { Impegno } from '$lib/api';

	import type { PageData } from './$types';

	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import List from '@event-calendar/list';

	import 'leaflet/dist/leaflet.css';
	import '@event-calendar/core/index.css';

	export let data: PageData;
	$: aula = data.aula;

	let eventModal: HTMLDialogElement;

	let selectedEvent: Impegno | undefined = null;

	function setupMap() {
		const map = L.map('map', {
			attributionControl: false,
			scrollWheelZoom: false
		});

		map.setView([aula.relazioneEdificio.geo.lat, aula.relazioneEdificio.geo.lng], 14);
		L.control.attribution({ prefix: false }).addTo(map);

		const osmCopyright =
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: osmCopyright
		}).addTo(map);

		const iconDefault = L.icon({
			iconRetinaUrl: markerIcon2x,
			iconUrl: markerIcon,
			shadowUrl,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize: [41, 41]
		});

		L.marker([aula.relazioneEdificio.geo.lat, aula.relazioneEdificio.geo.lng], {
			icon: iconDefault
		})
			.addTo(map)
			.bindPopup(aula.relazioneEdificio.descrizione)
			.openPopup();
	}

	onMount(() => {
		if (aula.relazioneEdificio.geo != null) {
			setupMap();
		}
	});

	function impegnoToEvent(impegno: Impegno) {
		const title = document.createElement('div');
		title.innerHTML = impegno.nome;
		if (impegno.icona === 'attivitaDidattica') {
			title.innerHTML = '📚 ' + title.innerHTML;
		} else if (impegno.icona === 'altraAttivita') {
			title.innerHTML = '🎉 ' + title.innerHTML;
		}

		title.classList.add('text-sm', 'font-bold', 'mb-1');

		const nodes = [title];

		const didattica = impegno?.evento?.dettagliDidattici?.[0];

		if (didattica?.corso != null) {
			const course = document.createElement('div');
			course.innerHTML = '🎓 ' + didattica.corso?.descrizione;
			course.classList.add('text-xs', 'mb-1');
			nodes.push(course);
		}

		if (impegno.docenti.length > 0) {
			const teacher = document.createElement('div');
			teacher.innerHTML = '🧑‍🏫 ' + impegno.docenti.map((d) => d.nome + ' ' + d.cognome).join(', ');
			teacher.classList.add('text-xs');
			nodes.push(teacher);
		}

		return {
			id: impegno.id,
			title: { domNodes: nodes },
			start: moment(impegno.dataInizio).toDate(),
			end: moment(impegno.dataFine).toDate()
		};
	}
</script>

<h1 class="text-4xl font-bold my-4">{aula?.descrizione}</h1>

<div class="my-4 justify-between gap-x-8 text-end">
	<div>
		<span class="font-bold text-end">Record creato il:</span>
		<span>{moment(aula.dataCreazione).format('lll')}</span>
	</div>
	<div>
		<span class="font-bold text-end">Ultima modifica il:</span>
		<span>{moment(aula.dataModifica).format('lll')}</span>
	</div>
</div>

<p class="grid gap-x-2 grid-cols-[max-content,1fr,max-content,1fr]">
	<span class="font-bold text-end">Capienza:</span>
	<span>{aula?.capienza}</span>

	<span class="font-bold text-end">Capienza effettiva:</span>
	<span>{aula?.capienzaEffettiva}</span>

	<span class="font-bold text-end">N. postazioni:</span>
	<span>{aula?.numeroPostazioni}</span>

	<span class="font-bold text-end">Metri quadri:</span>
	<span>{Math.round(aula?.metriQuadri)} mq</span>

	{#if aula.piano != null}
		<span class="font-bold text-end">Piano:</span>
		<span>{aula?.piano.descrizione} (<code>{aula?.piano.codice}</code>)</span>
	{/if}
</p>

<Debug data={aula} />

<div>
	<h2 class="text-2xl font-bold mt-6 mb-2">Edificio</h2>

	<div class="grid gap-x-2 grid-cols-[max-content,1fr,max-content,1fr]">
		<span class="font-bold text-end">Descrizione:</span>
		<span>{aula?.relazioneEdificio.descrizione}</span>

		<span class="font-bold text-end">Indirizzo:</span>
		<span>{aula?.relazioneEdificio.via}, {aula?.relazioneEdificio.comune}</span>

		<span class="font-bold text-end"> Plesso:</span>
		<span>{aula?.relazioneEdificio.plesso}</span>

		<span class="font-bold text-end">Codice:</span>
		<span>{aula?.relazioneEdificio.codice}</span>

		<span class="font-bold text-end">Orario apertura:</span>
		<span>{aula?.relazioneEdificio.orarioApertura}</span>

		<span class="font-bold text-end">Orario chiusura:</span>
		<span>{aula?.relazioneEdificio.orarioChiusura}</span>

		<Debug data={aula.relazioneEdificio} />
	</div>
</div>
<div>
	<h2 class="text-2xl font-bold mt-6 mb-2">Prossimi impegni</h2>

	{#await data.impegni}
		<progress class="progress"></progress>
	{:then impegni}
		{#if impegni.length === 0}
			<p class="alert mb-4">Nessun impegno</p>
		{:else}
			<Calendar
				plugins={[TimeGrid, List]}
				options={{
					resources: [],
					firstDay: 1,
					nowIndicator: true,
					flexibleSlotTimeLimits: true,
					slotMinTime: '08:00',
					slotMaxTime: '20:00',

					eventClick: (info: { event: { id: string } }) => {
						selectedEvent = impegni.find((i) => i.id === info.event.id);
						eventModal.showModal();
					},

					headerToolbar: {
						start: 'title',
						center: '',
						end: 'timeGridWeek,listWeek today prev,next'
					},
					view: 'timeGridWeek',
					views: {
						timeGridWeek: { pointer: true }
					},
					events: impegni.map(impegnoToEvent)
				}}
			/>

			<div class="alert alert-warning my-8">
				<p class="font-bold">Warning:</p>
				<p>To save bandwith, we only show the next month of events.</p>
			</div>
		{/if}
	{/await}
</div>
<div>
	<h2 class="text-2xl font-bold mt-6 mb-2">Mappa</h2>
	<div class="h-80 w-full mt-4" id="map"></div>
</div>

<dialog class="modal" bind:this={eventModal}>
	<div class="modal-box">
		<div class="flex gap-4 mb-4">
			<h2 class="text-xl font-bold grow">{selectedEvent?.nome}</h2>
			<button class="btn" on:click={() => eventModal.close()}>Chiudi</button>
		</div>

		<p class="grid gap-x-2 grid-cols-[max-content,1fr]">
			<span class="font-bold text-end">Corso:</span>
			<span>{selectedEvent?.evento?.dettagliDidattici?.[0]?.corso?.descrizione}</span>

			<span class="font-bold text-end">Data inizio:</span>
			<span>{moment(selectedEvent?.dataInizio).format('lll')}</span>

			<span class="font-bold text-end">Data fine:</span>
			<span>{moment(selectedEvent?.dataFine).format('lll')}</span>

			<span class="font-bold text-end">Durata:</span>
			<span
				>{moment
					.duration(moment(selectedEvent?.dataFine).diff(moment(selectedEvent?.dataInizio)))
					.humanize()}</span
			>

			<span class="font-bold text-end">Docenti:</span>
			<span>{selectedEvent?.docenti.map((d) => d.nome + ' ' + d.cognome).join(', ')}</span>
		</p>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<Debug {data} />
