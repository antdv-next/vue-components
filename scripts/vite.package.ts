import type { UserConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fg from 'fast-glob'
import { defineConfig, normalizePath } from 'vite'
import dts from 'vite-plugin-dts'
import tsxResolveTypes from 'vite-plugin-tsx-resolve-types'

export interface PackageConfigOptions {
  /** Extra externals on top of the derived ones (`vue`, `@v-c/*`, package deps). */
  external?: (string | RegExp)[]
  /** Entry glob patterns resolved against the package root. */
  entries?: string[]
  /** Package root override; defaults to the vite cwd (`process.cwd()`). */
  packageRoot?: string
}

interface ResolvedBuildPaths {
  packageRoot: string
  inputDir: string
  outDir: string
  tsconfigPath: string
}

/**
 * Default entry patterns shared by every package. Test files never live
 * outside `tests/`, so excluding both `.test.ts` and `.test.tsx` is always
 * safe, and including `*.vue` is harmless for pure-ts packages.
 */
const defaultEntries = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.vue',
  '!src/**/*.test.ts',
  '!src/**/*.test.tsx',
  '!src/**/tests',
]

export function resolveBuildPaths(packageRoot: string): ResolvedBuildPaths {
  const root = normalizePath(resolve(packageRoot))

  return {
    packageRoot: root,
    inputDir: normalizePath(resolve(root, 'src')),
    outDir: normalizePath(resolve(root, 'dist')),
    tsconfigPath: normalizePath(resolve(root, 'tsconfig.json')),
  }
}

export function resolveBuildEntries(packageRoot: string, patterns: string[]) {
  return fg.sync(patterns, {
    absolute: true,
    cwd: resolve(packageRoot),
    onlyFiles: true,
  }).map(entry => normalizePath(entry))
}

function escapeRegExp(name: string) {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Runtime deps (`dependencies` + `peerDependencies`, minus `vue`) externalized
 * as `^name(/|$)` so subpath imports like `es-toolkit/compat` stay external too.
 */
function resolvePackageExternals(packageRoot: string) {
  const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf-8'))
  const names = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}).filter(name => name !== 'vue'),
  ]
  return names.map(name => new RegExp(`^${escapeRegExp(name)}(/|$)`))
}

/**
 * Per-package vite lib config. Resolved against `options.packageRoot`, which
 * defaults to the vite cwd — i.e. the package directory, where every
 * package's `build` script runs `vite build`.
 */
export function definePackageConfig({ entries: entryPatterns, external: extraExternal, packageRoot: rootOverride }: PackageConfigOptions = {}): UserConfig {
  const paths = resolveBuildPaths(rootOverride ?? process.cwd())
  const entry = resolveBuildEntries(paths.packageRoot, entryPatterns ?? defaultEntries)
  const external = [
    'vue',
    /^@v-c\//,
    ...resolvePackageExternals(paths.packageRoot),
    ...extraExternal ?? [],
  ]

  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      tsxResolveTypes({
        defaultPropsToUndefined: true,
      }),
      dts({
        entryRoot: paths.inputDir,
        outDirs: paths.outDir,
        root: paths.packageRoot,
        tsconfigPath: paths.tsconfigPath,
        // Keep cross-package imports as package specifiers. Without this the
        // root tsconfig paths (@v-c/* -> packages/*/src) get rewritten into
        // monorepo-relative paths like '../../textarea/src' in the emitted
        // d.ts, which don't exist in the published tarball — consumers with
        // skipLibCheck silently resolve those types as `any` (and mapped
        // types like Omit<Props, ...> then degrade every field to any).
        aliasesExclude: [/^@v-c\//],
        exclude: [
          '**/tests/**/*',
          '**/*.test.ts',
          '**/*.test.tsx',
        ],
      }),
    ],
    build: {
      minify: false,
      lib: {
        entry,
      },
      rollupOptions: {
        external,
        output: [
          {
            preserveModules: true,
            preserveModulesRoot: paths.inputDir,
            format: 'esm',
            entryFileNames: '[name].js',
            dir: paths.outDir,
          },
        ],
      },
    },
  })
}
