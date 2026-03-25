import type { UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon, resolveBuildEntries } from '../../scripts/build.common'

const packageRoot = new URL('.', import.meta.url)
const entry = resolveBuildEntries(packageRoot, ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/*.test.tsx', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    packageRoot,
    external: [
      'vue',
      'resize-observer-polyfill',
      /^@v-c\//,
    ],
  }), {
    build: {
      lib: {
        entry,
      },
    },
  } as UserConfig),
})
