<script lang="ts">
	import { CAL_MAP } from '$lib/cals';
</script>

<ul class="menu">
	{#each CAL_MAP as { id, name }}
		<a href={`/dash/${id}`} class="btn btn-ghost">{name}</a>
	{/each}
</ul>
