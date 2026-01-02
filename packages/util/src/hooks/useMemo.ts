import type { Ref, WatchSource } from 'vue'
import { isReactive, isRef, ref, watch } from 'vue'

export default function useMemo<T>(
  getValue: () => T,
  condition: (WatchSource<unknown> | object)[],
  shouldUpdate?: (prev: any[], next: any[]) => boolean,
) {
  const cacheRef: Ref<T> = ref(getValue() as any)
  const sources = condition.map((item) => {
    if (typeof item === 'function' || isRef(item) || isReactive(item)) {
      return item as WatchSource<unknown>
    }
    return () => item
  })

  watch(sources, (next, pre) => {
    if (shouldUpdate) {
      if (shouldUpdate(next, pre))
        cacheRef.value = getValue()
    }
    else {
      cacheRef.value = getValue()
    }
  })

  return cacheRef
}
