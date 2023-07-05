export type Aula = {
	id: string;
	capienza: number;
	metriQuadri: number;
	numeroPostazioni: number;
	codice: string;
	descrizione: string;
	dataCreazione: string;
	dataModifica: string;
	piano: Piano;
	edificio: Pick<Edificio, 'codice' | 'comune'>;
	relazioneEdificio: Edificio;
};
export type Piano = {
	codice: string;
	descrizione: string;
};

export type Edificio = {
	comune: string;
	provincia: string;
	cap: string;
	via: string;
	plesso: string;
	metriQuadri: number;
	geo: {
		lat: number;
		lng: number;
	};
	id: string;
	dataCreazione: string;
	dataModifica: string;
	attivo: boolean;
	bloccato: boolean;
	codice: string;
	descrizione: string;
	extCode: string;
	clienteId: string;
	utenteCreazioneId: string;
	utenteModificaId: string;
};

export type Impegno = {
	id: string;
	annoCorso?: string;
	attivo: boolean;
	clienteId: string;
	dataInizio: string;
	dataFine: string;
	dataCreazione: string;
	nome: string;
	nome_EN: string;
	stato: string;
	aule: Aula[];
};
