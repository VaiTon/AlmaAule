## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-22 - [Pre-compute dayjs formats in Timeline.svelte]
**Learning:** Instantiating `dayjs` objects and calling `.format()` inside of Svelte `{#each}` loops for every single item causes significant overhead during render and re-render cycles.
**Action:** When mapping or grouping items in a `$derived` block before rendering, pre-compute all expensive derived string properties (like formatted times or duration strings) and store them on the items, so the template only performs property lookups (`{event.formattedStart}`) instead of executing logic.
