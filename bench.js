const N_RESOURCES = 100;
const N_EVENTS = 10000;
const ITERATIONS = 100;

// Setup mock data
const resources = Array.from({ length: N_RESOURCES }, (_, i) => ({ id: `res-${i}` }));
const events = Array.from({ length: N_EVENTS }, (_, i) => ({
	id: `evt-${i}`,
	resourceId: `res-${Math.floor(Math.random() * N_RESOURCES)}`
}));

function benchmarkCurrent() {
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		for (const resource of resources) {
			const resourceEvents = events.filter((e) => e.resourceId === resource.id) || [];
			// Do something trivial so it's not optimized away
			if (resourceEvents.length > -1) continue;
		}
	}
	const end = performance.now();
	return end - start;
}

function benchmarkOptimized() {
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		// Mock $derived grouping
		const eventsByResource = events ? Object.groupBy(events, (e) => e.resourceId) : {};
		for (const resource of resources) {
			const resourceEvents = eventsByResource[resource.id] || [];
			if (resourceEvents.length > -1) continue;
		}
	}
	const end = performance.now();
	return end - start;
}

console.log(
	`Running benchmark... (${N_RESOURCES} resources, ${N_EVENTS} events, ${ITERATIONS} iterations)`
);

// Warmup
benchmarkCurrent();
benchmarkOptimized();

const currentAvg = benchmarkCurrent();
console.log(`Current (O(N*M)) approach: ${currentAvg.toFixed(2)} ms`);

const optAvg = benchmarkOptimized();
console.log(`Optimized (Object.groupBy) approach: ${optAvg.toFixed(2)} ms`);
console.log(`Improvement: ${(currentAvg / optAvg).toFixed(2)}x faster`);
