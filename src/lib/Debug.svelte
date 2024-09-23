<script lang="ts">
	import { dev } from '$app/environment';
	import {JsonView} from '@zerodevx/svelte-json-view';

	export let data: object;
</script>

{#if dev}
	<details>
		<summary>Debug</summary>
		<JsonView json={data} />
	</details>
{/if}
