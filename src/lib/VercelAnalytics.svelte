<script lang="ts">
	import { page } from '$app/state';
	import { inject as injectAnalytics, pageview } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights';
	import { onMount } from 'svelte';

	let analyticsInitialized = $state(false);
	let speedInsights: ReturnType<typeof injectSpeedInsights> = null;

	onMount(() => {
		injectAnalytics({ disableAutoTrack: true, framework: 'sveltekit' });
		speedInsights = injectSpeedInsights({ route: page.route.id, framework: 'sveltekit' });
		analyticsInitialized = true;
	});

	$effect(() => {
		const route = page.route.id;
		const path = page.url.pathname;

		if (!analyticsInitialized) return;

		pageview({ route, path });
		speedInsights?.setRoute(route);
	});
</script>
