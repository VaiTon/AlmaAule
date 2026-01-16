<script lang="ts">
	import dayjs, { Dayjs } from 'dayjs';
	import type { Impegno } from '$lib/api';

	type TimelineEvent = {
		start: Date;
		end: Date;
		title: string;
		impegno: Impegno;
	};

	type Props = {
		events?: Impegno[];
		loading?: boolean;
		onEventClick?: (event: Impegno) => void;
		onCalendarChange?: (startDate: Dayjs, endDate: Dayjs) => void;
	};
	const { events = [], loading = false, onEventClick, onCalendarChange }: Props = $props();

	function getDayLabel(date: Dayjs): string {
		return date.format('ddd D MMM');
	}

	let weekStart: Dayjs = $state(dayjs().startOf('week')); // Monday
	let weekDaysArr: Dayjs[] = $derived.by(() =>
		Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))
	);

	let weekEvents: TimelineEvent[] = $derived.by(() =>
		events
			.filter((e) =>
				weekDaysArr.some(
					(day) =>
						dayjs(e.dataInizio).isSame(day, 'day') ||
						dayjs(e.dataFine).isSame(day, 'day') ||
						(dayjs(e.dataInizio).isBefore(day, 'day') && dayjs(e.dataFine).isAfter(day, 'day'))
				)
			)
			.map((impegno) => ({
				start: new Date(impegno.dataInizio),
				end: new Date(impegno.dataFine),
				title: impegno.nome,
				impegno
			}))
	);

	function handleTimelineEventClick(impegno: Impegno) {
		onEventClick?.(impegno);
	}

	function goToPrevWeek() {
		weekStart = weekStart.subtract(1, 'week');
		onCalendarChange?.(weekStart, weekStart.add(6, 'day'));
	}
	function goToNextWeek() {
		weekStart = weekStart.add(1, 'week');
		onCalendarChange?.(weekStart, weekStart.add(6, 'day'));
	}

	let startHour = $derived.by(() => {
		if (weekEvents.length === 0) return 8;
		return Math.min(...weekEvents.map((e) => dayjs(e.start).hour()));
	});

	let endHour = $derived.by(() => {
		if (weekEvents.length === 0) return 19;
		return Math.max(
			...weekEvents.map((e) => {
				const end = dayjs(e.end);
				return end.hour() + (end.minute() > 0 ? 1 : 0); // Round up if there are minutes
			})
		);
	});

	const hours: number[] = $derived.by(() => {
		const range = [];
		for (let i = startHour; i <= endHour; i++) {
			range.push(i);
		}
		return range;
	});

	function getHourLabel(hour: number): string {
		return `${hour}:00`;
	}

	function getEventBlockStyle(event: TimelineEvent, dayIdx: number): string {
		const start = dayjs(event.start);
		const end = dayjs(event.end);
		const startHour = start.hour() + start.minute() / 60;
		const endHour = end.hour() + end.minute() / 60;
		const pxPerHour = 48;
		const gap = 8; // px gap between events
		const top = Math.max(0, (startHour - hours[0]) * pxPerHour);
		const height = Math.max(20, (endHour - startHour) * pxPerHour - gap);
		return `
			top: ${top}px;
			height: ${height}px;
			left: calc(4rem + ${dayIdx} * (100% - 4rem) / 7);
			width: calc((100% - 4rem) / 7 - ${gap}px);
			min-width: 2.5rem;
			z-index: 5;
		`;
	}

	function getGridColumnStyle(dayIdx: number): string {
		return `
          left: calc(4rem + ${dayIdx} * (100% - 4rem) / 7);
          width: calc((100% - 4rem) / 7);
        `;
	}

	function getEventColor(impegno: Impegno): string {
		if (impegno.causaleIndisponibilita != null) {
			return 'bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-white'; // Unavailability
		}
		switch (impegno.icona) {
			case 'attivitaDidattica':
				return 'bg-green-200 dark:bg-green-600 text-green-900 dark:text-white'; // Lectures
			case 'esame':
				return 'bg-red-200 dark:bg-red-700 text-red-900 dark:text-white'; // Exams
			case 'altraAttivita':
				return 'bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-white'; // Other activities
			default:
				return 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white'; // Unknown
		}
	}
</script>

{#snippet eventInside(impegno: Impegno)}
	<div class="block text-start h-full py-4">
		<p class="text-xs font-bold mb-2">{impegno.nome}</p>

		<div class="text-xs mb-2">
			{#if impegno?.evento?.dettagliDidattici?.[0]?.corso != null}
				🎓 {impegno.evento.dettagliDidattici[0].corso.descrizione}
			{:else if impegno?.causaleIndisponibilita != null}
				🚫 {impegno.causaleIndisponibilita}
			{/if}
		</div>

		{#if impegno.docenti.length > 0}
			<div class="text-xs">
				🧑‍🏫 {impegno.docenti.map((d) => d.nome + ' ' + d.cognome).join(', ')}
			</div>
		{/if}
	</div>
{/snippet}

<div class="mb-4 flex justify-center w-full gap-2">
	<div class="flex items-center gap-2">
		<button class="btn btn-sm btn-ghost" onclick={goToPrevWeek}>&larr;</button>
		<span class="font-semibold">
			{weekStart.format('D MMM')} - {weekStart.add(6, 'day').format('D MMM, YYYY')}
		</span>
		<button class="btn btn-sm btn-ghost" onclick={goToNextWeek}>&rarr;</button>
	</div>
	{#if loading}
		<span class="loading loading-spinner loading-xs"></span>
	{/if}
</div>

<div class="overflow-x-auto">
	<div class="min-w-175 overflow-x-scroll">
		<!-- Days axis -->
		<div class="flex border-b border-base-300 bg-base-200 sticky top-0 z-10" style="height:2.5rem;">
			<!-- Empty space for hour labels -->
			<div class="w-16 shrink-0"></div>
			{#each weekDaysArr as day (day.unix())}
				<div
					class="flex-1 text-center py-2 text-xs font-semibold border-l border-base-300 first:border-l-0"
				>
					{getDayLabel(day)}
				</div>
			{/each}
		</div>
		<!-- Hours and grid -->
		<div class="relative" style="height:{hours.length * 48}px;">
			<!-- Hour labels -->
			<div class="absolute left-0 top-0 w-16 h-full">
				{#each hours as hour (hour)}
					<div
						class="h-12 flex items-center justify-end pr-2 text-xs text-base-content/70 border-b border-base-300"
					>
						{getHourLabel(hour)}
					</div>
				{/each}
			</div>

			<!-- Grid columns for days -->
			{#each weekDaysArr as day, dayIdx (day.toDate())}
				<div class="absolute top-0" style={getGridColumnStyle(dayIdx)}>
					{#each hours as hour (hour)}
						<div class="h-12 border-l border-base-300 border-b"></div>
					{/each}
				</div>
			{/each}

			<!-- Render events for this classroom -->
			{#each weekEvents as event (event.start.valueOf() + event.title)}
				{@const startDayIdx = weekDaysArr.findIndex((day) => dayjs(event.start).isSame(day, 'day'))}
				{#if startDayIdx >= 0}
					<button
						class="absolute rounded shadow px-2 text-xs font-semibold overflow-auto wrap-break-word cursor-pointer mx-1 my-1 {getEventColor(
							event.impegno
						)}"
						style={getEventBlockStyle(event, startDayIdx)}
						title={event.title}
						onclick={() => handleTimelineEventClick(event.impegno)}
					>
						{@render eventInside(event.impegno)}
					</button>
				{/if}
			{/each}
		</div>
	</div>
</div>
