<script lang="ts">
	import type { Impegno } from '$lib/api';
	import type { EventHandler } from 'svelte/elements';

	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);
	dayjs.extend(duration);

	let dialogEl: HTMLDialogElement | null = $state(null);
	let event: Impegno | null = $state(null);

	type Props = {
		onclose?: EventHandler<Event, HTMLDialogElement>;
	};

	let { onclose }: Props = $props();

	export function showModal(impegno: Impegno) {
		console.log('Showing event modal:', impegno);
		event = impegno;
		setTimeout(() => dialogEl?.showModal(), 0); // Ensure the dialog is shown after the DOM update
	}

	function formatLocalDate(date: Date) {
		return date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
	}

	function getDuration(start: Date, end: Date) {
		return dayjs.duration(dayjs(end).diff(dayjs(start))).humanize();
	}
</script>

{#if event != null}
	<dialog class="modal" bind:this={dialogEl} {onclose}>
		<div class="modal-box shadow-lg border border-primary relative">
			<button
				type="button"
				class="btn btn-circle btn-ghost absolute right-2 top-2 text-xl"
				aria-label="Close"
				onclick={() => dialogEl?.close()}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-6 h-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
			<div class="flex gap-4 mb-4 items-center">
				<div class="flex items-center gap-2">
					{#if event.nome != null}
						{#if event?.icona === 'attivitaDidattica'}
							<span class="text-2xl">📚</span>
						{:else if event?.icona === 'altraAttivita'}
							<span class="text-2xl">🎉</span>
						{:else}
							<span class="text-2xl">🗓️</span>
						{/if}
						<h2 class="text-xl font-bold grow">{event?.nome}</h2>
					{:else if event.causaleIndisponibilita != null}
						<span class="text-2xl">🚫</span>
						<h2 class="text-xl font-bold grow">
							{event.causaleIndisponibilita}
						</h2>
					{:else}
						<span class="text-2xl">❓</span>
						<h2 class="text-xl font-bold grow">Unknown Event</h2>
					{/if}
				</div>
			</div>

			{#if event?.stato}
				<div class="mb-2">
					<span class="badge badge-outline badge-primary text-xs px-3 py-1">
						{event.stato == 'P' ? 'Reserved' : event.stato}
					</span>

					{#if event?.annoCorso}
						<span class="badge badge-outline badge-secondary text-xs px-3 py-1 ml-2">
							Year: {event.annoCorso}
						</span>
					{/if}
				</div>
			{/if}

			<div class="divider my-2"></div>
			<div class="grid gap-x-2 gap-y-1 grid-cols-[max-content_1fr]">
				{#if event?.evento?.dettagliDidattici?.[0]?.corso != null}
					{@const course = event.evento.dettagliDidattici[0].corso}
					<span class="font-bold text-end">Course:</span>
					<span>
						{course.descrizione}
					</span>
				{/if}

				<span class="font-bold text-end">Start:</span>
				<span> {formatLocalDate(new Date(event.dataInizio))} </span>

				<span class="font-bold text-end">End:</span>
				<span> {formatLocalDate(new Date(event.dataFine))} </span>

				<span class="font-bold text-end">Duration:</span>
				<span>
					{getDuration(new Date(event.dataInizio), new Date(event.dataFine))}
				</span>

				{#if (event.docenti?.length ?? 0) > 0}
					<span class="font-bold text-end">Teachers:</span>
					<span>
						{event.docenti.map((d) => d.nome + ' ' + d.cognome).join(', ')}
					</span>
				{/if}
			</div>

			<div class="mt-4">
				<span class="badge badge-accent px-3 py-2 text-xs">
					{event?.evento?.tipoAttivita?.descrizione ?? 'N/A'}
				</span>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>Close</button>
		</form>
	</dialog>
{/if}
