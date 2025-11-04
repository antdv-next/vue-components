import { onWatcherCleanup } from 'vue'
import { collectScroller, getWin } from '../util'

export default function useWatch(
  open: boolean,
  target: HTMLElement | null,
  popup: HTMLElement | null,
  onAlign: VoidFunction,
  onScroll: VoidFunction,
) {
  if (open && target && popup) {
    const targetElement = target
    const popupElement = popup
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
      scroller && scroller.addEventListener('scroll', notifyScroll, { passive: true })
    })

    win && win.addEventListener('resize', notifyScroll, { passive: true })

    // First time always do align
    onAlign()
    onWatcherCleanup(() => {
      mergedList.forEach((scroller) => {
        scroller && scroller.removeEventListener('scroll', notifyScroll)
        win && win.removeEventListener('resize', notifyScroll)
      })
    })
  }
}
