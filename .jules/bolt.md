## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-24 - [Pre-compute search keys and pre-sort in Load function]

**Learning:** Computations like sorting and string allocations (like `toLowerCase()`) inside `{@const}` blocks that map to `$state` bindings (like `search`) in Svelte will run on every keystroke. This causes O(n log n) sorting and memory allocations every time the user types.
**Action:** Pre-compute lowercase search keys and pre-sort static lists directly inside the data fetching phase (e.g., in `+page.ts` `load` function) instead of computing them dynamically on every render cycle.
