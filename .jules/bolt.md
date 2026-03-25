## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2024-03-20 - [Pre-computing sorting keys for hot loops in Svelte]
**Learning:** Performing string allocations like `toLowerCase()` and `.sort()` mutations repeatedly inside a Svelte render cycle (such as filtering an array on every keystroke in an input) can introduce unnecessary lag. This can be resolved by mapping over the array to add `_searchKey` properties when the data is first resolved from its Promise.
**Action:** When working with Svelte components dependent on fast-changing `$state` inputs, leverage `$derived` arrays to pre-compute sort keys and pre-sort data before it reaches the component render logic. Only use simple `.filter` operations that do `.includes(searchLower)` directly inside the `{:then}` block or `{#each}` loops.
