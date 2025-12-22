import type { UserConfig } from 'vitest/config'
import fg from 'fast-glob'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon } from '../../scripts/build.common'

const entry = fg.sync(['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/*.test.tsx', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    external: ['vue', /^@v-c\//, 'throttle-debounce', 'json2mq'],
  }), {
    build: {
      lib: {
        entry,
      },
    },
  } as UserConfig),
})
