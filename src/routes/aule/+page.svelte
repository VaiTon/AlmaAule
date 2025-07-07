<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Aula } from '$lib/api';
	import type { PageData } from './$types';

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

	<div class="overflow-x-auto">
		<table class="table table-zebra hover">
			<thead>
				<tr>
					<th>Aula</th>
					<th>Comune</th>
					<th>Edificio</th>
				</tr>
			</thead>
			<tbody>
				{#each aule.sort(sortAule).filter(filterAule) as aula}
					{@const edificio = aula.relazioneEdificio}
					<tr
						class="hover cursor-pointer"
						role="button"
						tabindex="0"
						aria-label={`Go to details for ${edificio.plesso} - ${aula.descrizione}`}
						onclick={() => goto(`/cal/${aula.calId}/${aula.id}`)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								goto(`/cal/${aula.calId}/${aula.id}`);
							}
						}}
					>
						<td>
							<a href="/cal/{aula.calId}/{aula.id}"> {edificio.plesso} - {aula.descrizione} </a>
						</td>
						<td>{edificio.comune}</td>
						<td>{edificio.descrizione}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if aule.sort(sortAule).filter(filterAule).length === 0}
			<div class="alert alert-info mt-4">No results found.</div>
		{/if}
	</div>
{/await}
