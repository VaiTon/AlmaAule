import type { Aula, Impegno } from './api';
import dayjs from 'dayjs';

export function getActualImpegniAule(
	aule: Aula[],
	impegni: Impegno[],
	time: dayjs.Dayjs = dayjs()
) {
	return aule.map((aula) => ({
		aula,
		impegno: getImpegnoAula(impegni, aula, time)
	}));
}

function getImpegnoAula(impegni: Impegno[], aula: Aula, time: dayjs.Dayjs): Impegno | undefined {
	return impegni.find(
		(impegno) =>
			impegno.aule.some((a) => a.id === aula.id) &&
			dayjs(impegno.dataInizio).isBefore(time) &&
			dayjs(impegno.dataFine).isAfter(time)
	);
}
