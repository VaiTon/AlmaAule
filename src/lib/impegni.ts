import type { Aula, Impegno } from './api';
import dayjs, { Dayjs } from 'dayjs';

export function getActualImpegniAule({
	aule,
	impegni,
	time = dayjs()
}: {
	aule: Aula[];
	impegni: Impegno[];
	time?: Dayjs;
}) {
	return aule.map((aula) => ({
		aula,
		impegno: getImpegnoAula(impegni, aula, time)
	}));
}

function getImpegnoAula(impegni: Impegno[], aula: Aula, time: Dayjs): Impegno | undefined {
	const aulaId = aula.id;
	return impegni.find(
		(impegno) =>
			impegno.aule.some((aula) => aula.id === aulaId) &&
			dayjs(impegno.dataInizio).isBefore(time) &&
			dayjs(impegno.dataFine).isAfter(time)
	);
}
