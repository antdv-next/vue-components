import { defineProject, mergeConfig } from 'vitest/config'
import configShared from '../vitest.shared'

export default mergeConfig(
  configShared,
  defineProject({
    test: {
      name: 'perf',
      environment: 'jsdom',
      include: ['**/*.test.tsx'],
      setupFiles: ['./setup.ts'],
    },
  }),
)
