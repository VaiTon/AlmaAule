import { getAule } from '$lib/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const aule = await getAule(fetch, params.calId);
	const aula = aule.find((a) => a.id === params.aulaId);

	return json(aula);
};
