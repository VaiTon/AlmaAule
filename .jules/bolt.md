## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-22 - [Optimize Classroom Filtering in src/routes/aule/+page.svelte]

**Learning:** Performing `O(n log n)` array sorting and `O(n)` string concatenations/lowercasing inside Svelte component render cycles (e.g. inside a `$derived` or `{@const}` block dependent on fast-changing user input) causes severe performance degradation and layout thrashing, as it reruns every keystroke.
**Action:** Pre-compute lowercase search keys and pre-sort arrays in the `+page.ts` load function before passing data to the Svelte component. Use `$derived` for just lowercasing the search query once per keystroke, and perform a simple `O(n)` filter using `.includes()` in the template.

## 2025-04-07 - Pre-compute properties to avoid expensive ops in reactivity blocks

**Learning:** In Svelte 5, variables updated by `setInterval` (like `currentTime`) trigger reactivity blocks (like `{@const}`) and re-renders very frequently. Running O(n log n) sorts or creating instances of libraries like `dayjs` within these reactive templates creates significant CPU overhead, especially with large lists like classrooms.
**Action:** Always pre-compute formats (e.g., `dayjs` strings) and pre-sort lists once inside `$derived` or initial data loading. Filter operations are cheap, but sorts and object allocations should be moved out of the hot path.

## 2024-05-24 - Pre-compute Derived State for Fast-Changing Templates

**Learning:** In Svelte components with fast-changing reactive state (like `setInterval` timers ticking every minute), evaluating complex formatting (like `dayjs` instantiation, duration humanization) or calling `.sort()` inline inside `{#each}` loops causes significant re-rendering overhead and unnecessary allocations. Calling `.sort()` directly on the loop iterable is especially bad as it mutates the array in place and reruns O(n log n) sorting on every render cycle.
**Action:** Always pre-compute and attach formatted strings (e.g. `{startFormatted}`, `{durationHuman}`) and perform pre-sorting inside a `$derived` block. This ensures expensive operations are computed only when the underlying source data changes, not every time a disconnected reactive interval timer triggers a DOM update.
