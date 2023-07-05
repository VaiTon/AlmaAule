import { API_URL, UNIBO_CLIENT } from './const';
import type { Aula } from './types';

const AULE_URL = API_URL + '/Aule/getAulePerCalendarioPubblico';

export async function getAule(
	fetch: (url: string, init?: RequestInit) => Promise<Response>,
	idCalendario: string,
	order = 'edificio.codice, descrizione',
	limit = 250
): Promise<Aula[]> {
	return fetch(AULE_URL, {
		method: 'POST',
		credentials: 'omit',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			linkCalendarioId: idCalendario,
			clienteId: UNIBO_CLIENT,
			order,
			auleIds: [],
			edificiIds: [],
			limit
		})
	}).then((res) => res.json());
}
