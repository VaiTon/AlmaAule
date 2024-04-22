import { getAule, getImpegni } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import dayjs from 'dayjs';
import { CAL_MAP } from '$lib/cals';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, setHeaders }) => {
	const calIds = Object.values(CAL_MAP).map((cal) => cal.id);

	const aule = await Promise.all(
		calIds.map(async (calId) => {
			return await getAule(fetch, calId).then((aule) => aule.map((a) => ({ ...a, calId })));
		})
	).then((aule) => aule.flat());

	const aula = aule.find((a) => a.id === params.aulaId);

	if (aula == null) {
		error(404, 'Aula non trovata');
	}

	let impegni = await getImpegni(fetch, aula.calId, {
		dataInizio: dayjs().subtract(2, 'day'),
		dataFine: dayjs().add(1, 'week'),
		idAule: [aula.id]
	});

	impegni = impegni.filter((impegno) =>
		impegno.risorse.some((risorsa) => 'aulaId' in risorsa && risorsa.aulaId === aula.id)
	);

	// Cache for 30 min
	setHeaders({ 'Cache-Control': 'max-age=1800' });

	return { aula, impegni };
};
