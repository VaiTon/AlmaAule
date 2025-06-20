import dayjs from 'dayjs';
import { getAule, getImpegni } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, url }) => {
	const calIds = Object.values(CAL_MAP).map((cal) => cal.id);

	const dayParam = url.searchParams.get('day');
	const day = dayParam ?? dayjs().format('YYYY-MM-DD');
	const startOfDay = dayjs(day).startOf('day');
	const endOfDay = dayjs(day).endOf('day');

	let impegni = await getImpegni(fetch, params.calId, {
		dataInizio: startOfDay,
		dataFine: endOfDay,
		idAule: []
	});

	return { impegni };
};
