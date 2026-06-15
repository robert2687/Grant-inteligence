## 2025-05-14 - [Memoization & Filter Optimization]
**Learning:** In components with frequent re-renders (like those using global context and internationalization), un-memoized array filtering and repeated string operations (e.g., `.toLowerCase()`) inside loops can cause noticeable UI lag, especially as the data set grows. Pre-calculating search terms outside the filter loop and wrapping the logic in `useMemo` significantly reduces unnecessary computation.
**Action:** Always wrap complex filter/map logic in `useMemo` and pull invariant string transformations out of loops when optimizing React components in this codebase.

## 2025-05-14 - [Lockfile Discipline]
**Learning:** Introducing alternative package manager artifacts (like `bun.lock`) into a project that primarily uses another (e.g., `npm` or `pnpm`) is a significant anti-pattern that creates noise and potential CI/CD breakages. Even if using alternative runtimes for local verification due to environmental issues, ensure no secondary lockfiles are committed.
**Action:** Explicitly check for and remove any `bun.lock` or `yarn.lock` files before submitting if the project is npm/pnpm based.

## 2026-06-15 - [State Initialization & Array Memoization]
**Learning:** Using lazy initialization for `useState` (e.g., `useState(() => initialValue)`) in components with large default objects or expensive ID generation (like `crypto.randomUUID()`) prevents redundant work on every re-render. Additionally, memoizing navigation arrays (like `navItems`) that depend on translation functions (`t`) ensures reference stability and avoids unnecessary re-allocations in frequently-rendering global layouts.
**Action:** Default to lazy state initialization for complex objects and memoize navigation arrays in global layout components.
