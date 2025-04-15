import { getAule, getImpegni } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/it';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Rome');
dayjs.locale('it');

export const ssr = false;

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
