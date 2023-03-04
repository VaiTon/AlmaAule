<script lang="ts">
	import '../app.scss';
</script>

<nav class="container navbar" aria-label="main navigation">
	<div class="navbar-brand">
		<a class="navbar-item" href="/">
			<h2>Aule@Unibo</h2>
		</a>
	</div>
	<div class="navbar-menu">
		<div class="navbar-start">
			<div class="navbar-item">
				<a href="/matematica">Matematica</a>
			</div>
			<div class="navbar-item">
				<a href="/ingegneria">Ingegneria</a>
			</div>
		</div>
	</div>
</nav>

<main class="container">
	<slot />
</main>

<style lang="scss">
</style>
