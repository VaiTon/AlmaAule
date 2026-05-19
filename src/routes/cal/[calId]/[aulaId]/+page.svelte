<script lang="ts">
	import { type Impegno } from '$lib/api/universityplanner';
	import { createUPClient } from '$lib/api';

	import type { PageData } from './$types';

	import dayjs, { Dayjs } from 'dayjs';
	import 'dayjs/locale/it';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	dayjs.extend(localizedFormat);

	import { page } from '$app/state';
	import calendarIcon from '$lib/icons/Calendar.svg?raw';
	import AulaWeekTimeline from '$lib/AulaWeekTimeline.svelte';
	import EventModal from '$lib/EventModal.svelte';
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	import MdiShareVariant from '@iconify-svelte/mdi/share-variant';
	import MdiStar from '@iconify-svelte/mdi/star';
	import MdiStarOutline from '@iconify-svelte/mdi/star-outline';
	import MdiWifi from '@iconify-svelte/mdi/wifi';
	import MdiComputer from '@iconify-svelte/mdi/computer';
	import MdiProjector from '@iconify-svelte/mdi/projector';
	import MdiMicrophone from '@iconify-svelte/mdi/microphone';
	import MdiPresentation from '@iconify-svelte/mdi/presentation';
	import MdiAirConditioner from '@iconify-svelte/mdi/air-conditioner';
	import MdiPowerSocketEu from '@iconify-svelte/mdi/power-socket-eu';
	import MdiWheelchairAccessibility from '@iconify-svelte/mdi/wheelchair-accessibility';
	import MdiFlask from '@iconify-svelte/mdi/flask';
	import MdiBookOpenVariant from '@iconify-svelte/mdi/book-open-variant';
	import MdiInformationOutline from '@iconify-svelte/mdi/information-outline';
	import { favorites } from '$lib/states/favorites.svelte';

	let { data }: { data: PageData } = $props();
	let { aula } = $derived(data);

	const iconMap: Record<string, typeof MdiInformationOutline> = {
		wifi: MdiWifi,
		pc: MdiComputer,
		computer: MdiComputer,
		proiettore: MdiProjector,
		microfono: MdiMicrophone,
		lavagna: MdiPresentation,
		lim: MdiPresentation,
		climatizzazione: MdiAirConditioner,
		aria_condizionata: MdiAirConditioner,
		presa: MdiPowerSocketEu,
		accessibile: MdiWheelchairAccessibility,
		laboratorio: MdiFlask,
		studio: MdiBookOpenVariant
	};

	let events: Impegno[] = $state([]);
	let loadingEvents = $state(false);

	let eventModal: EventModal | undefined = $state(undefined);

	let nowEvent = $derived.by(() => {
		const now = dayjs();

		return events.find((e) => {
			return now.isAfter(e.dataInizio) && now.isBefore(e.dataFine);
		});
	});

	let nextEvent = $derived.by(() => {
		const now = dayjs();
		return events
			.filter((e) => dayjs(e.dataInizio).isAfter(now))
			.sort((a, b) => dayjs(a.dataInizio).diff(dayjs(b.dataInizio)))[0];
	});

	let shareCopied = $state(false);
	async function shareClassroom() {
		const shareData = {
			title: `${aula.descrizione} - AlmaAule`,
			text: `Controlla lo stato dell'aula ${aula.descrizione} su AlmaAule`,
			url: window.location.href
		};

		if (navigator.share && navigator.canShare?.(shareData)) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				if ((err as Error).name !== 'AbortError') {
					console.error('Error sharing:', err);
				}
			}
		} else {
			try {
				await navigator.clipboard.writeText(window.location.href);
				shareCopied = true;
				setTimeout(() => (shareCopied = false), 2000);
			} catch (err) {
				console.error('Error copying to clipboard:', err);
			}
		}
	}

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

		const client = createUPClient(fetch);

		lastInterval = { startDate, endDate }; // Save the interval

		const unfilteredEvents = await client.getImpegni(page.params.calId!, {
			dataInizio: startDate,
			dataFine: endDate,
			idAule: [aula.id]
		});

		if ('error' in unfilteredEvents) {
			console.error('Error fetching events:', unfilteredEvents.error);
			loadingEvents = false;
			return;
		}

		const filteredEvents = unfilteredEvents.filter((impegno: Impegno) =>
			impegno.risorse.some((risorsa) => 'aulaId' in risorsa && risorsa.aulaId === aula.id)
		);

		events = filteredEvents;
		loadingEvents = false;
	}

	async function setupMap() {
		const [L, markerIcon, markerIcon2x, shadowUrl] = await Promise.all([
			import('leaflet').then((m) => m.default),
			import('leaflet/dist/images/marker-icon.png').then((m) => m.default),
			import('leaflet/dist/images/marker-icon-2x.png').then((m) => m.default),
			import('leaflet/dist/images/marker-shadow.png').then((m) => m.default),
			import('leaflet/dist/leaflet.css')
		]);

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

	onMount(() => {
		const paramImpegnoId = page.url.searchParams.get('impegno');
		if (paramImpegnoId != null) {
			const impegno = events.find((e) => e.id === paramImpegnoId);
			if (impegno != null) {
				eventModal?.showModal(impegno);
			}
		}
	});

	let impegnoId = $derived(page.url.searchParams.get('impegno'));

	// Open the modal when impegnoId changes
	$effect(() => {
		if (impegnoId == null) {
			eventModal?.close();
		} else {
			const impegno = events.find((e) => e.id === impegnoId);
			if (impegno) {
				eventModal?.showModal(impegno);
			}
		}
	});

	function setImpegnoId(id: string | null) {
		const searchParams = new SvelteURLSearchParams(page.url.searchParams);

		if (id == null) {
			searchParams.delete('impegno');
		} else {
			searchParams.set('impegno', id);
		}

		goto('?' + searchParams.toString(), { noScroll: true });
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
	<div class="flex flex-wrap items-center justify-between gap-4 mb-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl sm:text-4xl font-bold">{aula?.descrizione}</h1>
			{#if aula?.tipoAula?.descrizione}
				<span class="badge badge-secondary badge-sm sm:badge-md">
					{aula.tipoAula.descrizione.replace(/_/g, ' ')}
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<button
				class="btn btn-ghost btn-sm btn-circle"
				onclick={() =>
					favorites.toggle({
						id: aula.id,
						calId: page.params.calId!,
						name: aula.descrizione,
						buildingName: aula.relazioneEdificio.descrizione
					})}
				aria-label={favorites.isFavorite(aula.id) ? 'Remove from favorites' : 'Add to favorites'}
			>
				{#if favorites.isFavorite(aula.id)}
					<MdiStar class="w-6 h-6 text-warning" />
				{:else}
					<MdiStarOutline class="w-6 h-6" />
				{/if}
			</button>
			<button
				class="btn btn-outline btn-sm gap-2"
				onclick={shareClassroom}
				aria-label="Share classroom"
			>
				<MdiShareVariant class="w-4 h-4" />
				{shareCopied ? 'Copied!' : 'Share'}
			</button>
		</div>
	</div>

	{#if (aula.serviziAula?.length ?? 0) > 0}
		<div class="flex flex-wrap gap-2 my-4">
			{#each aula.serviziAula! as servizio, i (`${servizio._id}-${servizio.codice}-${i}`)}
				{@const Icon = iconMap[servizio.codice.toLowerCase()] || MdiInformationOutline}
				<div class="badge badge-outline badge-info gap-1 p-3">
					<Icon class="w-4 h-4" />
					{servizio.descrizione}
				</div>
			{/each}
		</div>
	{/if}

	<div
		class={[
			'flex items-center gap-2 my-4 border  rounded-lg px-4 py-2',
			nowEvent != null ? 'border-error bg-error/10' : 'border-success bg-success/10'
		]}
		role="alert"
	>
		{#if nowEvent != null}
			<span class="font-bold text-error">Occupied</span>
			<span class="text-sm sm:text-base">
				<strong>{nowEvent.nome}</strong>
				until {dayjs(nowEvent.dataFine).format('LT')}
			</span>
		{:else}
			<span class="font-bold text-success">Vacant</span>
			<span class="text-sm sm:text-base">
				{#if nextEvent}
					Free until <strong>{dayjs(nextEvent.dataInizio).format('LT')}</strong>
					({nextEvent.nome})
				{:else}
					The classroom is currently free.
				{/if}
			</span>
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
					{#if aula?.relazioneEdificio.orarioAperturaWeekend}
						<tr>
							<td class="font-bold text-end">Apertura weekend:</td>
							<td>{aula.relazioneEdificio.orarioAperturaWeekend}</td>
						</tr>
					{/if}
					{#if aula?.relazioneEdificio.orarioChiusuraWeekend}
						<tr>
							<td class="font-bold text-end">Chiusura weekend:</td>
							<td>{aula.relazioneEdificio.orarioChiusuraWeekend}</td>
						</tr>
					{/if}
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
						<td class="font-bold text-end">Codice:</td>
						<td><code>{aula?.codice}</code></td>
					</tr>
					{#if aula?.unitaOrganizzativa?.descrizione}
						<tr>
							<td class="font-bold text-end">Struttura:</td>
							<td>{aula.unitaOrganizzativa.descrizione}</td>
						</tr>
					{/if}
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
					<tr>
						<td class="font-bold text-end">Ultimo aggiornamento:</td>
						<td>{dayjs(aula?.dataModifica).format('LLL')}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</details>

	{#if aula.fotoUrl || aula.mappaUrl || aula.planimetriaUrl}
		<div class="flex flex-col md:flex-row gap-4 mb-4">
			{#if aula.fotoUrl}
				<div class="flex-1">
					<img
						src={aula.fotoUrl}
						alt="Foto dell'aula {aula.descrizione}"
						class="rounded-box shadow-md w-full h-auto object-cover max-h-64"
					/>
				</div>
			{/if}
			{#if aula.mappaUrl || aula.planimetriaUrl}
				<div
					class="flex-1 flex items-center justify-center bg-base-200 rounded-box p-4 border border-base-300"
				>
					<a
						href={aula.mappaUrl || aula.planimetriaUrl}
						target="_blank"
						rel="noopener"
						class="btn btn-outline btn-primary"
					>
						Visualizza planimetria interna
					</a>
				</div>
			{/if}
		</div>
	{/if}

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
			setImpegnoId(impegno.id);
		}}
		onCalendarChange={(start, end) => {
			updateImpegni(start, end);
		}}
	/>
</div>

{#if aula?.relazioneEdificio?.geo}
	<div class="p-4 mb-6">
		<h2 class="card-title text-2xl font-bold mb-2">Map</h2>
		<div class="flex flex-col sm:flex-row justify-center gap-2 mb-4">
			<a
				href={getGoogleMapsLink({
					lat: aula.relazioneEdificio.geo.lat,
					lng: aula.relazioneEdificio.geo.lng
				})}
				target="_blank"
				rel="noopener"
				class="btn btn-primary btn-md"
			>
				Open in Google Maps
			</a>
			<a
				href={getOSMLink({
					lat: aula.relazioneEdificio.geo.lat,
					lng: aula.relazioneEdificio.geo.lng
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
{/if}

<EventModal
	bind:this={eventModal}
	onclose={() => {
		setImpegnoId(null);
	}}
/>
