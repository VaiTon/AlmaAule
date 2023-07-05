<script lang="ts">
	import '../app.css';

	let menuOpen = false;
	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

<div class="mx-auto max-w-5xl">
	<nav class="navbar bg-base-100 gap-2" aria-label="main navigation">
		<h2 class="font-bold">Aule@Unibo</h2>

		<div class="flex-1" />

		<a href="/dash/matematica" class="btn btn-ghost">Matematica</a>
		<a href="/dash/ingegneria" class="btn btn-ghost">Ingegneria</a>
	</nav>

	<main class="container">
		<slot />
	</main>
</div>


