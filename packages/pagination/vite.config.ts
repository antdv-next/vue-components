import type { UserConfig } from 'vite'
import fg from 'fast-glob'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon } from '../../scripts/build.common'

const entry = fg.sync(['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    external: ['vue', /^@v-c\/util/],
  }), {
    build: {
      lib: {
        entry,
      },
    },
  } as UserConfig),
})
