import type { Ref } from 'vue'
import { watch } from 'vue'
import { getWin } from '../util.ts'

/**
 * Align reacts to scroll and to window/element *resize*, but nothing tells it
 * that the target simply moved. An ancestor mid-transition (a sider collapsing,
 * a drawer sliding in), a layout animation, or a drag all relocate the target
 * without resizing it and without scrolling, so a popup opened during one stays
 * at the position the target had when it opened and never catches up.
 *
 * Sample the target's viewport rect per frame while the popup is open and
 * re-align when it actually moved. Re-align requests are merged into a single
 * frame downstream, so a moving target costs one align per frame at most.
 */
export default function useTargetMove(
  open: Ref<boolean>,
  target: Ref<HTMLElement | [x: number, y: number]>,
  onAlign: VoidFunction,
  mobile?: Ref<boolean | undefined>,
) {
  watch(
    [open, target, mobile ?? open],
    (_value, _oldValue, onCleanup) => {
      const targetElement = target.value

      // `alignPoint` hands over a mouse position instead of an element — there
      // is no element to follow, and mobile skips alignment altogether.
      if (
        !open.value
        || mobile?.value
        || !targetElement
        || Array.isArray(targetElement)
        || !targetElement.getBoundingClientRect
      ) {
        return
      }

      const win = getWin(targetElement)
      if (!win?.requestAnimationFrame) {
        return
      }

      let rafId: number
      let lastX: number | null = null
      let lastY: number | null = null

      const check = () => {
        rafId = win.requestAnimationFrame(check)

        const { left, top } = targetElement.getBoundingClientRect()
        if (lastX === null) {
          lastX = left
          lastY = top
          return
        }
        if (left !== lastX || top !== lastY) {
          lastX = left
          lastY = top
          onAlign()
        }
      }

      rafId = win.requestAnimationFrame(check)

      onCleanup(() => {
        win.cancelAnimationFrame(rafId)
      })
    },
    { flush: 'post', immediate: true },
  )
}
