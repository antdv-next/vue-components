# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue Components (`@v-c/*`) is a pnpm monorepo providing 42 headless Vue 3 component primitives. These are the unstyled foundation that antdv-next wraps with Ant Design styling.

**Maintainer:** User has direct push access.

## Structure

42 packages under `packages/`, each with: `src/`, `tests/`, `docs/` (Histoires stories), `dist/`.

Core: `util`, `input`, `select`, `table`, `dialog`, `dropdown`, `menu`, `tooltip`, `trigger`, `virtual-list`, etc.

## Common Commands

```bash
pnpm dev              # Start Histoires storybook dev server
pnpm test             # Run all Vitest tests (jsdom)
pnpm test:u           # Update snapshots
pnpm lint             # ESLint check + fix (@antfu/eslint-config)
```

## Build

Each package builds independently via Vite (no Turbo). Output: ESM only, `preserveModules: true`.

Build config shared via `scripts/vite.package.ts` → `definePackageConfig()`. Each package's `vite.config.ts` is a one-liner: `export default definePackageConfig()`.

- `external` is derived automatically: `vue`, `@v-c/*`, plus every entry in the package's `dependencies`/`peerDependencies`. A dep imported from `src/` but not declared in `package.json` gets bundled into `dist` silently, so always declare it.
- Entries default to `src/**/*.{ts,tsx,vue}` minus test files. Override with `entries: [...]` (only `overflow` does, single entry).
- `packageRoot` defaults to `process.cwd()`, so run `vite build` from the package directory (`pnpm run -r build` does).

## Release

Each package versioned independently via `bumpp`. No monorepo-wide release.

## Component Conventions

- Vue 3 Composition API + TSX
- All packages peer-depend on `vue` and may depend on `@v-c/util`
- TypeScript strict mode, ES2020 target
- Path aliases: `@v-c/*` → `packages/*/src` (configured in tsconfig.json)
- Function refs that resolve a component's exposed element MUST use `createElementRef` from `@v-c/util/dist/vnode` — never resolve eagerly in the callback (breaks on vue ≥3.5.39). See `docs/function-ref-element-resolve.md`

## Relationship to antdv-next

- antdv-next depends on all `@v-c/*` packages
- When antdv-next bugs trace to `@v-c/*`, fix at source here
- After fixing, bump version and update antdv-next's dependencies
