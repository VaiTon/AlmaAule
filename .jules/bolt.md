## 2024-05-19 - Pre-compute Search Keys in Svelte 5

**Learning:** When using reactive computed properties inside Svelte 5 (`$derived` or `{@const}` blocks in the template), complex string operations (like `.toLowerCase()`) and `.sort()` on arrays inside the template get executed on every render cycle triggered by user input (e.g., search text changes). This leads to O(N log N) sorting overhead and high memory allocation for large arrays (like 2000 classrooms), causing the UI to stutter on each keystroke.

**Action:** Extract the complex `sort` and `toLowerCase` string transformation outside the reactive loop that depends on the fast-changing input (`search` variable). Pre-compute the search keys (e.g., `_searchKey: sortingName(a).toLowerCase()`) and sort the array exactly once when the source data (`aule`) resolves. Inside the Svelte 5 `{@const}` block, perform only an O(N) `.filter()` utilizing the pre-computed keys, dramatically improving UI responsiveness during searches.
