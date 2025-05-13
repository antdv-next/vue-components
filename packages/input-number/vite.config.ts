import type { UserConfig } from 'vitest/config'
import { defineConfig, mergeConfig } from 'vite'
import { buildCommon } from '../../scripts/build.common'

export default defineConfig({
  ...mergeConfig(buildCommon({
    external: ['vue', 'classnames', /^@v-c\/util/],
  }), {

  } as UserConfig),
})
