import { getAule, getImpegni } from '$lib/api';
import dayjs from 'dayjs';
import type { PageLoad } from './$types';

const CODICE_ING = '5e9996a228a649001237296d';
const CODICE_MATE = '5f0310d366e423001758ae01';

const MAP = {
	ingegneria: CODICE_ING,
	matematica: CODICE_MATE
} as Record<string, string>;

export const load: PageLoad = async ({ fetch, params }) => {
	const { dash } = params;

	const calId = MAP[dash];
	if (!calId) throw new Error('Calendario non trovato');

	const aule = await getAule(fetch, CODICE_ING);
	const impegni = await getImpegni(fetch, CODICE_ING, {
		aule: aule.map((a) => a.id),
		dataFine: dayjs().add(1, 'day'),
		dataInizio: dayjs().subtract(1, 'day')
	});

	return {
		calId: CODICE_ING,
		impegni,
		aule
	};
};
