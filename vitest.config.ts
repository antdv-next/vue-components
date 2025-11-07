import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueJsxAutoProps from 'vite-plugin-tsx-resolve-types'
import { defineConfig } from 'vitest/config'
import { genListAlias } from './vite.config.ts'

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
      ...genListAlias(),
    ],
  },
})
