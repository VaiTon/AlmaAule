import { getAule, getImpegni } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import dayjs from 'dayjs';
import { CAL_MAP } from '$lib/cals';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, setHeaders }) => {
	const calIds = Object.values(CAL_MAP).map((cal) => cal.id);

	let impegni = await getImpegni(fetch, params.dash, {
		dataInizio: dayjs().subtract(2, 'day'),
		dataFine: dayjs().add(1, 'week'),
		idAule: []
	});

	return { impegni };
};
