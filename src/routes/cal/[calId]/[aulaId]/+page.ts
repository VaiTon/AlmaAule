import { getAule, getImpegni } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import dayjs from 'dayjs';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const aule = await getAule(fetch, params.calId);
	const aula = aule.find((a) => a.id === params.aulaId);
	if (aula == null) {
		error(404, 'Aula non trovata');
	}

	let impegni = getImpegni(fetch, params.calId, {
		dataInizio: dayjs().subtract(1, 'week'),
		dataFine: dayjs().add(1, 'month'),
		idAule: [aula.id]
	}).then((impegni) =>
		impegni.filter((impegno) =>
			impegno.risorse.some((risorsa) => 'aulaId' in risorsa && risorsa.aulaId === aula.id)
		)
	);

	return { aula, impegni };
};
