import type { Aula, Impegno } from './api';
import dayjs from 'dayjs';

export function getActualImpegniAule(
	aule: Aula[],
	impegni: Impegno[],
	time: dayjs.Dayjs = dayjs()
) {
	// Pre-compute the target time in milliseconds to avoid repeated calls in the loop
	const timeMs = time.valueOf();

	return aule.map((aula) => ({
		aula,
		impegno: getImpegnoAula(impegni, aula, timeMs)
	}));
}

function getImpegnoAula(impegni: Impegno[], aula: Aula, timeMs: number): Impegno | undefined {
	return impegni.find(
		(impegno) =>
			impegno.aule.some((a) => a.id === aula.id) &&
			// Native Date comparison is significantly faster than creating dayjs objects in a tight loop
			new Date(impegno.dataInizio).getTime() < timeMs &&
			new Date(impegno.dataFine).getTime() > timeMs
	);
}
