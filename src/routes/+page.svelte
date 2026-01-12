<script lang="ts">
	import { resolve } from '$app/paths';
	import { CAL_MAP } from '$lib/cals';
</script>

<div class="prose md:mx-auto mx-4">
	<h1 class="text-3xl text-center font-bold">AlmaAule</h1>
	<p class="text-center font-semibold text-base text-warning">
		<strong>Unofficial tool made by the Computer Science community of Unibo</strong>
	</p>
	<p>
		Welcome to <strong>AlmaAule</strong> — your tool for checking classroom availability and schedules.
	</p>
	<p>
		This website helps students and staff find <strong>free classrooms</strong> for studying, teaching,
		or events.
	</p>
	<p>
		We <strong>don't scrape</strong> any other website—AlmaAule relies on public APIs for all its data.
	</p>
	<p>
		Actually, it's your browser that makes the HTTP requests to the servers, so we're not doing
		anything at all. We're just providing a nice interface. 😼
	</p>

	<hr />

	<div class="md:flex not-prose gap-4">
		<a href="#calendars" class="not-prose btn btn-primary grow max-md:w-full max-md:mb-4">
			Go to calendars 📅
		</a>
		<a href={resolve('/aule')} class="not-prose btn btn-secondary mx-auto grow max-md:w-full">
			Go to classroom list 📚
		</a>
	</div>

	<hr />

	<p>
		<strong>Disclaimer:</strong> This service depends on public APIs and may become unavailable if those
		APIs change or are removed. We're not responsible for any inconvenience caused by the unavailability
		of the service.
	</p>
	<p>
		AlmaAule is open source and available on <a href="https://github.com/VaiTon/uniboaule/"
			>GitHub</a
		>. Feel free to contribute or use it as a base for your own project!
	</p>
	<hr />
</div>

<h2 class="text-2xl text-center font-bold mt-16 mb-4" id="calendars">Select a calendar</h2>
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
	{#each CAL_MAP as { id, name } (id)}
		<a
			href={resolve('/cal/[calId]', { calId: id })}
			class="card bg-base-100 transition rounded-xl border border-base-300 flex flex-col items-center justify-center p-6 text-base-content no-underline hover:bg-primary/10"
			style="min-height: 110px;"
		>
			<span class="text-3xl mb-2" aria-hidden="true">📅</span>
			<span class="font-semibold text-lg text-center">{name}</span>
		</a>
	{/each}
</div>
