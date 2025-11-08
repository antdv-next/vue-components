import type { Ref } from 'vue'
import { nextTick, watch } from 'vue'
import { collectScroller, getWin } from '../util.ts'

export default function useWatch(
  open: Ref<boolean>,
  target: Ref<HTMLElement>,
  popup: Ref<HTMLElement>,
  onAlign: VoidFunction,
  onScroll: VoidFunction,
) {
  watch([open, target, popup], async (_n, _o, onCleanup) => {
    await nextTick()
    if (open.value && target.value && popup.value) {
      const targetElement = target.value
      const popupElement = popup.value
      const targetScrollList = collectScroller(targetElement)
      const popupScrollList = collectScroller(popupElement)

      const win = getWin(popupElement)

      const mergedList = new Set([
        win,
        ...targetScrollList,
        ...popupScrollList,
      ])

      function notifyScroll() {
        onAlign()
        onScroll()
      }

      mergedList.forEach((scroller) => {
        scroller!.addEventListener('scroll', notifyScroll, { passive: true })
      })

      win!.addEventListener('resize', notifyScroll, { passive: true })

      // First time always do align
      onAlign()
      onCleanup(() => {
        mergedList.forEach((scroller) => {
          scroller!.removeEventListener('scroll', notifyScroll)
          win!.removeEventListener('resize', notifyScroll)
        })
      })
    }
  })
}
