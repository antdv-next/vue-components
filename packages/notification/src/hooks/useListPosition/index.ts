import type { ComputedRef, MaybeRef } from 'vue'
import type { StackConfig } from '../useStack'
import { computed, unref } from 'vue'
import useSizes from './useSizes'

type Key = string | number | symbol

export interface ConfigItem {
  key: Key
}

/**
 * Calculates each notification's position and the full list height.
 */
export default function useListPosition(
  configList: MaybeRef<readonly ConfigItem[]>,
  stack: MaybeRef<StackConfig | undefined>,
  gap: MaybeRef<number> = 0,
): [
  ComputedRef<Map<string, number>>,
  (key: string, node: HTMLElement | null) => void,
  ComputedRef<number>,
  ComputedRef<number | undefined>,
  ComputedRef<number | undefined>,
] {
  const [sizeMap, setNodeSize] = useSizes()

  const result = computed(() => {
    const list = unref(configList)
    const stackValue = unref(stack)
    const gapValue = unref(gap) ?? 0

    let offsetY = 0
    let nextTotalHeight = 0
    const stackThreshold = stackValue?.threshold ?? 0
    const positions = new Map<string, number>()
    let topNoticeHeight: number | undefined
    let topNoticeWidth: number | undefined

    list
      .slice()
      .reverse()
      .forEach((config, index) => {
        const key = String(config.key)
        const height = sizeMap.value[key]?.height ?? 0
        const y
          = stackValue && index > 0
            ? offsetY + (stackValue.offset ?? 0) - height
            : offsetY

        positions.set(key, y)

        if (index === 0) {
          topNoticeHeight = height
          topNoticeWidth = sizeMap.value[key]?.width ?? 0
        }

        if (!stackValue || index < stackThreshold) {
          nextTotalHeight = Math.max(nextTotalHeight, y + height)
        }

        if (stackValue) {
          offsetY = y + height
        }
        else {
          offsetY += height + gapValue
        }
      })

    return {
      positions,
      totalHeight: nextTotalHeight,
      topNoticeHeight,
      topNoticeWidth,
    }
  })

  return [
    computed(() => result.value.positions),
    setNodeSize,
    computed(() => result.value.totalHeight),
    computed(() => result.value.topNoticeHeight),
    computed(() => result.value.topNoticeWidth),
  ]
}
