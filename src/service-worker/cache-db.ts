export interface CacheDBOptions {
	databaseName: string;
	storeName: string;
	databaseVersion: number;
	expirationMs: number;
	maxEntries: number;
	debug: boolean;
}

export interface CacheRecord {
	body: string;
	headers: Record<string, string>;
	status: number;
	statusText: string;
	timestamp: number;
	lastAccessed: number;
}

type CacheRecordInput = Omit<CacheRecord, 'lastAccessed'>;

const nextAccessTime = (() => {
	let lastAccessedAt = 0;
	return () => {
		lastAccessedAt = Math.max(Date.now(), lastAccessedAt + 0.001);
		return lastAccessedAt;
	};
})();

/** IndexedDB cache with expiration and least-recently-used eviction. */
export class CacheDB {
	private dbPromise: Promise<IDBDatabase> | null = null;

	constructor(private readonly options: CacheDBOptions) {}

	private getDB(): Promise<IDBDatabase> {
		if (this.dbPromise) return this.dbPromise;

		this.dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.options.databaseName, this.options.databaseVersion);
			request.onupgradeneeded = () => {
				const db = request.result;
				const transaction = request.transaction;
				if (!transaction) return;

				const store = db.objectStoreNames.contains(this.options.storeName)
					? transaction.objectStore(this.options.storeName)
					: db.createObjectStore(this.options.storeName);

				this.upgradeStore(store);
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => {
				this.dbPromise = null; // Reset on error to allow retry
				reject(request.error);
			};
		});

		return this.dbPromise;
	}

	private upgradeStore(store: IDBObjectStore): void {
		if (store.indexNames.contains('lastAccessed')) return;

		store.createIndex('lastAccessed', 'lastAccessed');
		const cursorRequest = store.openCursor();
		cursorRequest.onsuccess = () => {
			const cursor = cursorRequest.result;
			if (!cursor) {
				this.pruneEntries(store);
				return;
			}

			const record = cursor.value as CacheRecord;
			const lastAccessed =
				typeof record.lastAccessed === 'number' ? record.lastAccessed : record.timestamp;
			if (lastAccessed !== record.lastAccessed) {
				cursor.update({ ...record, lastAccessed });
			}
			cursor.continue();
		};
	}

	private pruneEntries(store: IDBObjectStore, keepKey?: IDBValidKey): void {
		const countRequest = store.count();
		countRequest.onsuccess = () => {
			let entriesToRemove = countRequest.result - this.options.maxEntries;
			if (entriesToRemove <= 0) return;

			const cursorRequest = store.index('lastAccessed').openCursor();
			cursorRequest.onsuccess = () => {
				const cursor = cursorRequest.result;
				if (!cursor || entriesToRemove <= 0) return;

				if (cursor.primaryKey === keepKey) {
					// Preserve an entry just written, even when access timestamps tie.
					cursor.continue();
					return;
				}

				cursor.delete();
				entriesToRemove -= 1;
				if (this.options.debug) {
					console.debug('[SW] Evicted least recently used API cache entry');
				}
				cursor.continue();
			};
		};
	}

	async get(key: string): Promise<CacheRecord | undefined> {
		const db = await this.getDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.options.storeName, 'readwrite');
			const store = transaction.objectStore(this.options.storeName);
			const request = store.get(key);
			let result: CacheRecord | undefined;

			request.onsuccess = () => {
				const cached = request.result as CacheRecord | undefined;
				if (!cached) return;

				if (Date.now() - cached.timestamp < this.options.expirationMs) {
					cached.lastAccessed = nextAccessTime();
					store.put(cached, key);
					result = cached;
				} else {
					store.delete(key);
				}
			};

			transaction.oncomplete = () => resolve(result);
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
	}

	async set(key: string, value: CacheRecordInput): Promise<void> {
		const db = await this.getDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.options.storeName, 'readwrite');
			const store = transaction.objectStore(this.options.storeName);
			const request = store.put({ ...value, lastAccessed: nextAccessTime() }, key);

			request.onsuccess = () => this.pruneEntries(store, key);

			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
	}
}
