## 2025-05-14 - [Memoization & Filter Optimization]
**Learning:** In components with frequent re-renders (like those using global context and internationalization), un-memoized array filtering and repeated string operations (e.g., `.toLowerCase()`) inside loops can cause noticeable UI lag, especially as the data set grows. Pre-calculating search terms outside the filter loop and wrapping the logic in `useMemo` significantly reduces unnecessary computation.
**Action:** Always wrap complex filter/map logic in `useMemo` and pull invariant string transformations out of loops when optimizing React components in this codebase.

## 2025-05-14 - [Lockfile Discipline]
**Learning:** Introducing alternative package manager artifacts (like `bun.lock`) into a project that primarily uses another (e.g., `npm` or `pnpm`) is a significant anti-pattern that creates noise and potential CI/CD breakages. Even if using alternative runtimes for local verification due to environmental issues, ensure no secondary lockfiles are committed.
**Action:** Explicitly check for and remove any `bun.lock` or `yarn.lock` files before submitting if the project is npm/pnpm based.

## 2025-05-15 - [Lazy State Initialization & Memoized Lookups]
**Learning:** Found a recurring pattern where components like `ProjectManager` and `UserProfile` were evaluating expensive initial states (including `crypto.randomUUID()`) and performing $O(n)$ array searches on every render cycle. While React only uses the initial state on mount, evaluating it every time wastes CPU cycles.
**Action:** Use lazy initialization functions for `useState` when the initial value involves object creation or function calls. Always memoize array lookups that depend on props or context to avoid redundant searches during re-renders.
