import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { createUPClient } from '#lib/api/index.ts';

export const load: PageLoad = async ({ fetch, params }) => {
	const client = createUPClient(fetch);
	const aule = await client.getAule(params.calId, {
		auleIds: [params.aulaId]
	});

	if ('error' in aule) {
		error(aule.error.statusCode, `Errore nel recupero dell'aula: ${aule.error.codiceErrore}`);
	}

	const aula = aule.find((a) => a.id === params.aulaId);
	if (aula == null) {
		error(404, 'Aula non trovata');
	}

	return { aula };
};
