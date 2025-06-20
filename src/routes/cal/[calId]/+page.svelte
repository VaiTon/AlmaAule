<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Aula, Impegno } from '../../../lib/api';
	import { getActualImpegniAule } from '../../../lib/impegni';
	import type { PageData } from '../$types';
	import dayjs from 'dayjs';
	import { page } from '$app/state';

	function formatTimeImpegno(impegno: Impegno) {
		return (
			dayjs(impegno.dataInizio).format('HH:mm') + ' - ' + dayjs(impegno.dataFine).format('HH:mm')
		);
	}

	export let data: PageData;
	$: impegnoAule = data.impegni.then((i) => getActualImpegniAule(data.aule, i));
</script>

<div class="flex flex-col sm:flex-row items-center justify-between gap-4 my-4">
	<h1 class="text-4xl font-bold">{data.cal.name}</h1>
	<a
		href={`/cal/${data.cal.id}/impegni`}
		class="btn btn-primary btn-sm"
	>
		View Resource Timeline
	</a>
</div>

{#await impegnoAule}
	<progress class="progress progress-primary"></progress>
{:then impegnoAule}
	<label for="search-cal" class="sr-only">Search classroom</label>
	<!-- Optionally, you could add a search input here for filtering -->
	<div class="overflow-x-auto">
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
					<tr
						class="hover cursor-pointer"
						role="button"
						tabindex="0"
						aria-label={`Go to details for ${aula.descrizione}`}
						on:click={() => goto(page.url + `/${aula.id}`)}
						on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto(page.url + `/${aula.id}`)}
					>
						<td><a href="{page.url}/{aula.id}"> {aula.descrizione} </a></td>
						<td>{aula.capienza}</td>
						<td>{impegno != null ? impegno.nome : ''}</td>
						<td>{impegno != null ? formatTimeImpegno(impegno) : ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if impegnoAule.length === 0}
			<div class="alert alert-info mt-4">No results found.</div>
		{/if}
	</div>
{/await}
