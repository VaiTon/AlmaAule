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
	const timeDate = time.toDate(); // convert to native Date once
	return impegni.find(
		(impegno) =>
			impegno.aule.some((a) => a.id === aula.id) &&
			new Date(impegno.dataInizio) < timeDate &&
			new Date(impegno.dataFine) > timeDate
	);
}
