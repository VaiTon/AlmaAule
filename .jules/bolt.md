## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]
**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.
