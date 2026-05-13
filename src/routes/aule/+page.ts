import { createUPClient, type Aula } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

export type CalendarAula = Aula & { calId: string; searchKey: string };

function deduplicate(aule: CalendarAula[]) {
	const auleMap = new Map<string, CalendarAula>();
	for (const aula of aule) {
		auleMap.set(aula.id, aula);
	}
	return Array.from(auleMap.values());
}

export const load: PageLoad = async ({ fetch }) => {
	const calendars = CAL_MAP;

	const client = createUPClient(fetch);

	const aulePromises = calendars.map(async (cal) => {
		const aule = await client.getAule(cal.id);
		if ('error' in aule) {
			console.warn(
				`Failed to fetch aule for calendar ${cal.id}: ${aule.error.codiceErrore} (status ${aule.error.statusCode})`
			);
			return [];
		}

		// Add calId and pre-computed searchKey to each aula
		return aule.map((a) => {
			const sortingName = `${a.relazioneEdificio.comune} - ${a.relazioneEdificio.via} - ${a.relazioneEdificio.plesso} - ${a.descrizione}`;
			return {
				...a,
				calId: cal.id,
				searchKey: sortingName.toLowerCase()
			};
		});
	});

	const aule: Promise<CalendarAula[]> = Promise.all(aulePromises)
		.then((it) => it.flat())
		.then((it) => deduplicate(it))
		.then((it) =>
			// Pre-sort the array using the searchKey
			it.sort((a, b) => a.searchKey.localeCompare(b.searchKey))
		);

	return { aule };
};
