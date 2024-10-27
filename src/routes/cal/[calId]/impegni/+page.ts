import dayjs from 'dayjs';
import { getAule, getImpegni } from '$lib/api';
import { CAL_MAP } from '$lib/cals';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const calIds = Object.values(CAL_MAP).map((cal) => cal.id);

	let impegni = await getImpegni(fetch, params.calId, {
		dataInizio: dayjs().subtract(1, 'day'),
		dataFine: dayjs().add(1, 'day'),
		idAule: []
	});

	return { impegni };
};
