import { API_URL, UNIBO_CLIENT } from './const';
import type { Aula } from './types';

const AULE_URL = API_URL + '/Aule/getAulePerCalendarioPubblico';

export async function getAule(
	fetch: (url: string, init?: RequestInit) => Promise<Response>,
	idCalendario: string,
	options: { order?: string; limit?: number; auleIds?: string[] } = {}
): Promise<Aula[]> {
	const resp = (await fetch(AULE_URL, {
		method: 'POST',
		credentials: 'omit',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			linkCalendarioId: idCalendario,
			clienteId: UNIBO_CLIENT,
			order: options.order ?? 'edificio.codice, descrizione',
			auleIds: options.auleIds ?? [],
			edificiIds: [],
			limit: options.limit ?? 250
		})
	}).then((res) => res.json())) as Aula[] | { error: { statusCode: number; codiceErrore: string } };

	if ('error' in resp) {
		throw new Error(`Error fetching aule: ${resp.error.codiceErrore}: ${resp.error.statusCode}`);
	}

	return resp;
}
