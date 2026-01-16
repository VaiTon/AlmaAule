<script lang="ts">
	import L from 'leaflet';

	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

	import { getImpegni, type Impegno } from '$lib/api';

	import type { PageData } from './$types';

	import 'leaflet/dist/leaflet.css';

	import dayjs, { Dayjs } from 'dayjs';
	import 'dayjs/locale/it';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	dayjs.extend(localizedFormat);

	import { page } from '$app/state';
	import calendarIcon from '$lib/icons/Calendar.svg?raw';
	import AulaWeekTimeline from '$lib/AulaWeekTimeline.svelte';
	import EventModal from '$lib/EventModal.svelte';
	import { tick } from 'svelte';

	let { data }: { data: PageData } = $props();
	let { aula } = $derived(data);

	let events: Impegno[] = $state([]);
	let loadingEvents = $state(false);

	let eventModal: EventModal | undefined = $state(undefined);

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
		events = []; // Clear current events
		await tick(); // Wait for DOM update

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

	$effect(() => {
		updateImpegni();
	});

	$effect(() => {
		if (aula.relazioneEdificio.geo != null) {
			setupMap();
		}
	});

	function getOSMLink({ lat, lng, zoom = 17 }: { lat: number; lng: number; zoom?: number }) {
		const params = new URLSearchParams({
			mlat: lat.toString(),
			mlon: lng.toString(),
			zoom: zoom.toString()
		});
		return `https://www.openstreetmap.org/?${params.toString()}`;
	}

	function getGoogleMapsLink({ lat, lng }: { lat: number; lng: number }) {
		const params = new URLSearchParams({
			api: '1',
			query: `${lat},${lng}`
		});
		return `https://www.google.com/maps/search/?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>{aula?.descrizione} - AlmaAule</title>
	<meta name="description" content="Dettagli dell'aula {aula?.descrizione}" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={window.location.href} />
	<meta property="og:title" content="{aula?.descrizione} - AlmaAule" />
</svelte:head>

<div class="px-4 mt-4">
	<h1 class="text-3xl sm:text-4xl font-bold mb-4">{aula?.descrizione}</h1>

	<div
		class={[
			'flex items-center gap-2 my-4 border  rounded-lg px-4 py-2',
			nowEvent != null ? 'border-error' : 'border-success'
		]}
		role="alert"
	>
		{#if nowEvent != null}
			<span class="font-bold text-error">Occupied</span>
			<span>
				<strong>{nowEvent.nome}</strong>
				({dayjs(nowEvent.dataInizio).format('LT')} - {dayjs(nowEvent.dataFine).format('LT')})
			</span>
		{:else}
			<span class="font-bold text-success">Vacant</span>
			<span>The classroom is currently free.</span>
		{/if}
	</div>

	<details class="collapse bg-base-300 text-base-content collapse-arrow mb-4">
		<summary class="collapse-title card-title text-xl font-bold">
			<span class="ml-2 font-normal">{aula?.relazioneEdificio.descrizione}</span>
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
					{#if aula.note || aula.altreInformazioni}
						<tr>
							<td class="font-bold text-end">Note:</td>
							<td>{aula.note || aula.altreInformazioni}</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</details>

	{#if aula.note || aula.altreInformazioni}
		<div class="alert alert-info my-4">
			<div>
				<strong>Note:</strong>
				{aula.note || aula.altreInformazioni}
			</div>
		</div>
	{/if}
</div>

<div class="divider"></div>

<div class="p-4 mb-6">
	<h2 class="card-title text-2xl font-bold mb-2 flex items-center gap-2">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html calendarIcon}
		<span>Weekly Events</span>
	</h2>

	<AulaWeekTimeline
		loading={loadingEvents}
		{events}
		onEventClick={(impegno) => {
			eventModal?.showModal(impegno);
		}}
		onCalendarChange={(start, end) => {
			updateImpegni(start, end);
		}}
	/>
</div>

<div class="p-4 mb-6">
	<h2 class="card-title text-2xl font-bold mb-2">Map</h2>
	<div class="flex flex-col sm:flex-row justify-center gap-2 mb-4">
		<a
			href={getGoogleMapsLink({
				lat: aula?.relazioneEdificio.geo.lat,
				lng: aula?.relazioneEdificio.geo.lng
			})}
			target="_blank"
			rel="noopener"
			class="btn btn-primary btn-md"
		>
			Open in Google Maps
		</a>
		<a
			href={getOSMLink({
				lat: aula?.relazioneEdificio.geo.lat,
				lng: aula?.relazioneEdificio.geo.lng
			})}
			target="_blank"
			rel="noopener"
			class="btn btn-primary btn-md"
		>
			Open in OpenStreetMap
		</a>
	</div>
	<div class="w-full rounded-box overflow-hidden h-64 sm:h-80" id="map"></div>
</div>

<EventModal bind:this={eventModal} />
