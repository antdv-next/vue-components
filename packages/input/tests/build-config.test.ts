import { resolve } from 'node:path'
import { normalizePath } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
// @ts-expect-error exported as part of the build path fix.
import { buildCommon, resolveBuildEntries, resolveBuildPaths } from '../../../scripts/build.common'

const repoRoot = process.cwd()
const packageRoot = resolve(repoRoot, 'packages/input')
const originalCwd = process.cwd()

afterEach(() => {
  process.chdir(originalCwd)
})

describe('build config path resolution', () => {
  it('resolves package build paths independently from cwd', () => {
    process.chdir(repoRoot)
    const fromRepoRoot = resolveBuildPaths(packageRoot)

    process.chdir(packageRoot)
    const fromPackageRoot = resolveBuildPaths(packageRoot)

    expect(fromRepoRoot).toEqual(fromPackageRoot)
    expect(fromRepoRoot).toEqual({
      packageRoot: normalizePath(packageRoot),
      inputDir: normalizePath(resolve(packageRoot, 'src')),
      outDir: normalizePath(resolve(packageRoot, 'dist')),
      tsconfigPath: normalizePath(resolve(packageRoot, 'tsconfig.json')),
    })
  })

  it('collects absolute lib entries from the package root regardless of cwd', () => {
    const patterns = ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/*.test.tsx', '!src/**/tests']

    process.chdir(repoRoot)
    const fromRepoRoot = resolveBuildEntries(packageRoot, patterns)

    process.chdir(packageRoot)
    const fromPackageRoot = resolveBuildEntries(packageRoot, patterns)

    expect(fromRepoRoot).toEqual(fromPackageRoot)
    expect(fromRepoRoot.length).toBeGreaterThan(0)
    expect(fromRepoRoot).toContain(normalizePath(resolve(packageRoot, 'src/index.ts')))
    expect(fromRepoRoot.every(entry => entry.startsWith(normalizePath(resolve(packageRoot, 'src'))))).toBe(true)
  })

  it('uses normalized absolute build paths in the shared config', () => {
    const config = buildCommon({
      external: [],
      packageRoot,
    })

    const output = Array.isArray(config.build?.rollupOptions?.output)
      ? config.build?.rollupOptions?.output[0]
      : config.build?.rollupOptions?.output

    expect(output?.dir).toBe(normalizePath(resolve(packageRoot, 'dist')))
    expect(output?.preserveModulesRoot).toBe(normalizePath(resolve(packageRoot, 'src')))
  })
})
