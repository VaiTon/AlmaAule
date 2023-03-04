export type Aula = {
	id: string;
	capienza: number;
	metriQuadri: number;
	numeroPostazioni: number;
	codice: string;
	descrizione: string;
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
