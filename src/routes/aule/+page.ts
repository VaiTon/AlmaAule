import { getAule, type Aula } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const calendars = CAL_MAP;

	const aule = await Promise.all(calendars.map(async (cal) => await getAule(fetch, cal.id)));

	// deduplicate based on id
	const auleMap = new Map<string, Aula>();
	aule.flat().forEach((aula) => auleMap.set(aula.id, aula));

	let auleList = Array.from(auleMap.values());

	return {
		aule: auleList
	};
};
