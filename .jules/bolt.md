## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-24 - [Optimize Search Filtering in Aule List]
**Learning:** Svelte's reactivity in template blocks (`{@const}`) means any operations on a list inside a reactive loop or block will be re-executed when its dependencies change. In the aule list, using `aule.sort(sortAule).filter(filterAule)` inside a block dependent on `search` input meant an O(N log N) sort operation and multiple string allocations (`toLowerCase()`) were being executed *on every keystroke*. Furthermore, `Array.prototype.sort()` mutates the original array in place, which is a subtle side effect.
**Action:** When filtering a large list based on user input, extract the sorting and string transformation logic. Map the items to include pre-computed lowercase search keys and sort this mapped array *once* when the data is first loaded (e.g., in a `{@const}` block that only depends on the fetched data). Then, the `search` input changes only trigger a fast O(N) `.filter` over the pre-computed keys.
