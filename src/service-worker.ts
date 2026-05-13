/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const DB_NAME = 'api-cache-db';
const STORE_NAME = 'responses';
const CACHE_VERSION = 1;
const CACHE_EXPIRATION_MS = 60 * 1000; // 1 minute

interface CacheRecord {
	body: string;
	headers: Record<string, string>;
	status: number;
	statusText: string;
	timestamp: number;
}

/**
 * Promisified IndexedDB wrapper with a singleton connection promise.
 */
class CacheDB {
	private dbPromise: Promise<IDBDatabase> | null = null;

	private getDB(): Promise<IDBDatabase> {
		if (this.dbPromise) return this.dbPromise;

		this.dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, CACHE_VERSION);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME);
				}
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => {
				this.dbPromise = null; // Reset on error to allow retry
				reject(request.error);
			};
		});

		return this.dbPromise;
	}

	async get(key: string): Promise<CacheRecord | undefined> {
		const db = await this.getDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(key);
			request.onsuccess = () => resolve(request.result as CacheRecord | undefined);
			request.onerror = () => reject(request.error);
		});
	}

	async set(key: string, value: CacheRecord): Promise<void> {
		const db = await this.getDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(value, key);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}

const db = new CacheDB();
const API_BASE_URL = 'https://apache.prod.up.cineca.it/api';

sw.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(`app-cache-${version}`).then((cache) => cache.addAll([...build, ...files]))
	);
	sw.skipWaiting();
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.filter((key) => key !== `app-cache-${version}`).map((key) => caches.delete(key))
			);
		})
	);
	sw.clients.claim();
});

sw.addEventListener('fetch', (event: FetchEvent) => {
	const url = new URL(event.request.url);

	// Intercept POST requests to the University Planner API
	if (event.request.method === 'POST' && url.href.startsWith(API_BASE_URL)) {
		event.respondWith(handleApiRequest(event.request));
		return;
	}

	// Serve static assets from Cache API
	if (
		event.request.method === 'GET' &&
		(build.includes(url.pathname) || files.includes(url.pathname))
	) {
		event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
	}
});

async function handleApiRequest(request: Request): Promise<Response> {
	// We must clone the request before reading the body to avoid consuming it
	const clonedRequest = request.clone();
	const body = await clonedRequest.text();
	const cacheKey = `${request.url}|${body}`;

	try {
		const cached = await db.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
			const headers = new Headers(cached.headers);
			headers.set('X-From-Service-Worker', 'true');
			return new Response(cached.body, {
				status: cached.status,
				statusText: cached.statusText,
				headers
			});
		}
	} catch (e) {
		console.error('[SW] Cache read error:', e);
	}

	const response = await fetch(request);

	// Only cache successful JSON responses
	if (response.ok) {
		const clonedResponse = response.clone();
		try {
			const responseBody = await clonedResponse.text();
			const headers: Record<string, string> = {};
			clonedResponse.headers.forEach((value, key) => {
				headers[key] = value;
			});

			await db.set(cacheKey, {
				body: responseBody,
				headers,
				status: clonedResponse.status,
				statusText: clonedResponse.statusText,
				timestamp: Date.now()
			});
		} catch (e) {
			console.error('[SW] Cache write error:', e);
		}
	}

	return response;
}
