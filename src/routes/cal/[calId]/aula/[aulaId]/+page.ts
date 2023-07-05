import { getAule, getImpegni } from '$lib/api';
import dayjs from 'dayjs';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { calId, aulaId } = params;

	const aule = await getAule(fetch, calId);
	const aula = aule.find((a) => a.id === aulaId);

	const impegni = await getImpegni(fetch, calId, {
		dataInizio: dayjs().subtract(1, 'day'),
		dataFine: dayjs().add(1, 'day'),
		idAule: [aulaId]
	});

	return {
		aula,
		impegni
	};
};
