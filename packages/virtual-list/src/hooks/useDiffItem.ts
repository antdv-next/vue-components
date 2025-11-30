import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export default function useDiffItem<T>(data: Ref<T[]>, getKey: (item: T) => any): Ref<T | undefined> {
  const prevDataRef = ref<T[]>([])
  const diffItem = ref<T>()

  watch(
    data,
    (newData) => {
      const prevData = prevDataRef.value

      if (newData !== prevData) {
        // Find added item
        const addedItem = newData.find((item) => {
          const key = getKey(item)
          return !prevData.some(prevItem => getKey(prevItem as any) === key)
        })

        diffItem.value = addedItem
        prevDataRef.value = newData
      }
    },
    { immediate: true },
  )

  return diffItem
}
