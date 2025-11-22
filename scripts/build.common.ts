import type { Plugin, PluginOption, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import tsxResolveTypes from 'vite-plugin-tsx-resolve-types'

export interface BuildCommonOptions {
  external?: string[] | RegExp[] | ((id: string) => boolean) | (string | RegExp)[]
  inputDir?: string
  dts?: boolean
  plugins?: PluginOption[] | Plugin[]
}
export function buildCommon(opt: BuildCommonOptions) {
  const { dts: dtsOpen = true } = opt
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
      root: process.cwd(),
      entryRoot: opt.inputDir ?? 'src',
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
            preserveModulesRoot: opt.inputDir ?? 'src',
            format: 'esm',
            entryFileNames: '[name].js',
            dir: 'dist',
          },
          {
            preserveModules: true,
            format: 'cjs',
            entryFileNames: '[name].cjs',
            preserveModulesRoot: opt.inputDir ?? 'src',
            dir: 'dist',
            exports: 'named',
          },
        ],
      },
    },
  } as UserConfig
}
