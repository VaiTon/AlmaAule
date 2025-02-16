<script lang="ts">
	import { page } from '$app/state';

	import '../app.css';
</script>

<div class="mx-4 md:mx-auto max-w-5xl">
	<nav
		class="navbar bg-base-300 text-base-content rounded-box mt-4 mb-8"
		aria-label="main navigation"
	>
		<div class="navbar-start">
			<a href="/" class="font-bold btn btn-ghost"> Aule@Unibo </a>
		</div>

		<div class="navbar-end">
			<a href="/aule" class="btn btn-primary" class:btn-active={page.url.pathname === '/aule'}>
				Lista aule
			</a>
		</div>
	</nav>

	<main class="container mx-auto mb-8">
		<slot />
	</main>
</div>

<svelte:head>
	<title>Aule@Unibo</title>
</svelte:head>
