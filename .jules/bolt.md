## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-28 - [Pre-computing string operations for search lists]

**Learning:** Computations inside Svelte `$derived` or derived blocks run on every dependency update (like keystrokes in a search input). Performing string allocations and array sorting during these renders causes performance bottlenecks (O(N log N) time on every keystroke). Pre-computing search keys and pre-sorting arrays when data is fetched instead of during render cycles drastically improves list rendering performance.
**Action:** Always pre-compute derived strings and sort arrays once when data is fetched (e.g., inside a `$derived` Promise mapping), and use simple string search logic in fast-changing user input hot loops.
