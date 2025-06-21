import dayjs from 'dayjs';
import { getAule, getImpegni } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, url }) => {
	const cal = CAL_MAP.find((c) => c.id === params.calId);
	if (cal == null) {
		error(404, `Calendario con id ${params.calId} non trovato`);
	}

	const dayParam = url.searchParams.get('day');
	const day = dayParam ?? dayjs().format('YYYY-MM-DD');
	const startOfDay = dayjs(day).startOf('day');
	const endOfDay = dayjs(day).endOf('day');

	const aule = getAule(fetch, params.calId);

	const impegni = getImpegni(fetch, params.calId, {
		dataInizio: startOfDay,
		dataFine: endOfDay,
		idAule: []
	});

	return {
		aule: await aule,
		impegni: impegni,
		cal
	};
};
