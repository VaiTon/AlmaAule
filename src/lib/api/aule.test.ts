import test from 'node:test';
import assert from 'node:assert';
import { getAule } from './aule';

test('getAule success', async () => {
	const mockFetch = async () =>
		({
			json: async () => [{ id: 1, descrizione: 'Aula 1' }]
		}) as unknown as Response;

	const aule = await getAule(mockFetch, 'cal123');
	assert.deepStrictEqual(aule, [{ id: 1, descrizione: 'Aula 1' }]);
});

test('getAule handles null response', async () => {
	const mockFetch = async () =>
		({
			json: async () => null
		}) as unknown as Response;

	await assert.rejects(
		async () => {
			await getAule(mockFetch, 'cal123');
		},
		{
			name: 'Error',
			message: 'Error fetching aule: response is null or undefined'
		}
	);
});

test('getAule handles API error response', async () => {
	const mockFetch = async () =>
		({
			json: async () => ({
				error: {
					statusCode: 500,
					codiceErrore: 'TEST_ERROR'
				}
			})
		}) as unknown as Response;

	await assert.rejects(
		async () => {
			await getAule(mockFetch, 'cal123');
		},
		{
			name: 'Error',
			message: 'Error fetching aule: TEST_ERROR: 500'
		}
	);
});
