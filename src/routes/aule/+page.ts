import { getAule, type Aula } from '$lib/api';
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

	const aulePromises = calendars.map(async (cal) => {
		let aule: Aula[] = [];
		try {
			aule = await getAule(fetch, cal.id);
		} catch (error) {
			console.error(`Error fetching aule for calendar ${cal.id}:`, error);
		}

		// Add calId and pre-computed searchKey to each aula
		return aule.map((a) => {
			const sortingName = `${a.relazioneEdificio.comune} - ${a.relazioneEdificio.plesso} - ${a.descrizione}`;
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
			// Pre-sort the array using the searchKey to avoid O(n log n) sorting during render cycles
			it.sort((a, b) => a.searchKey.localeCompare(b.searchKey))
		);

	return { aule };
};
