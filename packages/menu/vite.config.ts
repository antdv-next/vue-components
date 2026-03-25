import type { UserConfig } from 'vitest/config'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon, resolveBuildEntries } from '../../scripts/build.common'

const packageRoot = new URL('.', import.meta.url)
const entry = resolveBuildEntries(packageRoot, ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/*.test.tsx', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    packageRoot,
    external: ['vue', /^@v-c\//],
  }), {
    build: {
      lib: {
        entry,
      },
    },

  } as UserConfig),
})
