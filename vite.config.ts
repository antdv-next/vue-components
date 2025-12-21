/// <reference types="histoire" />
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import VueJsxAutoProps from 'vite-plugin-tsx-resolve-types'

const base = fileURLToPath(new URL('.', import.meta.url))

const comps = [
  ['util', 'util/dist'],
  'util',
  'checkbox',
  'resize-observer',
  'input',
  'portal',
  'collapse',
  'pagination',
  'nutate-observer',
  'notification',
  'progress',
  'rate',
  'steps',
  'virtual-list',
  'switch',
  'qrcode',
  'trigger',
  'dialog',
  'drawer',
  'tooltip',
  'slider',
  'mini-decimal',
  'input-number',
  'dropdown',
  'textarea',
  'async-validator',
  'segmented',
  'fast-color',
  'color-picker',
  'overflow',
  'menu',
  'tree',
  'tree-select',
]

export function genListAlias() {
  const alias = []
  for (const comp of comps) {
    if (Array.isArray(comp)) {
      const [dir, name] = comp
      alias.push({
        find: new RegExp(`^@v-c\/${name}`),
        replacement: resolve(base, 'packages', dir, 'src'),
      })
    }
    else {
      alias.push({
        find: new RegExp(`^@v-c\/${comp}`),
        replacement: resolve(base, 'packages', comp, 'src'),
      })
    }
  }
  return alias
}

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
      // Force all packages to use the same Vue instance to avoid reactivity mismatch in tests/dev.
      { find: /^vue$/, replacement: resolve(base, 'node_modules/vue/dist/vue.esm-bundler.js') },
      ...genListAlias(),
    ],
  },
  optimizeDeps: {
    // include: ['shiki'],
  },
})
