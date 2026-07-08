import type { Plugin, PluginOption, UserConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fg from 'fast-glob'
import { normalizePath } from 'vite'
import dts from 'vite-plugin-dts'
import tsxResolveTypes from 'vite-plugin-tsx-resolve-types'

export interface BuildCommonOptions {
  external?: string[] | RegExp[] | ((id: string) => boolean) | (string | RegExp)[]
  packageRoot?: string | URL
  inputDir?: string
  dts?: boolean
  plugins?: PluginOption[] | Plugin[]
}

export interface ResolvedBuildPaths {
  packageRoot: string
  inputDir: string
  outDir: string
  tsconfigPath: string
}

function resolvePackageRoot(packageRoot: string | URL) {
  if (packageRoot instanceof URL) {
    const rootPath = packageRoot.protocol === 'file:'
      ? fileURLToPath(packageRoot)
      : decodeURIComponent(packageRoot.pathname).replace(/^\/@fs(?=\/)/, '')

    return normalizePath(rootPath)
  }

  return normalizePath(resolve(packageRoot))
}

export function resolveBuildPaths(packageRoot: string | URL, inputDir = 'src'): ResolvedBuildPaths {
  const normalizedPackageRoot = resolvePackageRoot(packageRoot)

  return {
    packageRoot: normalizedPackageRoot,
    inputDir: normalizePath(resolve(normalizedPackageRoot, inputDir)),
    outDir: normalizePath(resolve(normalizedPackageRoot, 'dist')),
    tsconfigPath: normalizePath(resolve(normalizedPackageRoot, 'tsconfig.json')),
  }
}

export function resolveBuildEntries(packageRoot: string | URL, patterns: string[]) {
  return fg.sync(patterns, {
    absolute: true,
    cwd: resolvePackageRoot(packageRoot),
    onlyFiles: true,
  }).map(entry => normalizePath(entry))
}

export function buildCommon(opt: BuildCommonOptions) {
  const { dts: dtsOpen = true } = opt
  const paths = resolveBuildPaths(opt.packageRoot ?? process.cwd(), opt.inputDir)
  const plugins = [
    vue(),
    vueJsx(),
    tsxResolveTypes({
      defaultPropsToUndefined: true,
    }),
    ...(opt.plugins ?? []),
  ]
  if (dtsOpen) {
    plugins.push(dts({
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
    }))
  }
  return {
    plugins,
    build: {
      minify: false,
      rollupOptions: {
        external: opt.external,
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
  } as UserConfig
}
