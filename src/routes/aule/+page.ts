import { getAule, type Aula } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

type CalendarAula = Aula & { calId: string };

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

		// Add calId to each aula
		return aule.map((a) => ({ ...a, calId: cal.id }));
	});

	let aule: Promise<CalendarAula[]> = Promise.all(aulePromises)
		.then((it) => it.flat())
		.then((it) => deduplicate(it));

	return { aule };
};
