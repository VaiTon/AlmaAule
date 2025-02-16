<script lang="ts">
	import moment from 'moment';
	import L from 'leaflet';
	import { onMount } from 'svelte';

	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

	import { getImpegni, type Impegno } from '$lib/api';

	import type { PageData } from './$types';

	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import List from '@event-calendar/list';

	import 'leaflet/dist/leaflet.css';
	import '@event-calendar/core/index.css';

	import dayjs, { Dayjs } from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import 'dayjs/locale/it';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.tz.setDefault('Europe/Rome');
	dayjs.locale('it');

	let { data }: { data: PageData } = $props();
	let { aula } = $derived(data);

	let events: Impegno[] = $state([]);
	let loadingEvents = $state(false);
	let lastInterval: { startDate: Dayjs; endDate: Dayjs } | undefined = undefined;
	let selectedEvent: Impegno | undefined = $state(undefined);

	let eventModal: HTMLDialogElement;

	let nowEvent = $derived.by(() => {
		const now = dayjs();

		return events.find((e) => {
			return now.isAfter(e.dataInizio) && now.isBefore(e.dataFine);
		});
	});

	async function updateImpegni(
		startDate: Dayjs = dayjs().startOf('week'),
		endDate: Dayjs = dayjs().endOf('week')
	) {
		console.debug('updateImpegni', startDate, endDate);

		// Skip if the interval is the same
		if (
			lastInterval != null &&
			startDate.isSame(lastInterval.startDate) &&
			endDate.isSame(lastInterval.endDate)
		) {
			return;
		}

		loadingEvents = true; // Show loading spinner
		lastInterval = { startDate, endDate }; // Save the interval

		const unfilteredEvents = await getImpegni(fetch, page.params.calId, {
			dataInizio: startDate,
			dataFine: endDate,
			idAule: [aula.id]
		});

		const filteredEvents = unfilteredEvents.filter((impegno) =>
			impegno.risorse.some((risorsa) => 'aulaId' in risorsa && risorsa.aulaId === aula.id)
		);

		events = filteredEvents;
		loadingEvents = false;
	}

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

	function impegnoToEvent(impegno: Impegno) {
		let nome = impegno.nome;

		if (impegno.icona === 'attivitaDidattica') {
			nome = '📚 ' + nome;
		} else if (impegno.icona === 'altraAttivita') {
			nome = '🎉 ' + nome;
		}

		const title = document.createElement('p');
		title.innerHTML = impegno.nome;
		title.classList.add('text-sm', 'font-bold', 'mb-1', 'truncate');

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

	$effect(() => {
		updateImpegni();
	});

	$effect(() => {
		if (aula.relazioneEdificio.geo != null) {
			setupMap();
		}
	});
</script>

<svelte:head>
	<title>{aula?.descrizione} - Aule@Unibo</title>
	<meta name="description" content="Dettagli dell'aula {aula?.descrizione}" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={window.location.href} />
	<meta property="og:title" content="{aula?.descrizione} - Aule@Unibo" />
</svelte:head>

<h1 class="text-4xl font-bold my-4">{aula?.descrizione}</h1>

<div class="divider"></div>

<div class="prose max-w-full text-lg">
	<p>
		The classroom <strong>"{aula?.descrizione}"</strong> is located on the
		<strong> {aula?.piano?.descrizione} </strong>
		of the building <strong>"{aula?.relazioneEdificio.descrizione}"</strong> , at
		<strong> {aula?.relazioneEdificio.via}, {aula?.relazioneEdificio.comune}</strong>.
	</p>

	<p>
		At this moment, the classroom is
		{#if nowEvent != null}
			<strong>occupied</strong> by the event <strong>{nowEvent.nome}</strong>
			({dayjs(nowEvent.dataInizio).format('lll')} - {dayjs(nowEvent.dataFine).format('lll')}). 📚
		{:else}
			<strong>free</strong>. 🤩
		{/if}
	</p>
</div>

<div class="divider"></div>

<details class="collapse bg-base-300 text-base-content collapse-plus mt-8">
	<summary class="collapse-title text-2xl">
		<div class="flex">
			<span class="font-bold"> Edificio </span>
			<div class="flex-1"></div>
			<span>
				{aula?.relazioneEdificio.descrizione}
			</span>
		</div>
	</summary>

	<div class="collapse-content">
		<table class="table">
			<tbody>
				<tr>
					<td class="font-bold text-end">Descrizione:</td>
					<td> {aula?.relazioneEdificio.descrizione} </td>
				</tr>

				<tr>
					<td class="font-bold text-end"> Indirizzo</td>
					<td>{aula?.relazioneEdificio.via}, {aula?.relazioneEdificio.comune}</td>
				</tr>

				<tr>
					<td class="font-bold text-end"> Plesso: </td>
					<td>{aula?.relazioneEdificio.plesso}</td>
				</tr>

				<tr>
					<td class="font-bold text-end">Codice:</td>
					<td>{aula?.relazioneEdificio.codice}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Orario apertura:</td>
					<td>{aula?.relazioneEdificio.orarioApertura}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Orario chiusura:</td>
					<td>{aula?.relazioneEdificio.orarioChiusura}</td>
				</tr>
			</tbody>
		</table>
	</div>
</details>

<div>
	<h2 class="text-2xl font-bold mt-6 mb-2">Prossimi impegni</h2>

	{#if loadingEvents}
		<progress class="progress"></progress>
	{:else if events.length === 0}
		<p class="alert alert-warning mb-4">Nessun impegno</p>
	{/if}

	<div>
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
					selectedEvent = events.find((i) => i.id === info.event.id);

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
				events: events.map(impegnoToEvent),
				datesSet: ({ start, end }: { start: Date; end: Date }) => {
					updateImpegni(dayjs(start), dayjs(end));
				}
			}}
		/>
	</div>
</div>
<div>
	<h2 class="text-2xl font-bold mt-6 mb-2">Mappa</h2>

	<div class="flex justify-center gap-x-4">
		<a
			href="https://www.google.com/maps/search/?api=1&query={aula?.relazioneEdificio.geo.lat},{aula
				?.relazioneEdificio.geo.lng}"
			target="_blank"
			rel="noopener"
			class="btn btn-primary"
		>
			Open in Google Maps
		</a>

		<a
			href="http://www.openstreetmap.org/?mlat={aula?.relazioneEdificio.geo.lat}&mlon={aula
				?.relazioneEdificio.geo.lng}&zoom=15"
			target="_blank"
			rel="noopener"
			class="btn btn-primary"
		>
			Open in OpenStreetMap
		</a>
	</div>

	<div class="h-80 w-full mt-4" id="map"></div>
</div>

<details class="collapse bg-base-300 text-base-content collapse-plus mt-8">
	<summary class="collapse-title text-2xl">
		<div class="flex">
			<span class="font-bold"> Additional information </span>
		</div>
	</summary>

	<div class="collapse-content">
		<table class="table">
			<tbody>
				<tr>
					<td class="font-bold text-end">Capienza:</td>
					<td>{aula?.capienza}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Capienza effettiva:</td>
					<td>{aula?.capienzaEffettiva}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">N. postazioni:</td>
					<td>{aula?.numeroPostazioni}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Metri quadri:</td>
					<td>{Math.round(aula?.metriQuadri)} mq</td>
				</tr>
				{#if aula.piano != null}
					<tr>
						<td class="font-bold text-end">Piano:</td>
						<td>{aula?.piano.descrizione} (<code>{aula?.piano.codice}</code>)</td>
					</tr>
				{/if}

				<tr>
					<td class="font-bold text-end">Record creato il:</td>
					<td>{moment(aula.dataCreazione).format('lll')}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Ultima modifica il:</td>
					<td>{moment(aula.dataModifica).format('lll')}</td>
				</tr>
			</tbody>
		</table>
	</div>
</details>

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
			<span>
				{moment
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
