import type { UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon, resolveBuildEntries } from '../../scripts/build.common'

const packageRoot = new URL('.', import.meta.url)
const entry = resolveBuildEntries(packageRoot, ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/tests'])

export default defineConfig({
  ...mergeConfig(buildCommon({
    packageRoot,
    external: ['vue', /^@v-c\//, /^date-fns/, /^dayjs/, /^moment/, /^luxon/],
  }), {
    build: {
      lib: {
        entry,
      },
    },
    optimizeDeps: {
      include: [
        'mermaid',
      ],
    },
  } as UserConfig),
})
