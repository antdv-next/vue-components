import type { UserConfig } from 'vite'
import { resolve } from 'node:path'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon } from '../../scripts/build.common'

const packageRoot = new URL('.', import.meta.url)

export default defineConfig({
  ...mergeConfig(buildCommon({
    packageRoot,
    external: ['vue', /^@v-c\//],
  }), {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        fileName: 'index',
      },
    },
  } as UserConfig),
})
