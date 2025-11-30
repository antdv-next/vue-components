import type { ComputedRef, Ref } from 'vue'
import type { GetKey } from '../interface'
import type CacheMap from '../utils/CacheMap'
import { computed } from 'vue'

export function useGetSize<T>(
  mergedData: Ref<T[]>,
  getKey: GetKey<T>,
  heights: CacheMap,
  itemHeight: Ref<number>,
): ComputedRef<(startKey: any, endKey?: any) => { top: number, bottom: number }> {
  return computed(() => {
    return (startKey: any, endKey?: any) => {
      let topIndex = 0
      let bottomIndex = mergedData.value.length - 1

      if (startKey !== undefined && startKey !== null) {
        topIndex = mergedData.value.findIndex(item => getKey(item) === startKey)
      }

      if (endKey !== undefined && endKey !== null) {
        bottomIndex = mergedData.value.findIndex(item => getKey(item) === endKey)
      }

      let top = 0
      for (let i = 0; i < topIndex; i += 1) {
        const key = getKey(mergedData.value[i])
        const cacheHeight = heights.get(key)
        top += cacheHeight === undefined ? itemHeight.value : cacheHeight
      }

      let bottom = 0
      for (let i = mergedData.value.length - 1; i > bottomIndex; i -= 1) {
        const key = getKey(mergedData.value[i])
        const cacheHeight = heights.get(key)
        bottom += cacheHeight === undefined ? itemHeight.value : cacheHeight
      }

      return {
        top,
        bottom,
      }
    }
  })
}
