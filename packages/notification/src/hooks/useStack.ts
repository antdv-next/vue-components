import type { ComputedRef, MaybeRef, ToRefs } from 'vue'
import type { StackConfig } from '../interface'
import { computed, reactive, toRefs, unref, watchEffect } from 'vue'

const DEFAULT_OFFSET = 8
const DEFAULT_THRESHOLD = 3

type StackParams = Exclude<StackConfig, boolean>

type UseStack = (
  config?: MaybeRef<StackConfig | undefined>,
) => [ComputedRef<boolean>, ToRefs<StackParams>]

/**
 * Resolves the stack setting into an enabled flag and normalized stack params.
 * Mirrors rc-notification@2.0 useStack. The `gap` config is no longer surfaced
 * here — gap is now read from the list-content CSS `gap`/`row-gap`.
 */
const useStack: UseStack = (config) => {
  const result: StackParams = reactive({
    offset: DEFAULT_OFFSET,
    threshold: DEFAULT_THRESHOLD,
  })

  watchEffect(() => {
    const value = unref(config)
    if (value && typeof value === 'object') {
      result.offset = value.offset ?? DEFAULT_OFFSET
      result.threshold = value.threshold ?? DEFAULT_THRESHOLD
    }
  })

  return [computed(() => !!unref(config)), toRefs(result)]
}

export default useStack
