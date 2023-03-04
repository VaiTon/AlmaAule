<script lang="ts">
	import type { Aula, Impegno } from '../../lib/api';
	import AuleLista from '../../lib/AuleLista.svelte';
	import { getActualImpegniAule } from '../../lib/impegni';
	import type { PageData } from './$types';

	export let data: PageData;

	let impegni: Impegno[] = data.impegni;
	let aule: Aula[] = data.aule;

	$: impegnoAule = getActualImpegniAule({
		aule,
		impegni
	});
</script>

<AuleLista {impegnoAule} />
