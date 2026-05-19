<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
	import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
	import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';

	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

	import { onMount, tick } from 'svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import type { Edificio } from '$lib/api';

	let { data }: { data: PageData } = $props();

	let mapContainer: HTMLElement | undefined = $state();
	const BOLOGNA_COORDS: [number, number] = [44.4949, 11.3426];

	async function initMap(edifici: Edificio[]) {
		if (!mapContainer) return;

		// 1. Import Leaflet base
		const L = (await import('leaflet')).default;

		// 2. Import Plugins
		await import('leaflet.markercluster');
		const { GestureHandling } = await import('leaflet-gesture-handling');
		const { LocateControl } = await import('leaflet.locatecontrol');

		// 3. Register Handlers
		// @ts-expect-error - register plugin
		if (!L.Map.prototype.addHandler.gestureHandling) {
			L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
		}

		// 4. Initialize Map
		const map = L.map(mapContainer, {
			attributionControl: false,
			// @ts-expect-error - plugin option
			gestureHandling: true
		}).setView(BOLOGNA_COORDS, 13);

		L.control.attribution({ prefix: false }).addTo(map);

		// 5. Add Locate Control (using the class constructor as recommended)
		new LocateControl({
			position: 'topleft',
			strings: {
				title: 'Show my location'
			},
			locateOptions: {
				enableHighAccuracy: true,
				maxZoom: 16
			},
			flyTo: true,
			showPopup: false,
			drawCircle: true,
			drawMarker: true
		}).addTo(map);

		// 6. Setup Layers & Icons
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

		// 7. Add Marker Clustering
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

		// 8. Final View Adjustment
		if (edifici.length > 0) {
			map.fitBounds(markerCluster.getBounds().pad(0.1));
		}
	}

	onMount(async () => {
		const edifici = await data.edifici;
		await tick();
		await initMap(edifici);
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
