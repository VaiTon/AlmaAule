<script lang="ts">
	import '../app.css';
</script>

<div class="mx-4 md:mx-auto max-w-5xl">
	<nav class="navbar bg-base-100 gap-2" aria-label="main navigation">
		<a href="/">
			<h2 class="font-bold">Aule@Unibo</h2>
		</a>

		<div class="flex-1"></div>

		<a href="/aule" class="btn">Aule</a>
	</nav>

	<main class="container">
		<slot />
	</main>
</div>

<svelte:head>
	<title>Aule@Unibo</title>
</svelte:head>
