import { getAule, type Aula } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

type CalendarAula = Aula & { calId: string };

export const load: PageLoad = async ({ fetch }) => {
	const calendars = CAL_MAP;

	const aulePromises = calendars.map(async (cal) => {
		let aule = await getAule(fetch, cal.id);
		return aule.map((a) => ({ ...a, calId: cal.id }));
	});
	const aule: CalendarAula[] = (await Promise.all(aulePromises)).flat();

	// deduplicate based on id
	const auleMap = new Map<string, CalendarAula>();
	for (const aula of aule) {
		auleMap.set(aula.id, aula);
	}
	let dedupAule = Array.from(auleMap.values());

	return { aule: dedupAule };
};
