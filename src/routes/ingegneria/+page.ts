import { impegnoAule } from '$lib/api';
import type { PageLoad } from './$types';

const CODICE_ING = '5e9996a228a649001237296d';

export const load = (async ({ fetch }) =>
	impegnoAule({ fetch, codice: CODICE_ING })) satisfies PageLoad;
