<script lang="ts">
	import type { Aula, Impegno } from '../../../lib/api';
	import AuleLista from '../../../lib/AuleLista.svelte';
	import { getActualImpegniAule } from '../../../lib/impegni';
	import type { PageData } from '../../ingegneria/$types';

	export let data: PageData;
	$: impegnoAule = getActualImpegniAule(data.aule, data.impegni);
</script>

<AuleLista {impegnoAule} calId={data.calId} />
