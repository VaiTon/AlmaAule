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
	let filteredClass = $derived(data.aule.sort(sortAule).filter(filterAule));
</script>

<h1 class="text-2xl font-bold mb-4">Aule</h1>

<input
	type="text"
	class="input input-bordered w-full my-4"
	placeholder="Cerca aula"
	bind:value={search}
/>

<table class="table table-zebra hover">
	<thead>
		<tr>
			<th>Aula</th>
			<th>Comune</th>
			<th>Edificio</th>
		</tr>
	</thead>
	<tbody>
		{#each filteredClass as aula}
			{@const edificio = aula.relazioneEdificio}
			<tr class="hover cursor-pointer" onclick={() => goto(`/cal/${aula.calId}/${aula.id}`)}>
				<td>
					<a href="/cal/{aula.calId}/{aula.id}"> {edificio.plesso} - {aula.descrizione} </a>
				</td>
				<td>{edificio.comune}</td>
				<td>{edificio.descrizione}</td>
			</tr>
		{/each}
	</tbody>
</table>
