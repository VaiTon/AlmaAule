import { getImpegni } from '$lib/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dayjs from 'dayjs';

export const GET: RequestHandler = async ({ params, url }) => {
	const queryParams = new URLSearchParams(url.search);

	const dataInizio = queryParams.has('dataInizio')
		? dayjs(queryParams.get('dataInizio'))
		: dayjs().subtract(1, 'day');

	const dataFine = queryParams.has('dataFine')
		? dayjs(queryParams.get('dataFine'))
		: dayjs().add(1, 'day');

	const impegni = await getImpegni(fetch, params.calId, {
		dataInizio,
		dataFine,
		idAule: [params.aulaId]
	});

	const veriImpegni = impegni.filter((i) => i.aule.map((a) => a.id).includes(params.aulaId));

	return json(veriImpegni);
};
