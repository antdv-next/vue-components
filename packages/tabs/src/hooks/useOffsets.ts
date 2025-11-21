import type { Ref } from 'vue'
import type { Tab } from '../interface'
import { shallowRef, watch } from 'vue'

export interface TabOffset {
  width: number
  height: number
  left: number
  top: number
  right: number
}

export type TabOffsetMap = Map<string, TabOffset>
export interface TabSize { width: number, height: number, left: number, top: number }
export type TabSizeMap = Map<string, TabSize>

const DEFAULT_SIZE: TabSize = { width: 0, height: 0, left: 0, top: 0 }

export default function useOffsets(
  tabs: Ref<Tab[]>,
  tabSizes: Ref<TabSizeMap>,
  holderScrollWidth: Ref<number>,
): Ref<TabOffsetMap> {
  const mapRef = shallowRef<TabOffsetMap>(new Map())

  watch(
    [() => tabs.value.map(tab => tab.key).join('_'), tabSizes, holderScrollWidth],
    () => {
      const map: TabOffsetMap = new Map()
      const firstKey = tabs.value[0]?.key
      const lastOffset = (firstKey ? tabSizes.value.get(firstKey) : undefined) || DEFAULT_SIZE
      const rightOffset = lastOffset.left + lastOffset.width

      for (let i = 0; i < tabs.value.length; i += 1) {
        const { key } = tabs.value[i]
        let data = tabSizes.value.get(key)
        if (!data) {
          const prevKey = tabs.value[i - 1]?.key
          data = (prevKey ? tabSizes.value.get(prevKey) : undefined) || DEFAULT_SIZE
        }
        const prev = map.get(key) || { ...data, right: 0 }
        const entity: TabOffset = prev as TabOffset
        entity.right = rightOffset - entity.left - entity.width
        map.set(key, entity)
      }

      mapRef.value = map
    },
    { immediate: true },
  )

  return mapRef
}
