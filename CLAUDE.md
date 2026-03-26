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

Build config shared via `scripts/build.common.ts` → `buildCommon()` factory.

## Release

Each package versioned independently via `bumpp`. No monorepo-wide release.

## Component Conventions

- Vue 3 Composition API + TSX
- All packages peer-depend on `vue` and may depend on `@v-c/util`
- TypeScript strict mode, ES2020 target
- Path aliases: `@v-c/*` → `packages/*/src` (configured in tsconfig.json)

## Relationship to antdv-next

- antdv-next depends on all `@v-c/*` packages
- When antdv-next bugs trace to `@v-c/*`, fix at source here
- After fixing, bump version and update antdv-next's dependencies
