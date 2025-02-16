import type { Dayjs } from 'dayjs';
import type { Impegno } from './types';
import { API_URL, UNIBO_CLIENT } from './const';

const IMPEGNI_URL = API_URL + '/Impegni/getImpegniCalendarioPubblico';

export async function getImpegni(
	fetch: (url: string, init?: RequestInit) => Promise<Response>,
	idCal: string,
	{
		dataFine,
		dataInizio,
		limitaRisultati = false,
		mostraImpegniAnnullati = false,
		mostraIndisponibilitaTotali = true,
		idAule = []
	}: {
		dataFine: Dayjs;
		dataInizio: Dayjs;
		limitaRisultati?: boolean;
		mostraImpegniAnnullati?: boolean;
		idAule: string[];
		mostraIndisponibilitaTotali?: boolean;
	}
): Promise<Impegno[]> {
	return fetch(IMPEGNI_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			linkCalendarioId: idCal,
			clienteId: UNIBO_CLIENT,
			dataInizio,
			dataFine,
			auleIds: idAule,
			aule: idAule,
			limitaRisultati,
			mostraImpegniAnnullati,
			mostraIndisponibilitaTotali,
			pianificazioneTemplate: false
		})
	}).then((res) => res.json());
}
