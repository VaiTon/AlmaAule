import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { getActualImpegniAule } from './impegni';
import type { Aula, Impegno } from './api';

describe('getActualImpegniAule', () => {
	const mockAula1: Aula = { id: 'a1', codice: 'Aula 1' } as Aula;
	const mockAula2: Aula = { id: 'a2', codice: 'Aula 2' } as Aula;

	const now = dayjs('2024-03-10T10:00:00Z');

	it('returns empty array when both aule and impegni are empty', () => {
		const result = getActualImpegniAule([], [], now);
		expect(result).toEqual([]);
	});

	it('returns aule with undefined impegni when there are no impegni', () => {
		const result = getActualImpegniAule([mockAula1, mockAula2], [], now);
		expect(result).toEqual([
			{ aula: mockAula1, impegno: undefined },
			{ aula: mockAula2, impegno: undefined }
		]);
	});

	it('maps correctly when an impegno is currently active in an aula', () => {
		const activeImpegno: Impegno = {
			id: 'i1',
			dataInizio: '2024-03-10T09:00:00Z',
			dataFine: '2024-03-10T11:00:00Z',
			aule: [mockAula1]
		} as unknown as Impegno;

		const result = getActualImpegniAule([mockAula1, mockAula2], [activeImpegno], now);
		expect(result).toEqual([
			{ aula: mockAula1, impegno: activeImpegno },
			{ aula: mockAula2, impegno: undefined }
		]);
	});

	it('returns undefined impegno when the impegno has already ended', () => {
		const pastImpegno: Impegno = {
			id: 'i2',
			dataInizio: '2024-03-10T08:00:00Z',
			dataFine: '2024-03-10T09:30:00Z',
			aule: [mockAula1]
		} as unknown as Impegno;

		const result = getActualImpegniAule([mockAula1], [pastImpegno], now);
		expect(result).toEqual([{ aula: mockAula1, impegno: undefined }]);
	});

	it('returns undefined impegno when the impegno has not started yet', () => {
		const futureImpegno: Impegno = {
			id: 'i3',
			dataInizio: '2024-03-10T10:30:00Z',
			dataFine: '2024-03-10T12:00:00Z',
			aule: [mockAula1]
		} as unknown as Impegno;

		const result = getActualImpegniAule([mockAula1], [futureImpegno], now);
		expect(result).toEqual([{ aula: mockAula1, impegno: undefined }]);
	});

	it('maps multiple impegni to multiple aule correctly', () => {
		const impegno1: Impegno = {
			id: 'i1',
			dataInizio: '2024-03-10T09:00:00Z',
			dataFine: '2024-03-10T11:00:00Z',
			aule: [mockAula1]
		} as unknown as Impegno;

		const impegno2: Impegno = {
			id: 'i2',
			dataInizio: '2024-03-10T08:00:00Z',
			dataFine: '2024-03-10T12:00:00Z',
			aule: [mockAula2]
		} as unknown as Impegno;

		const pastImpegno: Impegno = {
			id: 'i3',
			dataInizio: '2024-03-10T07:00:00Z',
			dataFine: '2024-03-10T09:00:00Z',
			aule: [mockAula1]
		} as unknown as Impegno;

		const result = getActualImpegniAule(
			[mockAula1, mockAula2],
			[pastImpegno, impegno1, impegno2],
			now
		);
		expect(result).toEqual([
			{ aula: mockAula1, impegno: impegno1 },
			{ aula: mockAula2, impegno: impegno2 }
		]);
	});

	it('assigns the same impegno to multiple aule if it takes place in multiple aule', () => {
		const sharedImpegno: Impegno = {
			id: 'i1',
			dataInizio: '2024-03-10T09:00:00Z',
			dataFine: '2024-03-10T11:00:00Z',
			aule: [mockAula1, mockAula2]
		} as unknown as Impegno;

		const result = getActualImpegniAule([mockAula1, mockAula2], [sharedImpegno], now);
		expect(result).toEqual([
			{ aula: mockAula1, impegno: sharedImpegno },
			{ aula: mockAula2, impegno: sharedImpegno }
		]);
	});
});
