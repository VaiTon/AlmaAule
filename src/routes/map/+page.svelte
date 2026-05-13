<script lang="ts">
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

	import { onMount, tick } from 'svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import type { Edificio } from '$lib/api';

	let { data }: { data: PageData } = $props();

	let mapContainer: HTMLElement | undefined = $state();
	let map: L.Map | undefined = $state();

	const BOLOGNA_COORDS: [number, number] = [44.4949, 11.3426];

	function initMap(edifici: Edificio[]) {
		if (!mapContainer || map) return;

		map = L.map(mapContainer, {
			attributionControl: false
		}).setView(BOLOGNA_COORDS, 13);

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

		const markerCluster = L.markerClusterGroup();

		for (const edificio of edifici) {
			if (edificio.geo && edificio.geo.lat && edificio.geo.lng) {
				const marker = L.marker([edificio.geo.lat, edificio.geo.lng], {
					icon: iconDefault
				}).bindPopup(
					`
						<div class="p-4 flex flex-col gap-1">
							<h3 class="font-bold text-lg leading-tight">${edificio.descrizione}</h3>
							<p class="text-xs opacity-60 mb-2">${edificio.via}, ${edificio.comune}</p>
							<div class="divider my-0 opacity-20"></div>
							<a href="${resolve('/aule')}?q=${encodeURIComponent(edificio.descrizione)}" 
							   class="btn btn-primary btn-sm mt-2 text-white no-underline shadow-sm">
								View Classrooms
							</a>
						</div>
					`
				);
				markerCluster.addLayer(marker);
			}
		}

		map.addLayer(markerCluster);

		// Adjust view if markers exist
		if (edifici.length > 0) {
			map.fitBounds(markerCluster.getBounds().pad(0.1));
		}
	}

	onMount(async () => {
		const edifici = await data.edifici;
		await tick();
		initMap(edifici);
	});
</script>

<svelte:head>
	<title>Interactive Map - AlmaAule</title>
</svelte:head>

<div class="flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
	<div class="mb-4">
		<h1 class="text-3xl font-bold">University Map</h1>
		<p class="text-base-content/70">Find university buildings and classrooms geographically.</p>
	</div>

	{#await data.edifici}
		<div class="flex-grow w-full skeleton rounded-xl"></div>
	{:then}
		<div
			bind:this={mapContainer}
			class="z-10 w-full flex-grow rounded-xl border-2 border-base-300 shadow-lg"
		></div>
	{/await}
</div>

<style>
	:global(.leaflet-popup-content-wrapper) {
		border-radius: 1rem;
		padding: 0;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
	}
	:global(.leaflet-popup-content) {
		margin: 0;
		width: 240px !important;
	}
	:global(.leaflet-popup-tip-container) {
		display: none;
	}
</style>
