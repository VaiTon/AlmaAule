import { getAule, type Aula } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

function deduplicateAule(aule: Aula[]) {
	const auleMap = new Map<string, Aula>();
	for (const aula of aule) {
		auleMap.set(aula.id, aula);
	}
	return Array.from(auleMap.values());
}

export const load: PageLoad = async ({ fetch }) => {
	const calendars = CAL_MAP;

	const aulePromises = calendars.map((cal) => getAule(fetch, cal.id));
	const aule = (await Promise.all(aulePromises)).flat();

	// deduplicate based on id
	const dedupAule = deduplicateAule(aule);

	return { aule: dedupAule };
};
