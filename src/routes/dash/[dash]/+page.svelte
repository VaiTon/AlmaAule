<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Aula, Impegno } from '../../../lib/api';
	import { getActualImpegniAule } from '../../../lib/impegni';
	import type { PageData } from './$types';

	function formatTimeImpegno(impegno: Impegno) {
		return (
			dayjs(impegno.dataInizio).format('HH:mm') + ' - ' + dayjs(impegno.dataFine).format('HH:mm')
		);
	}

	export let data: PageData;
	$: impegnoAule = data.impegni.then((i) => getActualImpegniAule(data.aule, i));
</script>

<h1 class="text-4xl font-bold my-4">{data.cal.name}</h1>

{#await impegnoAule}
	<progress class="progress progress-primary"></progress>
{:then impegnoAule}
	<table class="table table-zebra">
		<thead>
			<tr>
				<th>Aula</th>
				<th>Capienza</th>
				<th>Impegno</th>
				<th>Orari</th>
			</tr>
		</thead>
		<tbody>
			{#each impegnoAule as { aula, impegno }}
				<tr class="hover cursor-pointer" on:click={() => goto(`/aule/${aula.id}`)}>
					<td><a href="/aule/{aula.id}"> {aula.descrizione} </a></td>
					<td>{aula.capienza}</td>
					<td>{impegno != null ? impegno.nome : ''}</td>
					<td>{impegno != null ? formatTimeImpegno(impegno) : ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/await}
