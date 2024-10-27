<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Aula } from '$lib/api';
	import type { PageData } from './$types';

	export let data: PageData;

	function sortingName(aula: Aula) {
		return `${aula.relazioneEdificio.comune} - ${aula.relazioneEdificio.descrizione} - ${aula.descrizione}`;
	}

	let search = '';

	$: filteredClass = data.aule
		.sort((a, b) => {
			const nameA = sortingName(a);
			const nameB = sortingName(b);
			return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
		})
		.filter((aula) => {
			return aula.descrizione.toLowerCase().includes(search.toLowerCase());
		});
</script>

<table class="table table-zebra hover">
	<thead>
		<tr>
			<th>Comune</th>
			<th>Edificio</th>
			<th>Aula</th>
		</tr>
	</thead>
	<tbody>
		{#each filteredClass as aula}
			<tr class="hover cursor-pointer" on:click={() => goto(`/cal/${aula.calId}/${aula.id}`)}>
				<td> {aula.relazioneEdificio.comune} </td>
				<td>{aula.relazioneEdificio.descrizione} - {aula.relazioneEdificio.plesso} </td>
				<td>{aula.descrizione}</td>
			</tr>
		{/each}
	</tbody>
</table>
