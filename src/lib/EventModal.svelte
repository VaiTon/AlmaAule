<script lang="ts">
	import moment from 'moment';
	import type { Impegno } from '$lib/api';

	export let event: Impegno | undefined;
	export let open: boolean = false;
	export let onClose: () => void = () => {};

	let dialogEl: HTMLDialogElement | null = null;

	// Open/close dialog reactively
	$: if (dialogEl) {
		if (open && !dialogEl.open) {
			dialogEl.showModal();
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	}

	function handleClose() {
		onClose();
	}

	function formatLocalDate(date: string | Date | undefined) {
		if (!date) return '';
		return new Date(date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
	}
</script>

<dialog class="modal" bind:this={dialogEl} on:close={handleClose}>
	<div class="modal-box shadow-lg border border-primary relative">
		<button
			type="button"
			class="btn btn-circle btn-ghost absolute right-2 top-2 text-xl"
			aria-label="Close"
			on:click={handleClose}
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
			</svg>
		</button>
		<div class="flex gap-4 mb-4 items-center">
			<div class="flex items-center gap-2">
				{#if event?.icona === 'attivitaDidattica'}
					<span class="text-2xl">📚</span>
				{:else if event?.icona === 'altraAttivita'}
					<span class="text-2xl">🎉</span>
				{:else}
					<span class="text-2xl">🗓️</span>
				{/if}
				<h2 class="text-xl font-bold grow">{event?.nome}</h2>
			</div>
		</div>
		{#if event?.stato}
			<div class="mb-2">
				<span class="badge badge-outline badge-primary text-xs px-3 py-1">{event.stato}</span>
				{#if event?.annoCorso}
					<span class="badge badge-outline badge-secondary text-xs px-3 py-1 ml-2">Year: {event.annoCorso}</span>
				{/if}
			</div>
		{/if}
		<div class="divider my-2"></div>
		<div class="grid gap-x-2 gap-y-1 grid-cols-[max-content_1fr]">
			<span class="font-bold text-end">Course:</span>
			<span>
				{#if event?.evento?.dettagliDidattici?.[0]?.corso?.descrizione}
					{event.evento.dettagliDidattici[0].corso.descrizione}
				{:else}
					<span class="italic opacity-70">N/A</span>
				{/if}
			</span>

			<span class="font-bold text-end">Start:</span>
			<span>{event ? new Date(event.dataInizio).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : ''}</span>

			<span class="font-bold text-end">End:</span>
			<span>{event ? new Date(event.dataFine).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : ''}</span>

			<span class="font-bold text-end">Duration:</span>
			<span>
				{event
					? moment.duration(moment(event.dataFine).diff(moment(event.dataInizio))).humanize()
					: ''}
			</span>

			<span class="font-bold text-end">Teachers:</span>
			<span>
				{#if event?.docenti.length}
					{event.docenti.map((d) => d.nome + ' ' + d.cognome).join(', ')}
				{:else}
					<span class="italic opacity-70">N/A</span>
				{/if}
			</span>


		</div>
		{#if event?.evento?.tipoAttivita?.descrizione}
			<div class="mt-4">
				<span class="badge badge-accent px-3 py-2 text-xs">{event.evento.tipoAttivita.descrizione}</span>
			</div>
		{/if}
	</div>
  <form method="dialog" class="modal-backdrop" on:click={handleClose}></form>
</dialog>
