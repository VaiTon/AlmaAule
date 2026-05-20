import { error } from '@sveltejs/kit';
import dayjs from 'dayjs';

import { CAL_MAP } from '$lib/cals';

import type { PageLoad } from './$types';
import { createUPClient } from '$lib/api';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const cal = CAL_MAP.find((c) => c.id === params.calId);
	if (cal == null) {
		error(404, `Calendario con id ${params.calId} non trovato`);
	}

	const dayParam = url.searchParams.get('day');
	const day = dayParam ?? dayjs().format('YYYY-MM-DD');
	const startOfDay = dayjs(day).startOf('day');
	const endOfDay = dayjs(day).endOf('day');

	const client = createUPClient(fetch);

	const aulePromise = client.getAule(params.calId);

	const impegniPromise = client.getImpegni(params.calId, {
		dataInizio: startOfDay,
		dataFine: endOfDay,
		idAule: []
	});

	const [aule, impegni] = await Promise.all([aulePromise, impegniPromise]);
	if ('error' in aule) {
		error(
			aule.error.statusCode,
			`Errore ${aule.error.codiceErrore} durante il recupero delle aule`
		);
	} else if ('error' in impegni) {
		error(
			impegni.error.statusCode,
			`Errore ${impegni.error.codiceErrore} durante il recupero degli impegni`
		);
	}

	return { aule: aule, impegni: impegni, cal };
};
