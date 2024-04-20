export type Aula = {
	capienza: number;
	divisoreCapienza: number;
	capienzaEffettiva: number;

	numeroPostazioni: number;
	codice: string;
	descrizione: string;
	dataCreazione: string;
	dataModifica: string;
	piano: Piano;

	edificio: Pick<
		Edificio,
		| 'orarioChiusura'
		| 'orarioApertura'
		| 'orarioAperturaWeekend'
		| 'orarioChiusuraWeekend'
		| 'codice'
		| 'comune'
	>;
	edificioId: string;
	relazioneEdificio: Edificio;

	extCode: string;

	fotoUrl: string | null;

	id: string;

	mappaUrl: string | null;
	metriQuadri: number;

	unitaOrganizzativa: UnitaOrganizzativa;
};
export type Piano = {
	codice: string;
	descrizione: string;
};

export type Edificio = {
	orarioChiusura: string;
	orarioApertura: string;
	orarioAperturaWeekend: string | null;
	orarioChiusuraWeekend: string | null;
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

type Risorsa = {
	risorsaId: string;
} & (
	| {
			docenteId: string;
			docente: {
				nome: string;
				cognome: string;
				id: string;
			};
	  }
	| {
			aulaId: string;
	  }
);

export type Impegno = {
	risorse: Risorsa[];
	evento: {
		tipoAttivita: {
			descrizione: string;
		};
	};
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

export type UnitaOrganizzativa = {};
const x: Aula = {
	capienza: 250,
	piano: { codice: '229_WP02', descrizione: 'Piano Secondo' },
	metriQuadri: 108.59,
	numeroPostazioni: 250,
	tipoAulaId: '5dc3ed7874895700123a9c61',
	tipoAula: { codice: 'AULA', descrizione: 'AULA' },
	mappaUrl: null,
	planimetriaUrl: null,
	serviziAulaId: ['618e5fbca3f996dc957568a4'],
	id: '5dc565c1b2285f0011f8277e',
	unitaOrganizzativaId: '5dc3ed4c74895700123a8b46',
	contestiId: [
		'5dca8048fb75b4001163905b',
		'5dd25f0ac5342c0011fb6c0a',
		'5dd3a4328cef9e00116eb94a',
		'5dd504a37640370012d1dc35',
		'5dd7df113a037b001231ebcb',
		'5e5196bda805a50017799e96',
		'63fdc7828e562302519d92be',
		'5dce8e862ffce70012d02973'
	],
	utenteCreazioneId: '5dc2de876904b9bd4c70a30b',
	utenteModificaId: '5dc2de876904b9bd4c70a30b',
	dataCreazione: '2019-11-08T12:55:28.975Z',
	dataModifica: '2023-10-05T22:35:52.026Z',
	attivo: true,
	bloccato: true,
	codice: '229_WP02_004',
	descrizione: 'AULA PINCHERLE',
	extCode: '229_WP02_004',
	edificioId: '5dc3ed5c74895700123a916c',
	pianoId: '5dc3ed6774895700123a968c',
	clienteId: '5ad08435b6ca5357dbac609e',
	contestiConConfermaId: [],
	contestiSpecificiId: [
		'5dca8048fb75b4001163905b',
		'5dd25f0ac5342c0011fb6c0a',
		'5dd3a4328cef9e00116eb94a',
		'5dd504a37640370012d1dc35',
		'5e5196bda805a50017799e96',
		'63fdc7828e562302519d92be',
		'5dce8e862ffce70012d02973'
	],
	contestiConConfermaSpecificiId: [],
	abilitato: true,
	capienzaEffettiva: 150,
	divisoreCapienza: 1,
	tolleranza: 0,
	edificio: {
		codice: '229',
		comune: 'Bologna',
		orarioApertura: '08:00',
		orarioChiusura: '20:30',
		orarioAperturaWeekend: null,
		orarioChiusuraWeekend: null
	},
	fotoUrl: null,
	unitaOrganizzativa: {
		oreAccademiche: 60,
		modalitaPropagazioneContesti: [
			{
				Corso_contesti: false,
				Aula_contesti: true,
				Aula_contestiConConferma: false,
				RisorsaMobile_contesti: false,
				Utente_contesti: false,
				Utente_contestiVisibilita: false,
				contestoId: '5dd7df113a037b001231ebcb',
				Evento_contesti: true
			}
		],
		id: '5dc3ed4c74895700123a8b46',
		dataCreazione: '2019-11-07T10:09:16.640Z',
		dataModifica: '2019-11-07T10:09:16.640Z',
		attivo: true,
		bloccato: true,
		codice: '1050573',
		descrizione: 'APAT - AREA DEL PATRIMONIO',
		extCode: '1050573',
		clienteId: '5ad08435b6ca5357dbac609e',
		utenteCreazioneId: '5dc2de876904b9bd4c70a30b',
		utenteModificaId: '5dc2de876904b9bd4c70a30b',
		contestiId: ['5dd7df113a037b001231ebcb'],
		abilitato: true
	},
	relazioneEdificio: {
		comune: 'Bologna',
		provincia: 'Bologna',
		cap: '40126',
		via: 'Piazza di Porta San Donato, 5',
		plesso: 'ZAMBONI',
		metriQuadri: 8776.26,
		geo: { lat: 44.4982759, lng: 11.3557804 },
		id: '5dc3ed5c74895700123a916c',
		dataCreazione: '2019-11-07T10:09:32.035Z',
		dataModifica: '2024-03-05T23:35:20.429Z',
		attivo: true,
		bloccato: true,
		codice: '229',
		descrizione: 'Edificio in Bo - p.zza di Porta San Donato 5',
		extCode: '229',
		clienteId: '5ad08435b6ca5357dbac609e',
		utenteCreazioneId: '5dc2de876904b9bd4c70a30b',
		utenteModificaId: '5dc2de876904b9bd4c70a30b',
		orarioApertura: '08:00',
		orarioChiusura: '20:30'
	}
};
