import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueJsxAutoProps from 'vite-plugin-tsx-resolve-types'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { genListAlias } from './vite.config.ts'
import { resolve } from 'node:path'

const base = fileURLToPath(new URL('.', import.meta.url))
const vueEntry = resolve(base, 'node_modules/vue/dist/vue.esm-bundler.js')

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VueJsxAutoProps({
      defaultPropsToUndefined: true,
    }),
  ],
  resolve: {
    alias: [
      { find: /^vue$/, replacement: vueEntry },
      ...genListAlias(),
    ],
  },
})
