<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	import MdiBuilding from '@iconify-svelte/mdi/building';
	import MdiMapMarker from '@iconify-svelte/mdi/map-marker';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Fuse from 'fuse.js';
	import type { FuseResult, FuseResultMatch } from 'fuse.js';
	import type { CalendarAula } from './+page';

	let { data }: { data: PageData } = $props();

	let rawQuery = $state(page.url.searchParams.get('q') ?? '');

	type HighlightPart = { text: string; highlight: boolean };

	function getHighlightParts(
		text: string,
		matches: readonly FuseResultMatch[] | undefined,
		key: string
	): HighlightPart[] {
		if (!matches || !text) return [{ text, highlight: false }];
		const match = matches.find((m) => m.key === key);
		if (!match) return [{ text, highlight: false }];

		// Sort and merge overlapping or adjacent indices
		const sorted = [...match.indices].sort((a, b) => a[0] - b[0]);
		const merged: [number, number][] = [];
		if (sorted.length > 0) {
			let current: [number, number] = [sorted[0][0], sorted[0][1]];
			for (let i = 1; i < sorted.length; i++) {
				if (sorted[i][0] <= current[1] + 1) {
					current[1] = Math.max(current[1], sorted[i][1]);
				} else {
					merged.push(current);
					current = [sorted[i][0], sorted[i][1]];
				}
			}
			merged.push(current);
		}

		// Split merged ranges that contain spaces (to ensure highlight doesn't span across words)
		const finalIndices: [number, number][] = [];
		for (const [start, end] of merged) {
			let currentStart = start;
			const segment = text.slice(start, end + 1);
			const relativeSpaceIndices: number[] = [];

			for (let i = 0; i < segment.length; i++) {
				if (/\s/.test(segment[i])) {
					relativeSpaceIndices.push(i);
				}
			}

			if (relativeSpaceIndices.length === 0) {
				finalIndices.push([start, end]);
			} else {
				let lastRelIndex = -1;
				for (const relIndex of relativeSpaceIndices) {
					if (relIndex > lastRelIndex + 1) {
						finalIndices.push([currentStart, start + relIndex - 1]);
					}
					lastRelIndex = relIndex;
					currentStart = start + relIndex + 1;
				}
				if (currentStart <= end) {
					finalIndices.push([currentStart, end]);
				}
			}
		}

		const parts: HighlightPart[] = [];
		let lastIndex = 0;

		for (const [start, end] of finalIndices) {
			if (start > lastIndex) {
				parts.push({ text: text.slice(lastIndex, start), highlight: false });
			}
			parts.push({ text: text.slice(start, end + 1), highlight: true });
			lastIndex = end + 1;
		}

		if (lastIndex < text.length) {
			parts.push({ text: text.slice(lastIndex), highlight: false });
		}

		return parts;
	}

	function createFuseIndex(aule: CalendarAula[]) {
		console.time('Creating Fuse index');
		const fuse = new Fuse(aule, {
			keys: [
				{ name: 'descrizione', weight: 0.5 },
				{ name: 'relazioneEdificio.descrizione', weight: 0.3 },
				{ name: 'relazioneEdificio.plesso', weight: 0.1 },
				{ name: 'relazioneEdificio.comune', weight: 0.1 }
			],
			includeMatches: true,
			threshold: 0.3,
			minMatchCharLength: 2
		});
		console.timeEnd('Creating Fuse index');
		return fuse;
	}

	function fuseSearch(
		fuse: Fuse<CalendarAula>,
		aule: CalendarAula[],
		query: string
	): FuseResult<CalendarAula>[] {
		if (query.length < 2) {
			return aule.map((a, i) => ({ item: a, refIndex: i, matches: [] }));
		}
		return fuse.search(query);
	}

	function updateQuerySearch(newQuery: string) {
		const searchParams = new SvelteURLSearchParams(window.location.search);
		if (newQuery !== '') {
			searchParams.set('q', newQuery);
		} else {
			searchParams.delete('q');
		}
		goto('?' + searchParams.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	let debouncedQuery: string = $state('');
	$effect(() => {
		const query = rawQuery.trim();
		const timeout = setTimeout(() => {
			debouncedQuery = query;
			updateQuerySearch(query);
		}, 200);
		return () => clearTimeout(timeout);
	});
</script>

<h1 class="text-4xl font-bold mb-4">Classrooms</h1>

{#await data.aule}
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each Array.from({ length: 12 }).map((_, i) => i) as i (i)}
			<div class="card bg-base-100 shadow-md border border-base-300">
				<div class="card-body p-4">
					<div class="skeleton h-6 w-3/4 mb-2"></div>
					<div class="flex flex-col gap-2 mt-1">
						<div class="skeleton h-4 w-full"></div>
						<div class="skeleton h-4 w-1/2"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:then aule}
	{@const fuse = createFuseIndex(aule)}
	{@const showedResults = fuseSearch(fuse, aule, debouncedQuery)}

	<label for="search" class="sr-only">Search classroom</label>
	<input
		id="search"
		type="text"
		class="input input-bordered w-full my-4"
		placeholder="Search classrooms..."
		bind:value={rawQuery}
		aria-label="Search classroom"
	/>

	<div class="mb-4 text-sm text-base-content/70">
		Showing {showedResults.length} of {aule.length} classrooms.
	</div>

	{#snippet highlighted(text: string, key: string, matches: readonly FuseResultMatch[] | undefined)}
		{#each getHighlightParts(text, matches, key) as part (part.text + part.highlight)}
			{#if part.highlight}
				<mark class="bg-primary/30 text-inherit rounded-xs">{part.text}</mark>
			{:else}
				{part.text}
			{/if}
		{/each}
	{/snippet}

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each showedResults as { item: aula, matches } (aula.id)}
			{@const edificio = aula.relazioneEdificio}
			<a
				href={resolve('/cal/[calId]/[aulaId]', { calId: aula.calId, aulaId: aula.id })}
				class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-base-300"
				aria-label={`Go to details for ${edificio.plesso} - ${aula.descrizione}`}
			>
				<div class="card-body p-4">
					<h2 class="card-title text-lg">
						<span>
							{#if edificio.plesso}
								{@render highlighted(
									edificio.plesso,
									'relazioneEdificio.plesso',
									matches
								)}&nbsp;-&nbsp;
							{/if}
							{@render highlighted(aula.descrizione, 'descrizione', matches)}
						</span>
					</h2>
					<div class="text-sm opacity-70">
						<p class="flex items-start gap-2">
							<MdiBuilding class="w-4 h-4 shrink-0" />
							<span>
								{@render highlighted(
									edificio.descrizione,
									'relazioneEdificio.descrizione',
									matches
								)}
							</span>
						</p>
						{#if edificio.comune && edificio.comune.trim() !== ''}
							<p class="flex items-start gap-2 mt-1">
								<MdiMapMarker class="w-4 h-4 mt-0.5 shrink-0" />
								<span>
									{@render highlighted(edificio.comune, 'relazioneEdificio.comune', matches)}
								</span>
							</p>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>
	{#if showedResults.length === 0}
		<div class="alert alert-info mt-4">No results found.</div>
	{/if}
{/await}
