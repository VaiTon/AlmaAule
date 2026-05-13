import { createUPClient, type Edificio } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const calendars = CAL_MAP;
	const client = createUPClient(fetch);

	const aulePromises = calendars.map(async (cal) => {
		const aule = await client.getAule(cal.id);
		if ('error' in aule) {
			return [];
		}
		return aule;
	});

	const edifici: Promise<Edificio[]> = Promise.all(aulePromises).then((it) => {
		const allAule = it.flat();
		const edificiMap = new Map<string, Edificio>();

		for (const aula of allAule) {
			if (aula.relazioneEdificio && aula.relazioneEdificio.geo) {
				edificiMap.set(aula.relazioneEdificio.id, aula.relazioneEdificio);
			}
		}

		return Array.from(edificiMap.values()).sort((a, b) =>
			a.descrizione.localeCompare(b.descrizione)
		);
	});

	return { edifici };
};
