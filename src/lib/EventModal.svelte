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
			<div class="flex items-center gap-4 mb-6">
				<span class="text-4xl" style="line-height: 1;">
					{#if event?.icona === 'attivitaDidattica'}
						📚
					{:else if event?.icona === 'altraAttivita'}
						🛠️
					{:else if event?.icona === 'esame'}
						📝
					{:else if event.causaleIndisponibilita != null}
						🚫
					{:else}
						❓
					{/if}
				</span>
				<div class="flex flex-col flex-1 min-w-0">
					<h2 class="text-2xl font-bold truncate">
						{event?.nome ?? event.causaleIndisponibilita ?? 'Unknown Event'}
					</h2>
					{#if event?.evento?.tipoAttivita?.descrizione}
						<span class="text-base text-gray-500">{event.evento.tipoAttivita.descrizione}</span>
					{/if}
				</div>
			</div>

			{#if event.warning && (event.warning.senzaRisorse || (event.warning.sovrapposizione ?? 0) > 0 || (event.warning.risorsaDaConfermare ?? 0) > 0 || event.warning.sovrapposizioniSospensione)}
				<div class="alert alert-warning mb-4">
					<div>
						<strong>Warning:</strong>
						{event.warning.senzaRisorse ? ' No resources assigned. ' : ''}
						{event.warning.sovrapposizione > 0
							? ` Overlaps: ${event.warning.sovrapposizione}. `
							: ''}
						{event.warning.risorsaDaConfermare > 0
							? ` Resources to confirm: ${event.warning.risorsaDaConfermare}. `
							: ''}
						{event.warning.sovrapposizioniSospensione ? ' Suspension overlaps. ' : ''}
					</div>
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

				{#if event?.evento?.dettagliDidattici?.[0]?.nome}
					<span class="font-bold text-end">Activity:</span>
					<span>
						{event.evento.dettagliDidattici[0].nome}
					</span>
				{/if}

				{#if event?.evento?.dettagliDidattici?.[0]?.cfu}
					<span class="font-bold text-end">CFU:</span>
					<span>
						{event.evento.dettagliDidattici[0].cfu}
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

				{#if event.sovrapposizioni?.length > 0}
					<span class="font-bold text-end">Overlaps:</span>
					<span>
						{event.sovrapposizioni
							.map((s) =>
								s.docente
									? `${s.docente.nome} ${s.docente.cognome}${s.accettata ? ' (accepted)' : ''}`
									: s.risorsaId
							)
							.join(', ')}
					</span>
				{/if}

				{#if event.warning && (event.warning.senzaRisorse || (event.warning.sovrapposizione ?? 0) > 0 || (event.warning.risorsaDaConfermare ?? 0) > 0 || event.warning.sovrapposizioniSospensione)}
					<span class="font-bold text-end">Warnings:</span>
					<span>
						{event.warning.senzaRisorse ? 'No resources assigned. ' : ''}
						{event.warning.sovrapposizione > 0
							? `Overlaps: ${event.warning.sovrapposizione}. `
							: ''}
						{event.warning.risorsaDaConfermare > 0
							? `Resources to confirm: ${event.warning.risorsaDaConfermare}. `
							: ''}
						{event.warning.sovrapposizioniSospensione ? 'Suspension overlaps. ' : ''}
					</span>
				{/if}

				{#if event.oreAccademiche}
					<span class="font-bold text-end">Academic Hours:</span>
					<span>
						{event.oreAccademiche}
						{event.oreAccademicheBloccate ? ' (locked)' : ''}
					</span>
				{/if}

				{#if event.evento?.annoAccademico?.descrizione}
					<span class="font-bold text-end">Academic Year:</span>
					<span>
						{event.evento.annoAccademico.descrizione}
					</span>
				{/if}
			</div>

			<div class="mt-4 flex flex-wrap gap-2">
				<span class="badge badge-accent px-3 py-2 text-xs">
					Type: {event?.evento?.tipoAttivita?.descrizione ?? 'N/A'}
				</span>
				{#if event.stato}
					<span class="badge badge-outline badge-info px-3 py-2 text-xs">
						Status: {event.stato}
					</span>
				{/if}
				{#if event.icona}
					<span class="badge badge-outline badge-ghost px-3 py-2 text-xs">
						Icon: {event.icona}
					</span>
				{/if}
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>Close</button>
		</form>
	</dialog>
{/if}
