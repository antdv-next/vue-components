import type { Key } from '@v-c/util/dist/type'
import type { Ref } from 'vue'
import type { GetKey, GetSize } from '../interface'
import type CacheMap from '../utils/CacheMap'
import { warning } from '@v-c/util'
import { shallowRef, watch } from 'vue'

const MAX_TIMES = 10

export type ScrollAlign = 'top' | 'bottom' | 'auto'

export interface ScrollPos {
  left?: number
  top?: number
}

export interface ScrollOffsetInfo {
  /**
   * Get item size range by key.
   * 通过 key 获取元素在虚拟列表中的尺寸范围。
   */
  getSize: GetSize
  /**
   * Resolved align direction. For `auto` this reads `'auto'` on the first
   * measure pass (before the direction is decided) and settles to
   * `'top'`/`'bottom'` on the pass that actually positions the item.
   *
   * 已解析的对齐方向。auto 在首帧测量时仍是 'auto'，定向后变 'top'/'bottom'。
   */
  align: ScrollAlign
}

export type ScrollOffset = number | ((info: ScrollOffsetInfo) => number)

export type ScrollTarget = {
  index: number
  align?: ScrollAlign
  offset?: ScrollOffset
} | {
  key: Key
  align?: ScrollAlign
  offset?: ScrollOffset
}

function getOffset(rawOffset: ScrollOffset, info: ScrollOffsetInfo) {
  const resolvedOffset = typeof rawOffset === 'function' ? rawOffset(info) : rawOffset

  return Number.isFinite(resolvedOffset) ? resolvedOffset : 0
}

export default function useScrollTo(
  containerRef: Ref<HTMLDivElement>,
  data: Ref<any[]>,
  heights: CacheMap,
  itemHeight: Ref<number>,
  getKey: GetKey<any>,
  getSize: GetSize,
  collectHeight: () => void,
  syncScrollTop: (newTop: number) => void,
  triggerFlash: () => void,
): [(arg: number | ScrollTarget) => void, () => number] {
  const syncState = shallowRef<{
    times: number
    index: number
    key?: Key
    offset: ScrollOffset
    originAlign: ScrollAlign
    targetAlign?: 'top' | 'bottom'
    lastTop?: number
  } | null>(null)

  // =================== Calculate Total Height ====================
  // Calculate the total scroll height based on all items
  const getTotalHeight = () => {
    let totalHeight = 0
    for (let i = 0; i < data.value.length; i += 1) {
      const key = getKey(data.value[i])
      const cacheHeight = heights.get(key)
      totalHeight += (cacheHeight === undefined ? itemHeight.value : cacheHeight)
    }
    return totalHeight
  }

  // ========================== Sync Scroll ==========================
  watch(
    syncState,
    () => {
      if (syncState.value && syncState.value.times < MAX_TIMES) {
        // Never reach
        if (!containerRef.value) {
          syncState.value = { ...syncState.value }
          return
        }

        collectHeight()

        const { targetAlign, originAlign, offset: rawOffset } = syncState.value
        // `scrollTo` may be called before `data` is updated (e.g. the owner changes
        // its state and scrolls in the same tick). Resolve the `key` against the
        // latest data on every pass instead of trusting the index we captured.
        const index = syncState.value.index >= 0
          ? syncState.value.index
          : data.value.findIndex(item => getKey(item) === syncState.value!.key)
        const mergedAlign = targetAlign || originAlign
        const offset = getOffset(rawOffset, { getSize, align: mergedAlign })

        const height = containerRef.value.clientHeight
        // Key is not in the data yet. Keep retrying until data catches up.
        let needCollectHeight = index < 0
        let newTargetAlign: 'top' | 'bottom' | null = targetAlign ?? null
        let targetTop: number | null = null

        // Go to next frame if height not exist
        if (height && index >= 0) {
          const mergedAlign = targetAlign || originAlign

          // Get top & bottom
          let stackTop = 0
          let itemTop = 0
          let itemBottom = 0

          const maxLen = Math.min(data.value.length - 1, index)

          for (let i = 0; i <= maxLen; i += 1) {
            const key = getKey(data.value[i])
            itemTop = stackTop
            const cacheHeight = heights.get(key)
            itemBottom = itemTop + (cacheHeight === undefined ? itemHeight.value : cacheHeight)

            stackTop = itemBottom
          }

          // Check if need sync height (visible range has item not record height)
          let leftHeight = mergedAlign === 'top' ? offset : height - offset
          for (let i = maxLen; i >= 0; i -= 1) {
            const key = getKey(data.value[i])
            const cacheHeight = heights.get(key)

            if (cacheHeight === undefined) {
              needCollectHeight = true
              break
            }

            leftHeight -= cacheHeight
            if (leftHeight <= 0) {
              break
            }
          }

          // Scroll to
          switch (mergedAlign) {
            case 'top':
              targetTop = itemTop - offset
              break
            case 'bottom':
              targetTop = itemBottom - height + offset
              break

            default: {
              const { scrollTop } = containerRef.value
              const scrollBottom = scrollTop + height
              if (itemTop < scrollTop) {
                newTargetAlign = 'top'
              }
              else if (itemBottom > scrollBottom) {
                newTargetAlign = 'bottom'
              }
            }
          }

          if (targetTop !== null) {
            syncScrollTop(targetTop)
          }

          // One more time for sync
          if (targetTop !== syncState.value.lastTop) {
            needCollectHeight = true
          }
        }

        // Trigger next effect
        if (needCollectHeight) {
          syncState.value = {
            ...syncState.value,
            times: syncState.value.times + 1,
            index,
            targetAlign: newTargetAlign as any,
            lastTop: targetTop as any,
          }
        }
      }
      else if (process.env.NODE_ENV !== 'production' && syncState.value?.times === MAX_TIMES) {
        warning(
          false,
          'Seems `scrollTo` with `rc-virtual-list` reach the max limitation. Please fire issue for us. Thanks.',
        )
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  // =========================== Scroll To ===========================
  const scrollTo = (arg: number | ScrollTarget | null | undefined) => {
    // When not argument provided, we think dev may want to show the scrollbar
    if (arg === null || arg === undefined) {
      triggerFlash()
      return
    }

    // Normal scroll logic
    // raf.cancel(scrollRef.value!)

    if (typeof arg === 'number') {
      syncScrollTop(arg)
    }
    else if (arg && typeof arg === 'object') {
      let index: number
      let key: Key | undefined
      const { align } = arg

      if ('index' in arg) {
        ({ index } = arg)
      }
      else {
        key = arg.key
        index = data.value.findIndex(item => getKey(item) === key)
      }

      const { offset: rawOffset = 0 } = arg

      syncState.value = {
        times: 0,
        index,
        key,
        offset: rawOffset,
        originAlign: align!,
      }
    }
  }

  return [scrollTo, getTotalHeight]
}
