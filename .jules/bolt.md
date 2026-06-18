## 2025-05-14 - [Memoization & Filter Optimization]
**Learning:** In components with frequent re-renders (like those using global context and internationalization), un-memoized array filtering and repeated string operations (e.g., `.toLowerCase()`) inside loops can cause noticeable UI lag, especially as the data set grows. Pre-calculating search terms outside the filter loop and wrapping the logic in `useMemo` significantly reduces unnecessary computation.
**Action:** Always wrap complex filter/map logic in `useMemo` and pull invariant string transformations out of loops when optimizing React components in this codebase.

## 2025-05-14 - [Lockfile Discipline]
**Learning:** Introducing alternative package manager artifacts (like `bun.lock`) into a project that primarily uses another (e.g., `npm` or `pnpm`) is a significant anti-pattern that creates noise and potential CI/CD breakages. Even if using alternative runtimes for local verification due to environmental issues, ensure no secondary lockfiles are committed.
**Action:** Explicitly check for and remove any `bun.lock` or `yarn.lock` files before submitting if the project is npm/pnpm based.

## 2025-05-14 - [Lazy State Initialization]
**Learning:** In components with complex initial state objects or those that generate unique identifiers (e.g., `crypto.randomUUID()`) in their default state, using the standard `useState(initialValue)` causes the value to be re-calculated or re-allocated on every single render cycle, even though it's only used once. Passing an initializer function `useState(() => initialValue)` ensures the expensive or redundant setup only happens during the initial mount.
**Action:** Use lazy initializer functions for `useState` when the initial value involves object literals, UUID generation, or array searches.
