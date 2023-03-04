import { impegnoAule } from '$lib/api';
import type { PageLoad } from './$types';

const CODICE_MATE = '5f0310d366e423001758ae01';

export const load = (async ({ fetch }) =>
	impegnoAule({ fetch, codice: CODICE_MATE })) satisfies PageLoad;
