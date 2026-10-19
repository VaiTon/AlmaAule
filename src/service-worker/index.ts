import { dev, version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';
import { CacheDB } from './cache-db';

const DB_NAME = 'api-cache-db';
const STORE_NAME = 'responses';
const DB_VERSION = 2;
const CACHE_EXPIRATION_MS = 60 * 1000; // 1 minute
const CACHE_MAX_ENTRIES = 100;
const precachedFiles = [...assets, ...immutable, ...prerendered].map((asset) => asset.path);

const db = new CacheDB({
	databaseName: DB_NAME,
	storeName: STORE_NAME,
	databaseVersion: DB_VERSION,
	expirationMs: CACHE_EXPIRATION_MS,
	maxEntries: CACHE_MAX_ENTRIES,
	debug: dev
});
const API_BASE_URL = 'https://apache.prod.up.cineca.it/api';

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(`app-cache-${version}`).then((cache) => cache.addAll(precachedFiles))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.filter((key) => key !== `app-cache-${version}`).map((key) => caches.delete(key))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
	const url = new URL(event.request.url);

	// Intercept POST requests to the University Planner API
	if (event.request.method === 'POST' && url.href.startsWith(API_BASE_URL)) {
		event.respondWith(handleApiRequest(event.request));
		return;
	}

	// Serve static assets from Cache API
	if (event.request.method === 'GET' && precachedFiles.includes(url.pathname)) {
		event.respondWith(
			caches.match(event.request).then((response) => response || fetch(event.request))
		);
	}
});

async function handleApiRequest(request: Request): Promise<Response> {
	// We must clone the request before reading the body to avoid consuming it
	const clonedRequest = request.clone();
	const body = await clonedRequest.text();
	const cacheKey = `${request.url}|${body}`;

	try {
		const cached = await db.get(cacheKey);
		if (cached) {
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
