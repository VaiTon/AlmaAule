<script lang="ts">
	import '../app.css';

	import { CAL_MAP } from '$lib/cals';
</script>

<div class="mx-auto max-w-5xl">
	<nav class="navbar bg-base-100 gap-2" aria-label="main navigation">
		<a href="/">
			<h2 class="font-bold">Aule@Unibo</h2>
		</a>

		<div class="flex-1" />
	</nav>

	<main class="container">
		<slot />
	</main>
</div>
