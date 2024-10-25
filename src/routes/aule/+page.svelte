<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Aula } from '$lib/api';
	import type { PageData } from './$types';

	export let data: PageData;

	function addName(aula: Aula) {
		return {
			...aula,
			name: `${aula.relazioneEdificio.comune} - ${aula.relazioneEdificio.descrizione} - ${aula.descrizione}`
		};
	}

	let search = '';
	function filterAule(aula: Aula) {
		return aula.descrizione.toLowerCase().includes(search.toLowerCase());
	}

	$: filteredClass = data.aule
		.map(addName)
		.sort((a, b) => a.name.localeCompare(b.name))
		.filter(filterAule);
</script>

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
			<tr class="hover cursor-pointer" on:click={() => goto(`aule/${aula.id}`)}>
				<td><a class="link" href={`aule/${aula.id}`}>{aula.descrizione}</a></td>
				<td>{aula.relazioneEdificio.comune}</td>
				<td>{aula.relazioneEdificio.descrizione}</td>
			</tr>
		{/each}
	</tbody>
</table>
