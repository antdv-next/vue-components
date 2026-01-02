import type { Ref } from 'vue'
import type { GetKey, GetSize } from '../interface'
import type CacheMap from '../utils/CacheMap'
import { watch } from 'vue'

export function useGetSize<T>(
  mergedData: Ref<T[]>,
  getKey: GetKey<T>,
  heights: CacheMap,
  itemHeight: Ref<number>,
) {
  let key2Index = new Map()
  let bottomList: any[] = []
  watch(
    [mergedData, () => heights.id.value, itemHeight],
    () => {
      key2Index = new Map()
      bottomList = []
    },
  )
  const getSize: GetSize = (startKey, endKey = startKey) => {
    // Get from cache first
    let startIndex = key2Index.get(startKey)
    let endIndex = key2Index.get(endKey)

    // Loop to fill the cache
    if (startIndex === undefined || endIndex === undefined) {
      const dataLen = mergedData.value.length
      for (let i = bottomList.length; i < dataLen; i += 1) {
        const item = mergedData.value[i]
        const key = getKey(item)
        key2Index.set(key, i)
        const cacheHeight = heights.get(key) ?? itemHeight.value
        bottomList[i] = (bottomList[i - 1] || 0) + cacheHeight
        if (key === startKey) {
          startIndex = i
        }
        if (key === endKey) {
          endIndex = i
        }

        if (startIndex !== undefined && endIndex !== undefined) {
          break
        }
      }
    }

    return {
      top: bottomList[startIndex - 1] || 0,
      bottom: bottomList[endIndex],
    }
  }

  return getSize
}
