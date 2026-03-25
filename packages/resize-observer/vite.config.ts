import type { UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon, resolveBuildEntries } from '../../scripts/build.common'

const packageRoot = new URL('.', import.meta.url)
const entry = resolveBuildEntries(packageRoot, ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    packageRoot,
    external: ['vue', 'classnames', /^@v-c\/util/, 'resize-observer-polyfill'],
  }), {
    build: {
      lib: {
        entry,
      },
    },
  } as UserConfig),
})
