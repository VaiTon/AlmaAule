<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Aula } from '$lib/api';
	import type { PageData } from './$types';

	import MdiBuilding from '@iconify-svelte/mdi/building';
	import MdiMapMarker from '@iconify-svelte/mdi/map-marker';

	let { data }: { data: PageData } = $props();

	function sortingName(aula: Aula) {
		return `${aula.relazioneEdificio.comune} - ${aula.relazioneEdificio.plesso} - ${aula.descrizione}`;
	}

	function filterAule(aula: Aula) {
		return sortingName(aula).toLowerCase().includes(search.toLowerCase());
	}

	function sortAule(a: Aula, b: Aula) {
		const nameA = sortingName(a);
		const nameB = sortingName(b);
		return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
	}

	let search = $state('');
</script>

<h1 class="text-2xl font-bold mb-4">Aule</h1>

{#await data.aule}
	<div class="text-center">
		<p class="loading loading-spinner loading-lg"></p>
		<p class="mt-4">Caricamento aule...</p>
	</div>
{:then aule}
	<label for="search" class="sr-only">Search classroom</label>
	<input
		id="search"
		type="text"
		class="input input-bordered w-full my-4"
		placeholder="Cerca aula"
		bind:value={search}
		aria-label="Search classroom"
	/>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each aule.sort(sortAule).filter(filterAule) as aula (aula.id)}
			{@const edificio = aula.relazioneEdificio}
			<a
				href={resolve('/cal/[calId]/[aulaId]', { calId: aula.calId, aulaId: aula.id })}
				class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-base-300"
				aria-label={`Go to details for ${edificio.plesso} - ${aula.descrizione}`}
			>
				<div class="card-body p-4">
					<h2 class="card-title text-lg">
						{#if edificio.plesso}{edificio.plesso} -
						{/if}{aula.descrizione}
					</h2>
					<div class="text-sm opacity-70">
						<p class="flex items-start gap-2">
							<MdiBuilding class="w-4 h-4 shrink-0" />
							<span>{edificio.descrizione}</span>
						</p>
						{#if edificio.comune && edificio.comune.trim() !== ''}
							<p class="flex items-start gap-2 mt-1">
								<MdiMapMarker class="w-4 h-4 mt-0.5 shrink-0" />
								<span>{edificio.comune}</span>
							</p>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>
	{#if aule.sort(sortAule).filter(filterAule).length === 0}
		<div class="alert alert-info mt-4">No results found.</div>
	{/if}
{/await}
