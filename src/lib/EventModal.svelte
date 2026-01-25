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
		event = impegno;
		setTimeout(() => dialogEl?.showModal(), 0); // Ensure the dialog is shown after the DOM update
	}

	export function close() {
		dialogEl?.close();
		event = null;
	}

	function formatLocalDate(date: Date) {
		return date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
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
				onclick={() => close()}
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
			<div class="flex items-center gap-4 mb-6 mr-4">
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
					<h2 class="text-2xl font-bold wrap-break-word">
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

			<div class="divider my-3"></div>

			<!-- Event Details -->
			<div class="space-y-3">
				{#if event?.evento?.dettagliDidattici?.[0]?.corso != null}
					{@const course = event.evento.dettagliDidattici[0].corso}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">Course</span>
						<span class="flex-1 text-sm">{course.descrizione}</span>
					</div>
				{/if}

				{#if event?.evento?.dettagliDidattici?.[0]?.nome}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">Activity</span>
						<span class="flex-1 text-sm">{event.evento.dettagliDidattici[0].nome}</span>
					</div>
				{/if}

				{#if event?.evento?.dettagliDidattici?.[0]?.cfu}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">CFU</span>
						<span class="flex-1 text-sm">{event.evento.dettagliDidattici[0].cfu}</span>
					</div>
				{/if}

				<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
					<span class="font-semibold text-sm text-base-content/70 min-w-30">Start</span>
					<span class="flex-1 text-sm">{formatLocalDate(new Date(event.dataInizio))}</span>
				</div>

				<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
					<span class="font-semibold text-sm text-base-content/70 min-w-30">End</span>
					<span class="flex-1 text-sm">{formatLocalDate(new Date(event.dataFine))}</span>
				</div>

				<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
					<span class="font-semibold text-sm text-base-content/70 min-w-30">Duration</span>
					<span class="flex-1 text-sm"
						>{getDuration(new Date(event.dataInizio), new Date(event.dataFine))}</span
					>
				</div>

				{#if (event.docenti?.length ?? 0) > 0}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">Teachers</span>
						<div class="flex-1 flex flex-wrap gap-2">
							{#each event.docenti as docente (docente.id)}
								<a
									href={'https://www.unibo.it/uniboweb/unibosearch/rubrica.aspx?tab=FullTextPanel&lang=it&query=' +
										encodeURIComponent(docente.nome + ' ' + docente.cognome)}
									target="_blank"
									rel="noopener noreferrer"
									class="badge badge-outline badge-sm hover:badge-primary transition-colors"
								>
									{docente.nome}
									{docente.cognome}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if event.sovrapposizioni?.length > 0}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">Overlaps</span>
						<span class="flex-1 text-sm">
							{event.sovrapposizioni
								.map((s) =>
									s.docente
										? `${s.docente.nome} ${s.docente.cognome}${s.accettata ? ' (accepted)' : ''}`
										: s.risorsaId
								)
								.join(', ')}
						</span>
					</div>
				{/if}

				{#if event.warning && (event.warning.senzaRisorse || (event.warning.sovrapposizione ?? 0) > 0 || (event.warning.risorsaDaConfermare ?? 0) > 0 || event.warning.sovrapposizioniSospensione)}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">Warnings</span>
						<span class="flex-1 text-sm">
							{event.warning.senzaRisorse ? 'No resources assigned. ' : ''}
							{event.warning.sovrapposizione > 0
								? `Overlaps: ${event.warning.sovrapposizione}. `
								: ''}
							{event.warning.risorsaDaConfermare > 0
								? `Resources to confirm: ${event.warning.risorsaDaConfermare}. `
								: ''}
							{event.warning.sovrapposizioniSospensione ? 'Suspension overlaps. ' : ''}
						</span>
					</div>
				{/if}

				{#if event.oreAccademiche}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">Academic Hours</span>
						<span class="flex-1 text-sm">
							{event.oreAccademiche}
							{event.oreAccademicheBloccate ? ' (locked)' : ''}
						</span>
					</div>
				{/if}

				{#if event.evento?.annoAccademico?.descrizione}
					<div class="flex gap-4 py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors">
						<span class="font-semibold text-sm text-base-content/70 min-w-30">Academic Year</span>
						<span class="flex-1 text-sm">{event.evento.annoAccademico.descrizione}</span>
					</div>
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
