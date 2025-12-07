import type { Ref } from 'vue'
import { shallowRef, watch } from 'vue'
import { findListDiffIndex } from '../utils/algorithmUtil.ts'

export default function useDiffItem<T>(
  data: Ref<T[]>,
  getKey: (item: T) => any,
  onDiff?: (diffIndex: number) => void,
): Ref<T | undefined> {
  const prevData = shallowRef<T[]>(data.value)
  const diffItem = shallowRef<T>()

  watch(
    data,
    (newData) => {
      const diff = findListDiffIndex(prevData.value || [], data.value || [], getKey)
      if (diff?.index !== undefined) {
        onDiff?.(diff.index)
        diffItem.value = newData[diff.index]
      }
      prevData.value = newData
    },
    { immediate: true },
  )

  return diffItem
}
