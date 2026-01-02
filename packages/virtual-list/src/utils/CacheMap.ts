import type { Key } from '@v-c/util/dist/type'
import { shallowRef } from 'vue'

// Firefox has low performance of map.
class CacheMap {
  maps: Record<string, number>

  // Used for cache key
  // `useMemo` no need to update if `id` not change
  id = shallowRef(0)

  diffRecords = new Map<Key, number>()

  constructor() {
    this.maps = Object.create(null)
  }

  set(key: Key, value: number) {
    // Record prev value
    this.diffRecords.set(key, this.maps[key as string])

    this.maps[key as string] = value
    this.id.value += 1
  }

  get(key: Key) {
    return this.maps[key as string]
  }

  /**
   * CacheMap will record the key changed.
   * To help to know what's update in the next render.
   */
  resetRecord() {
    this.diffRecords.clear()
  }

  getRecord() {
    return this.diffRecords
  }
}

export default CacheMap
