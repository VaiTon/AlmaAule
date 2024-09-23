<script lang="ts">
	import { getActualImpegniAule } from '$lib/impegni';
	import type { PageData } from './$types';

	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import List from '@event-calendar/list';
	import ResourceTimeGrid from '@event-calendar/resource-time-grid';
	import ResourceTimeline from '@event-calendar/resource-timeline';
	import moment from 'moment';
	import { resolveRoute } from '$app/paths';

	export let data: PageData;

	$: impegni = data.impegni;

	$: resources = impegni
		.map((impegno) => {
			return impegno.aule.map((aula) => {
				return {
					id: aula.id,
					title: aula.descrizione
				};
			});
		})
		.flat();

	$: console.debug({ resources });
</script>

<Calendar
	plugins={[ResourceTimeline, ResourceTimeGrid]}
	options={{
		resources: resources,
		firstDay: 1,
		nowIndicator: true,
		flexibleSlotTimeLimits: true,
		slotMinTime: '08:00',
		slotMaxTime: '20:00',

		headerToolbar: {
			start: 'title',
			center: '',
			end: 'resourceTimelineDay today prev,next'
		},
		view: 'resourceTimelineWeek',
		views: {
			timeGridWeek: { pointer: true }
		},
		events: impegni.map((impegno) => {
			return {
				id: impegno.id,
				title: impegno.nome,
				start: moment(impegno.dataInizio).toDate(),
				end: moment(impegno.dataFine).toDate(),
				resourceIds: impegno.aule.map((aula) => aula.id)
			};
		})
	}}
/>
