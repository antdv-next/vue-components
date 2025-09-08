import type { UserConfig } from 'vite'
import { resolve } from 'node:path'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon } from '../../scripts/build.common'

export default defineConfig({
  ...mergeConfig(buildCommon({
    external: ['vue', 'classnames', /^@v-c\/util/],
  }), {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VCOverflow',
        fileName: 'index',
      },
    },
  } as UserConfig),
})
