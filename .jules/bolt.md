## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-24 - [Optimize Search Filtering in Classroom List (+page.svelte)]

**Learning:** Computations inside Svelte `{@const}` blocks run on every render/keystroke. Using an expensive sequence like `.sort().filter()` inside an `{#await}` block's `{:then}` block forces repeated object stringification and sorting on each search input change.
**Action:** When filtering a large list in Svelte components, pre-compute static searchable properties (like a concatenated `searchKey` converted to lowercase) and pre-sort the list once via a `$derived` Promise, reducing the render-loop operation to a single $O(N)$ `.includes()` filter.
