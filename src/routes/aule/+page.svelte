<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: auleOrd = data.aule
		.map((aula) => ({
			...aula,
			name: `${aula.relazioneEdificio.comune} - ${aula.relazioneEdificio.descrizione} - ${aula.descrizione}`
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
</script>

<table class="table">
	<thead>
		<tr>
			<th>Aula</th>
			<th>Comune</th>
			<th>Edificio</th>
		</tr>
	</thead>
	<tbody>
		{#each auleOrd as aula}
			<tr>
				<td><a class="link" href={`aule/${aula.id}`}>{aula.descrizione}</a></td>
				<td>{aula.relazioneEdificio.comune}</td>
				<td>{aula.relazioneEdificio.descrizione}</td>
			</tr>
		{/each}
	</tbody>
</table>
