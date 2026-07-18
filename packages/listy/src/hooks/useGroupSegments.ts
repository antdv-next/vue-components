import type { Key } from '@v-c/util/dist/type'
import type { ComputedRef } from 'vue'
import type { Group } from '../interface'
import { computed } from 'vue'

export interface GroupSegment {
  key: Key
  startIndex: number
  endIndex: number
}

export interface GroupSegmentItem {
  item: any
  index: number
}

/**
 * segments representing consecutive runs of items that share the same group key.
 */
export default function useGroupSegments(
  data: any[],
  group: Group | undefined,
): ComputedRef<Map<any, GroupSegmentItem[]>> {
  return computed(() => {
    // ============================== Init ================================
    const map = new Map<any, GroupSegmentItem[]>()
    // ============================ No Group ==============================
    if (!group) {
      return map
    }

    // ============================= Collect ==============================
    data.forEach((item, index) => {
      const groupKey = typeof group.key === 'function' ? group.key(item) : group.key
      const groupItems = map.get(groupKey)
      const groupSegmentItem = { item, index }

      if (groupItems) {
        groupItems.push(groupSegmentItem)
      }
      else {
        map.set(groupKey, [groupSegmentItem])
      }
    })

    // ============================== Return ==============================
    return map
  })
}
