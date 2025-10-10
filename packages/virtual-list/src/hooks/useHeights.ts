import type { Key } from '@v-c/util/dist/type'
import type { GetKey } from '../interface'
import { onUnmounted, ref, type Ref } from 'vue'
import CacheMap from '../utils/CacheMap'

function parseNumber(value: string) {
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

export default function useHeights<T>(
  getKey: GetKey<T>,
  onItemAdd?: (item: T) => void,
  onItemRemove?: (item: T) => void,
): [
  setInstanceRef: (item: T, instance: HTMLElement | null) => void,
  collectHeight: (sync?: boolean) => void,
  cacheMap: CacheMap,
  updatedMark: Ref<number>,
  ] {
  const updatedMark = ref(0)
  const instanceRef = ref(new Map<Key, HTMLElement>())
  const heightsRef = ref(new CacheMap())

  const promiseIdRef = ref<number>(0)

  function cancelRaf() {
    promiseIdRef.value += 1
  }

  function collectHeight(sync = false) {
    cancelRaf()

    const doCollect = () => {
      let changed = false

      instanceRef.value.forEach((element, key) => {
        if (element && element.offsetParent) {
          const { offsetHeight } = element
          const { marginTop, marginBottom } = getComputedStyle(element)

          const marginTopNum = parseNumber(marginTop)
          const marginBottomNum = parseNumber(marginBottom)
          const totalHeight = offsetHeight + marginTopNum + marginBottomNum

          if (heightsRef.value.get(key) !== totalHeight) {
            heightsRef.value.set(key, totalHeight)
            changed = true
          }
        }
      })

      // Always trigger update mark to tell parent that should re-calculate heights when resized
      if (changed) {
        updatedMark.value += 1
      }
    }

    if (sync) {
      doCollect()
    }
    else {
      promiseIdRef.value += 1
      const id = promiseIdRef.value
      Promise.resolve().then(() => {
        if (id === promiseIdRef.value) {
          doCollect()
        }
      })
    }
  }

  function setInstanceRef(item: T, instance: HTMLElement | null) {
    const key = getKey(item)
    const origin = instanceRef.value.get(key)

    // Only update if the instance actually changed
    if (origin === instance) {
      return
    }

    if (instance) {
      instanceRef.value.set(key, instance)
      collectHeight()
    }
    else {
      instanceRef.value.delete(key)
    }

    // Instance changed
    if (!origin !== !instance) {
      if (instance) {
        onItemAdd?.(item)
      }
      else {
        onItemRemove?.(item)
      }
    }
  }

  onUnmounted(() => {
    cancelRaf()
  })

  return [setInstanceRef, collectHeight, heightsRef.value, updatedMark]
}
