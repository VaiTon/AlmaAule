<script lang="ts">
	import { dev } from '$app/environment';
	import { JsonView } from '@zerodevx/svelte-json-view';

	let { data }: { data: object } = $props();
</script>

{#if dev}
	<details>
		<summary>Debug</summary>
		<JsonView json={data} />
	</details>
{/if}
