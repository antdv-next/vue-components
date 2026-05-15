import type { ComputedRef, Ref } from 'vue'
import type { Key } from '../../interface'
import { computed } from 'vue'
import useSizes from './useSizes'

export interface ListPositionStackConfig {
  threshold?: number
  offset?: number
}

/**
 * Calculates each notification's position and the full list height.
 * Mirrors rc-notification@2.0 useListPosition.
 */
export default function useListPosition(
  configList: ComputedRef<{ key: Key }[]>,
  stack: ComputedRef<ListPositionStackConfig | undefined>,
  gap: Ref<number>,
) {
  const [sizeMap, setNodeSize] = useSizes()

  const result = computed(() => {
    let offsetY = 0
    let nextTotalHeight = 0
    const stackParams = stack.value
    const stackThreshold = stackParams?.threshold ?? 0
    const stackOffset = stackParams?.offset ?? 0
    const notificationPosition = new Map<string, number>()
    let topNoticeHeight: number | undefined
    let topNoticeWidth: number | undefined

    configList.value
      .slice()
      .reverse()
      .forEach((config, index) => {
        // Walk from newest to oldest so each notice can be positioned after the ones below it.
        const key = String(config.key)
        const height = sizeMap.value[key]?.height ?? 0
        const y = stackParams && index > 0 ? offsetY + stackOffset - height : offsetY

        notificationPosition.set(key, y)

        if (index === 0) {
          topNoticeHeight = height
          topNoticeWidth = sizeMap.value[key]?.width ?? 0
        }

        if (!stackParams || index < stackThreshold) {
          nextTotalHeight = Math.max(nextTotalHeight, y + height)
        }

        if (stackParams) {
          offsetY = y + height
        }
        else {
          offsetY += height + gap.value
        }
      })

    return {
      notificationPosition,
      totalHeight: nextTotalHeight,
      topNoticeHeight,
      topNoticeWidth,
    }
  })

  return [result, setNodeSize] as const
}
