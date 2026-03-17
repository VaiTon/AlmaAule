type Impegno = {
	nome: string;
	dataInizio: string;
	dataFine: string;
	causaleIndisponibilita?: string;
};

type TimelineEvent = {
	resId: string;
	startTime: Date;
	endTime: Date;
	title: string;
	impegno: Impegno;
};

const getCurrentActivity = (events: TimelineEvent[], resId: string, time: Date) => {
	const currentEvent = events.find(
		(e) => e.resId === resId && e.startTime <= time && e.endTime >= time
	);
	return currentEvent;
};

const getNextActivity = (events: TimelineEvent[], resourceId: string, time: Date) => {
	const futureEvents = events
		.filter((e) => e.resId === resourceId && e.startTime > time)
		.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
	return futureEvents[0];
};

const getNextActivityOptimized = (resEvents: TimelineEvent[], time: Date) => {
	return resEvents.find((e) => e.startTime > time); // Since it's pre-sorted
};

const getCurrentActivityOptimized = (resEvents: TimelineEvent[], time: Date) => {
	return resEvents.find((e) => e.startTime <= time && e.endTime >= time);
};

// Generate test data
const numResources = 100;
const eventsPerResource = 50;
const events: TimelineEvent[] = [];
const resources = Array.from({ length: numResources }, (_, i) => `res-${i}`);

for (let r = 0; r < numResources; r++) {
	for (let e = 0; e < eventsPerResource; e++) {
		const start = new Date(Date.now() + Math.random() * 10000000);
		const end = new Date(start.getTime() + 3600000); // 1 hour later
		events.push({
			resId: `res-${r}`,
			startTime: start,
			endTime: end,
			title: `Event ${e}`,
			impegno: {} as Impegno
		});
	}
}
// Shuffle events
events.sort(() => Math.random() - 0.5);

const time = new Date(Date.now() + 5000000);

console.time('Baseline');
for (let i = 0; i < 100; i++) {
	for (const resId of resources) {
		getCurrentActivity(events, resId, time);
		getNextActivity(events, resId, time);
	}
}
console.timeEnd('Baseline');

console.time('Optimized (including grouping/sorting)');
for (let i = 0; i < 100; i++) {
	const grouped = new Map<string, TimelineEvent[]>();
	for (const e of events) {
		let arr = grouped.get(e.resId);
		if (!arr) {
			arr = [];
			grouped.set(e.resId, arr);
		}
		arr.push(e);
	}
	for (const resEvents of grouped.values()) {
		resEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
	}

	for (const resId of resources) {
		const resEvents = grouped.get(resId) || [];
		getCurrentActivityOptimized(resEvents, time);
		getNextActivityOptimized(resEvents, time);
	}
}
console.timeEnd('Optimized (including grouping/sorting)');
