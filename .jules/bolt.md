## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-22 - [Optimize Classroom Filtering in src/routes/aule/+page.svelte]

**Learning:** Performing `O(n log n)` array sorting and `O(n)` string concatenations/lowercasing inside Svelte component render cycles (e.g. inside a `$derived` or `{@const}` block dependent on fast-changing user input) causes severe performance degradation and layout thrashing, as it reruns every keystroke.
**Action:** Pre-compute lowercase search keys and pre-sort arrays in the `+page.ts` load function before passing data to the Svelte component. Use `$derived` for just lowercasing the search query once per keystroke, and perform a simple `O(n)` filter using `.includes()` in the template.
