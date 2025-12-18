import type { Ref } from 'vue'
import type { LabeledValueType, SafeKey } from '../interface'
import { computed, shallowRef } from 'vue'

/**
 * This function will try to cache labels for values to avoid label missing when options removed.
 */
export default function useCache(values: Ref<LabeledValueType[]>): [Ref<LabeledValueType[]>] {
  const cacheRef = shallowRef({
    valueLabels: new Map<SafeKey, any>(),
  })

  const filledValues = computed(() => {
    const { valueLabels } = cacheRef.value
    const valueLabelsCache = new Map<SafeKey, any>()

    const merged = values.value.map((item) => {
      const { value, label } = item
      const mergedLabel = label ?? valueLabels.get(value as SafeKey)

      // Save in cache
      valueLabelsCache.set(value as SafeKey, mergedLabel)

      return {
        ...item,
        label: mergedLabel,
      }
    })

    cacheRef.value.valueLabels = valueLabelsCache

    return merged
  })

  return [filledValues]
}
