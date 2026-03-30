## 2025-03-18 - [Optimize Event Filtering in AulaWeekTimeline.svelte]

**Learning:** Native Date comparison is significantly faster than instantiating dayjs objects in hot loops or tight loops.
**Action:** Use native Date parsing in hot loops instead of dayjs objects when possible, and compute interval boundaries (like start and end of week) once before the loop.

## 2025-03-22 - [Optimize Event Filtering in AulaWeekTimeline.svelte template]

**Learning:** Computations inside Svelte `{@const}` blocks run frequently and should avoid unnecessary allocations. Replacing `dayjs(date).isSame(other)` with native `Date` comparisons (`getDate()`, `getMonth()`, `getFullYear()`) in loops avoids significant instantiation overhead, drastically improving rendering performance for large lists of events.
**Action:** Use native `Date` operations for comparisons and hour/minute extraction instead of instantiating `dayjs` objects in hot loops or tight template blocks (`$derived`, `{@const}`, `{#each}`).

## 2025-03-22 - [Pre-computing static data behind derived promises]

**Learning:** Svelte `{:then}` blocks re-render when derived dependencies (like `$derived(search)`) change. Running expensive array sorts or string manipulations (like `toLowerCase()` and `.localeCompare()`) on large lists inside the template (`{:then aule}` with `{@const sorted = aule.sort(...) }`) degrades rendering performance drastically.
**Action:** For lists dependent on user input (e.g., search fields), map raw resolved data into a pre-processed array via `$derived(dataPromise.then(...))` that pre-computes sorting logic and normalized search keys *once*, and filter against this structure in the template using a single derived `searchLower` key.
