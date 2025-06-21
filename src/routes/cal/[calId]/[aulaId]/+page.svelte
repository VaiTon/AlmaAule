<script lang="ts">
	import L from 'leaflet';
	import { onMount } from 'svelte';

	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

	import { getImpegni, type Impegno } from '$lib/api';

	import type { PageData } from './$types';

	import 'leaflet/dist/leaflet.css';

	import dayjs, { Dayjs } from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import 'dayjs/locale/it';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import calendarIcon from '$lib/icons/Calendar.svg?raw';
	import AulaWeekTimeline from '$lib/AulaWeekTimeline.svelte';
	import EventModal from '$lib/EventModal.svelte';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.tz.setDefault('Europe/Rome');
	dayjs.locale('it');

	let { data }: { data: PageData } = $props();
	let { aula } = $derived(data);

	let events: Impegno[] = $state([]);
	let loadingEvents = $state(false);
	let selectedEvent: Impegno | undefined = $state(undefined);

	let eventModal: HTMLDialogElement;

	let nowEvent = $derived.by(() => {
		const now = dayjs();

		return events.find((e) => {
			return now.isAfter(e.dataInizio) && now.isBefore(e.dataFine);
		});
	});

	let lastInterval: { startDate: Dayjs; endDate: Dayjs } | undefined = undefined;
	async function updateImpegni(
		startDate: Dayjs = dayjs().startOf('week'),
		endDate: Dayjs = dayjs().endOf('week')
	) {
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
			start: dayjs(impegno.dataInizio).toDate(),
			end: dayjs(impegno.dataFine).toDate()
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
	<title>{aula?.descrizione} - AlmaAule</title>
	<meta name="description" content="Dettagli dell'aula {aula?.descrizione}" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={window.location.href} />
	<meta property="og:title" content="{aula?.descrizione} - AlmaAule" />
</svelte:head>

<div class="card bg-base-100 shadow-xl mb-6">
	<div class="card-body">
		<h1 class="card-title text-3xl sm:text-4xl font-bold">{aula?.descrizione}</h1>
		<p>
			The classroom <strong>"{aula?.descrizione}"</strong> is located on the
			<strong>{aula?.piano?.descrizione}</strong>
			of the building <strong>"{aula?.relazioneEdificio.descrizione}"</strong>, at
			<strong>{aula?.relazioneEdificio.via}, {aula?.relazioneEdificio.comune}</strong>.
		</p>
		{#if nowEvent != null}
			<div
				class="flex items-center gap-2 mt-4 border border-error rounded-lg px-4 py-2"
				role="alert"
			>
				<span class="font-bold text-error">Occupied</span>
				<span>
					by <strong>{nowEvent.nome}</strong>
					({dayjs(nowEvent.dataInizio).format('lll')} - {dayjs(nowEvent.dataFine).format('lll')})
				</span>
			</div>
		{:else}
			<div
				class="flex items-center gap-2 mt-4 border border-success rounded-lg px-4 py-2"
				role="alert"
			>
				<span class="font-bold text-success">Free</span>
			</div>
		{/if}
	</div>
</div>

<details class="collapse bg-base-300 text-base-content collapse-arrow mb-4">
	<summary class="collapse-title card-title text-xl font-bold">
		Building: <span class="ml-2 font-normal">{aula?.relazioneEdificio.descrizione}</span>
	</summary>

	<div class="collapse-content overflow-x-auto">
		<table class="table table-zebra rounded-box table-sm">
			<tbody>
				<tr>
					<td class="font-bold text-end">Descrizione:</td>
					<td>{aula?.relazioneEdificio.descrizione}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Indirizzo:</td>
					<td>{aula?.relazioneEdificio.via}, {aula?.relazioneEdificio.comune}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Plesso:</td>
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

<details class="collapse bg-base-300 text-base-content collapse-plus mb-4">
	<summary class="collapse-title card-title text-xl font-bold"> Classroom details </summary>

	<div class="collapse-content overflow-x-auto">
		<table class="table table-zebra rounded-box table-sm">
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
					<td>{dayjs(aula.dataCreazione).format('lll')}</td>
				</tr>
				<tr>
					<td class="font-bold text-end">Ultima modifica il:</td>
					<td>{dayjs(aula.dataModifica).format('lll')}</td>
				</tr>
			</tbody>
		</table>
	</div>
</details>

<div class="divider"></div>

<div class="card bg-base-100 shadow-xl mb-6">
	<div class="card-body">
		<h2 class="card-title text-2xl font-bold mb-2 flex items-center gap-2">
			{@html calendarIcon}
			<span>Weekly Events</span>
		</h2>
		<AulaWeekTimeline
			{aula}
			{events}
			onEventClick={(impegno) => {
				selectedEvent = impegno;
			}}
			onCalendarChange={(start, end) => {
				updateImpegni(start, end);
			}}
		/>
	</div>
</div>
<div class="card bg-base-100 shadow-xl mb-6">
	<div class="card-body">
		<h2 class="card-title text-2xl font-bold mb-2">Map</h2>
		<div class="flex flex-col sm:flex-row justify-center gap-2 mb-4">
			<a
				href="https://www.google.com/maps/search/?api=1&query={aula?.relazioneEdificio.geo
					.lat},{aula?.relazioneEdificio.geo.lng}"
				target="_blank"
				rel="noopener"
				class="btn btn-primary btn-md"
			>
				Open in Google Maps
			</a>
			<a
				href="http://www.openstreetmap.org/?mlat={aula?.relazioneEdificio.geo.lat}&mlon={aula
					?.relazioneEdificio.geo.lng}&zoom=15"
				target="_blank"
				rel="noopener"
				class="btn btn-primary btn-md"
			>
				Open in OpenStreetMap
			</a>
		</div>
		<div class="w-full rounded-box overflow-hidden h-64 sm:h-80" id="map"></div>
	</div>
</div>

<EventModal
	event={selectedEvent}
	open={selectedEvent != null}
	onClose={() => (selectedEvent = undefined)}
/>
