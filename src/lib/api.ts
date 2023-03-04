export type { Aula, Impegno } from './types';
import type { Aula, Impegno } from './types';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const UNIBO_CLIENT = '5ad08435b6ca5357dbac609e';

const API_URL = 'https://apache.prod.up.cineca.it/api';
const AULE_URL = API_URL + '/Aule/getAulePerCalendarioPubblico';
const IMPEGNI_URL = API_URL + '/Impegni/getImpegniCalendarioPubblico';

export async function getAule(
	fetch: typeof window.fetch,
	linkCalendarioId: string,
	clienteId = UNIBO_CLIENT,
	order = 'edificio.codice, descrizione',
	limit = 250
): Promise<Aula[]> {
	return await fetch(AULE_URL, {
		method: 'POST',
		credentials: 'omit',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			linkCalendarioId,
			clienteId,
			order,
			auleIds: [],
			edificiIds: [],
			limit
		})
	}).then((res) => res.json());
}
export async function getImpegni(
	fetch: typeof window.fetch,
	linkCalendarioId: string,
	{
		dataFine,
		dataInizio,
		clienteId = UNIBO_CLIENT,
		limitaRisultati = false,
		mostraImpegniAnnullati = false,
		mostraIndisponibilitaTotali = true,
		aule = []
	}: {
		dataFine: Dayjs;
		dataInizio: Dayjs;
		clienteId?: string;
		limitaRisultati?: boolean;
		mostraImpegniAnnullati?: boolean;
		aule: string[];
		mostraIndisponibilitaTotali?: boolean;
	}
): Promise<Impegno[]> {
	return await fetch(IMPEGNI_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			linkCalendarioId,
			clienteId,
			dataInizio,
			dataFine,
			aule,
			limitaRisultati,
			mostraImpegniAnnullati,
			mostraIndisponibilitaTotali,
			pianificazioneTemplate: false
		})
	}).then((res) => res.json());
}

export async function impegnoAule({
	fetch,
	codice
}: {
	fetch: typeof window.fetch;
	codice: string;
}) {
	const aule = await getAule(fetch, codice);

	const impegni = await getImpegni(fetch, codice, {
		dataInizio: dayjs().subtract(1, 'day'),
		dataFine: dayjs().add(1, 'day'),
		aule: aule.map((aula) => aula.codice)
	});

	return { aule, impegni };
}
