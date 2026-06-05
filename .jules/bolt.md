## 2025-05-14 - [Memoization & Filter Optimization]
**Learning:** In components with frequent re-renders (like those using global context and internationalization), un-memoized array filtering and repeated string operations (e.g., `.toLowerCase()`) inside loops can cause noticeable UI lag, especially as the data set grows. Pre-calculating search terms outside the filter loop and wrapping the logic in `useMemo` significantly reduces unnecessary computation.
**Action:** Always wrap complex filter/map logic in `useMemo` and pull invariant string transformations out of loops when optimizing React components in this codebase.

## 2025-05-14 - [Lockfile Discipline]
**Learning:** Introducing alternative package manager artifacts (like `bun.lock`) into a project that primarily uses another (e.g., `npm` or `pnpm`) is a significant anti-pattern that creates noise and potential CI/CD breakages. Even if using alternative runtimes for local verification due to environmental issues, ensure no secondary lockfiles are committed.
**Action:** Explicitly check for and remove any `bun.lock` or `yarn.lock` files before submitting if the project is npm/pnpm based.

## 2025-05-15 - [React Context Stabilization]
**Learning:** React Context Providers without memoized values cause all consumers to re-render whenever the provider's parent re-renders, even if the actual state hasn't changed. Stabilizing both the 'value' object with useMemo and functional updaters with useCallback is critical for preventing application-wide render cascades.
**Action:** Always wrap Context.Provider values in useMemo and ensure all functional updaters passed through context are wrapped in useCallback.
