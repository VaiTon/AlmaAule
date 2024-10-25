import { getAule, getImpegni } from '$lib/api';
import dayjs from 'dayjs';
import type { PageLoad } from './$types';
import { CAL_MAP } from '$lib/cals';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params, setHeaders }) => {
	const { dash } = params;

	const cal = CAL_MAP.find((c) => c.id === dash);
	if (cal == null) error(400, 'Calendario non trovato');

	const { id } = cal;

	const aule = await getAule(fetch, id);
	if (aule == null) {
		error(500, 'Aule non trovate');
	}

	const impegni = getImpegni(fetch, id, {
		aule: aule.map((a) => a.id),
		dataFine: dayjs().add(1, 'day'),
		dataInizio: dayjs().subtract(1, 'day')
	});

	// Cache for 1 day
	setHeaders({ 'Cache-Control': 'max-age=86400' });

	return { cal, impegni, aule };
};
