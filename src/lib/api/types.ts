export type Aula = {
	capienza: number;
	divisoreCapienza: number;
	capienzaEffettiva: number;

	numeroPostazioni: number;
	codice: string;
	descrizione: string;
	dataCreazione: string;
	dataModifica: string;
	piano: Piano | null;

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

export type ServizioAulaCategoria = {
	_id: string;
	codice: string;
	descrizione: string;
	extCode?: string;
	abilitato: boolean;
	bloccato: boolean;
	dataCreazione: string;
	dataModifica: string;
	attivo: boolean;
	clienteId: string;
	utenteCreazioneId: string;
	utenteModificaId: string;
	visibile?: boolean;
};

export type ServizioAula = {
	_id: string;
	codice: string;
	descrizione: string;
	descrizione_EN?: string;
	extCode?: string;
	dataCreazione: string;
	dataModifica: string;
	attivo: boolean;
	bloccato: boolean;
	categoriaServizioId: string;
	clienteId: string;
	utenteCreazioneId: string;
	utenteModificaId: string;
	icona?: string;
	descrizioneBreve?: string;
	descrizioneBreve_EN?: string;
	categoriaServizio: ServizioAulaCategoria;
};

export type Piano = {
	codice: string;
	descrizione: string;
};

export type SovrapposizioneDocente = {
	_id: string;
	nome: string;
	cognome: string;
	codiceFiscale: string;
	matricola: string;
	flagDocente: boolean;
	ruoli: Record<string, unknown>;
	abilitato: boolean;
	realm: string;
	email: string;
	dataCreazione: string;
	dataModifica: string;
	attivo: boolean;
	bloccato: boolean;
	codice: string;
	extCode: string;
	clienteId: string;
	utenteCreazioneId: string;
	utenteModificaId: string;
	fonteEsterna: string;
	unitaOrganizzativaId: string;
};

export type Sovrapposizione = {
	id?: string;
	risorsaId: string;
	accettata: boolean;
	note: string;
	indisponibilita: boolean;
	aulaId: string | null;
	docenteId: string | null;
	risorsaMobileId: string | null;
	impegnoId?: string;
	docente?: SovrapposizioneDocente;
};

export type Risorsa = {
	risorsaId: string;
	dataLookup: string;
	aulaId: string | null;
	docenteId: string | null;
	risorsaMobileId: string | null;
	prenotazione?: unknown;
	aula?: Aula;
	docente?: {
		nome: string;
		cognome: string;
		id: string;
	};
};

export type EventoTipoAttivita = {
	codice: string;
	descrizione: string;
	defaultDurataImpegni: number | null;
	abilitato: boolean;
};

export type EventoDettaglioDidattico = {
	id: string;
	codice: string;
	nome: string;
	nome_EN: string;
	descrizione: string;
	annoCorso: number | null;
	annoOrdinamento: number;
	cfu: number;
	totaleOre: number;
	partizione: string | null;
	obbligatorio: boolean | null;
	tipoInsegnamento: string | null;
	modalitaDidattica: string;
	unitaOrganizzativaId: string;
	corsoId: string;
	percorsoId: string;
	calendarioId: string;
	fattoreDiPartizioneId: string | null;
	sedeId: string;
	tipoCorsoId: string | null;
	contestiId: string[];
	codiceAF: string;
	corso: EventoCorso;
	unitaOrganizzativa: UnitaOrganizzativa;
	percorso: EventoPercorso;
	calendario: EventoCalendario;
	sede: EventoSede;
};

export type EventoCorso = {
	anteRiforma: boolean;
	tipoCorsoId: string;
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
	unitaOrganizzativaId: string;
	abilitato: boolean;
	tipoCorso: {
		_id: string;
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
	id: string;
};

export type EventoPercorso = {
	annoOrdinamento: number;
	annoRegolamento: number;
	corsoId: string;
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
	id: string;
};

export type EventoCalendario = {
	dataInizio: string;
	dataFine: string;
	dataCreazione: string;
	dataModifica: string;
	attivo: boolean;
	bloccato: boolean;
	codice: string;
	descrizione: string;
	extCode: string;
	corsoId: string;
	annoAccademicoId: string;
	clienteId: string;
	utenteCreazioneId: string;
	utenteModificaId: string;
	tipoCalendario: string;
	id: string;
};

export type EventoSede = {
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
	abilitato: boolean;
	id: string;
};

export type Evento = {
	_id: string;
	tipoAttivita: EventoTipoAttivita;
	numeroImpegni: number;
	numeroImpegniTemplate: number;
	orePianificate: number;
	oreEffettivePianificate: number;
	monteOreRaggiunto: boolean;
	extCode: string;
	propagaNoteAImpegni: boolean;
	lingua: string;
	tipoEventoId: string;
	responsabiliId: string[];
	responsabileDidatticaId: string | null;
	dataCreazione: string;
	dataModifica: string;
	attivo: boolean;
	bloccato: boolean;
	dettagliDidattici: EventoDettaglioDidattico[];
	sede?: EventoSede;
	calendario?: EventoCalendario;
	unitaOrganizzativa?: UnitaOrganizzativa;
	corso?: EventoCorso;
	percorso?: EventoPercorso;
	annoAccademicoId?: string;
	coperturaDocenti?: {
		docenteId: string;
		totaleOre: number;
		orePianificate: number;
		oreEffettivePianificate: number;
	}[];
	clienteId?: string;
	utenteCreazioneId?: string;
	utenteModificaId?: string;
	contestiId?: string[];
	contestiMasterId?: string[];
	numeroImpegniPubblicati?: number;
	numeroImpegniAnnullati?: number;
	numeroImpegniSospesi?: number;
	numeroImpegniConfermati?: number;
	numeroImpegniBozza?: number;
	numeroImpegniTemplatePubblicati?: number;
	monteOreDocentiRaggiunto?: boolean;
	numeroImpegniTemplateBozza?: number;
	abilitato?: boolean;
	dataMaxImpPubblicato?: string;
	dataMinImpPubblicato?: string;
	dataModificaPeriodo?: string;
	annoAccademico?: {
		_id: string;
		dataInizio: string;
		dataFine: string;
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
	tipoEvento: {
		_id: string;
		tipiAttivita: EventoTipoAttivita[];
		attivitaDidattica: boolean;
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
		icona: string;
		visibileCreatoreImpegniPersonali: boolean;
		colonneDettagliDidattici: Record<string, boolean>;
	};
	responsabili: { nome: string; cognome: string; id: string }[];
};

export type Warning = {
	risorsaDaConfermare: number;
	sovrapposizione: number;
	senzaRisorse: boolean;
	sovrapposizioniSospensione?: boolean;
};

export type Impegno = {
	id: string;
	dataInizio: string;
	dataFine: string;
	indisponibilita: boolean;
	indisponibilitaTotale: boolean;
	indisponibilitaTotaleAule: boolean;
	oreAccademiche: number;
	oreAccademicheBloccate: boolean;
	stato: string;
	orarioInizio: string;
	orarioFine: string;
	invioMassivoSbk: boolean;
	eventoId: string;
	dataCreazione: string;
	dataModifica: string;
	attivo: boolean;
	contestiApplicabilitaId: string[];
	serieId: string;
	risorse: Risorsa[];
	sovrapposizioni: Sovrapposizione[];
	clienteId: string;
	utenteCreazioneId: string;
	utenteModificaId: string;
	contestiId: string[];
	contestiMasterId: string[];
	sovrapposizioniSospensione: unknown[];
	notaSospensione: string | null;
	evento: Evento;
	nome: string;
	nome_EN: string;
	codiceAttivita: string;
	annoCorso: number | null;
	corsi: EventoCorso[];
	percorsi: EventoPercorso[];
	calendari: EventoCalendario[];
	sedi: EventoSede[];
	fattoreDiPartizione: unknown[];
	aule: Aula[];
	docenti: { nome: string; cognome: string; id: string }[];
	risorseMobili: unknown[];
	edifici: Edificio[];
	icona: string;
	tipoEvento: Evento['tipoEvento'];
	tipoAttivita: EventoTipoAttivita;
	warning: Warning;
	causaleIndisponibilita?: string;
	dataMaxImpPubblicato?: string;
	dataMinImpPubblicato?: string;
	dataModificaPeriodo?: string;
};

export type UnitaOrganizzativa = {
	_id?: string;
	dataCreazione?: string;
	dataModifica?: string;
	attivo?: boolean;
	bloccato?: boolean;
	codice?: string;
	descrizione?: string;
	extCode?: string;
	clienteId?: string;
	utenteCreazioneId?: string;
	utenteModificaId?: string;
	oreAccademiche?: number;
	abilitato?: boolean;
};
