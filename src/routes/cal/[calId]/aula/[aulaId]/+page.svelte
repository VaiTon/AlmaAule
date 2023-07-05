<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
	$: aula = data.aula;

	$: console.debug(aula);
</script>

<h1 class="text-4xl font-bold my-4">{aula?.descrizione}</h1>

<div class="grid gap-x-8 grid-cols-[max-content,1fr]">
	<span>Capienza:</span>
	<span>{aula?.capienza}</span>

	<span>Numero postazioni:</span>
	<span>{aula?.numeroPostazioni}</span>

	<span>Metri quadri:</span>
	<span>{aula?.metriQuadri} mq</span>
</div>

<h2 class="text-2xl font-bold mt-6 mb-2">Piano</h2>
<span>{aula?.piano.descrizione} - {aula?.piano.codice}</span>

<h2 class="text-2xl font-bold mt-6 mb-2">Edificio</h2>

<div class="grid gap-x-8 grid-cols-[max-content,1fr]">
	<span>Codice:</span>
	<span>{aula?.relazioneEdificio.codice}</span>

	<span>Indirizzo:</span>
	<span>{aula?.relazioneEdificio.via}</span>

	<span>Comune:</span>
	<span>{aula?.relazioneEdificio.comune}</span>
</div>

<h2 class="text-2xl font-bold mt-6 mb-2">Impegni</h2>

<p>
	<a class="link" href="{$page.url}/debug/aula">Debug aula</a>
</p>
<p>
	<a class="link" href="{$page.url}/debug/impegni">Debug impegni</a>
</p>
