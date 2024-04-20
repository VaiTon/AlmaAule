<script lang="ts">
	import type { Aula, Impegno } from '../../../lib/api';
	import AuleLista from '../../../lib/AuleLista.svelte';
	import { getActualImpegniAule } from '../../../lib/impegni';
	import type { PageData } from './$types';

	export let data: PageData;
	$: impegnoAule = getActualImpegniAule(data.aule, data.impegni);
</script>

<h1 class="text-4xl font-bold my-4">{data.cal.name}</h1>
<AuleLista {impegnoAule} />
