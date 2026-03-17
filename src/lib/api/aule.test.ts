import { describe, it, expect } from 'vitest';
import { getAule } from './aule';

describe('getAule', () => {
	it('success', async () => {
		const mockFetch = async () =>
			({
				json: async () => [{ id: 1, descrizione: 'Aula 1' }]
			}) as unknown as Response;

		const aule = await getAule(mockFetch, 'cal123');
		expect(aule).toEqual([{ id: 1, descrizione: 'Aula 1' }]);
	});

	it('handles null response', async () => {
		const mockFetch = async () =>
			({
				json: async () => null
			}) as unknown as Response;

		await expect(getAule(mockFetch, 'cal123')).rejects.toThrowError(
			'Error fetching aule: response is null or undefined'
		);
	});

	it('handles API error response', async () => {
		const mockFetch = async () =>
			({
				json: async () => ({
					error: {
						statusCode: 500,
						codiceErrore: 'TEST_ERROR'
					}
				})
			}) as unknown as Response;

		await expect(getAule(mockFetch, 'cal123')).rejects.toThrowError(
			'Error fetching aule: TEST_ERROR: 500'
		);
	});
});
