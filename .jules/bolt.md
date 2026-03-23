## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-22 - [Optimize Searching and Sorting Classrooms]

**Learning:** Performing array sorts, string concatenations, and multiple `toLowerCase()` conversions directly in Svelte `{@const}` expressions or derived blocks dependent on fast-changing user input (like a search bar) triggers repeated high-cost execution.
**Action:** When filtering or sorting data based on text input, pre-compute a lowercase search key and pre-sort the array exactly once when the data arrives (e.g., inside a `$derived` Promise mapping), so that the render cycle only performs a fast `includes` check on pre-computed values.
