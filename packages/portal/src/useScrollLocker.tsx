import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { removeCSS, updateCSS } from '@v-c/util/dist/Dom/dynamicCSS'
import { getTargetScrollBarSize } from '@v-c/util/dist/getScrollBarSize'
import { computed, shallowRef, unref, watch } from 'vue'
import { isBodyOverflowing } from './util'

const UNIQUE_ID = `vc-util-locker-${Date.now()}`

let uuid = 0
export default function useScrollLocker(lock?: ShallowRef<boolean> | ComputedRef<boolean> | boolean | Ref<boolean>) {
  const mergedLock = computed(() => unref(lock))
  uuid += 1
  const id = shallowRef(`${UNIQUE_ID}_${uuid}`)
  watch(
    [id, mergedLock],
    async (_, _o, onCleanup) => {
      if (mergedLock.value) {
        const scrollbarSize = getTargetScrollBarSize(document.body).width
        const isOverflow = isBodyOverflowing()

        updateCSS(
          `
html body {
  overflow-y: hidden;
  ${isOverflow ? `width: calc(100% - ${scrollbarSize}px);` : ''}
}`,
          id.value,
        )

        onCleanup(() => {
          removeCSS(id.value)
        })
      }
      else {
        removeCSS(id.value)
      }
    },
    {
      flush: 'post',
      immediate: true,
    },
  )
}
