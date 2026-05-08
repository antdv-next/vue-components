import type { ComputedRef, MaybeRef } from 'vue'
import { computed, unref } from 'vue'

export interface StackConfig {
  threshold?: number
  offset?: number
}

const DEFAULT_OFFSET = 8
const DEFAULT_THRESHOLD = 3

type StackParams = Required<StackConfig>

export type StackInput = boolean | StackConfig

type UseStack = (
  config?: MaybeRef<StackInput | undefined>,
) => [ComputedRef<boolean>, ComputedRef<StackParams>]

const useStack: UseStack = (config) => {
  const enabled = computed(() => !!unref(config))

  const params = computed<StackParams>(() => {
    const value = unref(config)
    if (value && typeof value === 'object') {
      return {
        offset: value.offset ?? DEFAULT_OFFSET,
        threshold: value.threshold ?? DEFAULT_THRESHOLD,
      }
    }
    return {
      offset: DEFAULT_OFFSET,
      threshold: DEFAULT_THRESHOLD,
    }
  })

  return [enabled, params]
}

export default useStack
