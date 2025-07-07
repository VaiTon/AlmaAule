import { getAule } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const aule = await getAule(fetch, params.calId, {
		auleIds: [params.aulaId]
	});

	const aula = aule.find((a) => a.id === params.aulaId);
	if (aula == null) {
		error(404, 'Aula non trovata');
	}

	return { aula };
};
