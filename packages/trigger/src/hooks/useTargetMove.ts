import type { Ref } from 'vue'
import { watch } from 'vue'
import { getWin } from '../util.ts'

/**
 * Frames of stillness after which sampling parks itself. Long enough to ride
 * out a normal UI transition that pauses mid-way, short enough that an idle
 * popup stops costing a forced layout per frame almost immediately.
 */
const IDLE_FRAMES = 20

/**
 * Something may have started moving the target. These all bubble, so one
 * listener per document catches them wherever they happen.
 */
const REARM_EVENTS = ['transitionrun', 'animationstart', 'pointerdown', 'pointermove'] as const

/**
 * Align reacts to scroll and to window/element *resize*, but nothing tells it
 * that the target simply moved. An ancestor mid-transition (a sider collapsing,
 * a drawer sliding in), a layout animation, or a drag all relocate the target
 * without resizing it and without scrolling, so a popup opened during one stays
 * at the position the target had when it opened and never catches up.
 *
 * Sample the target's viewport rect per frame and re-align when it actually
 * moved. Sampling is not open-ended: reading a rect forces a layout, so once
 * the target has held still for `IDLE_FRAMES` the loop parks itself, and the
 * events above bring it back when something might move the target again. A
 * popup that is merely open therefore costs nothing.
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

      const doc = targetElement.ownerDocument

      let rafId: number | undefined
      let lastX: number | null = null
      let lastY: number | null = null
      let idle = 0

      const sample = () => {
        const { left, top } = targetElement.getBoundingClientRect()

        if (lastX === null) {
          // First sample only establishes the baseline.
          lastX = left
          lastY = top
        }
        else if (left !== lastX || top !== lastY) {
          lastX = left
          lastY = top
          idle = 0
          onAlign()
        }
        else {
          idle += 1
        }

        rafId = idle < IDLE_FRAMES ? win.requestAnimationFrame(sample) : undefined
      }

      // Re-arming a parked loop also clears the idle count, so an event that
      // arrives while it is still running simply buys it another window.
      const rearm = () => {
        idle = 0
        if (rafId === undefined) {
          rafId = win.requestAnimationFrame(sample)
        }
      }

      rearm()

      REARM_EVENTS.forEach((type) => {
        doc?.addEventListener(type, rearm, { capture: true, passive: true })
      })

      onCleanup(() => {
        if (rafId !== undefined) {
          win.cancelAnimationFrame(rafId)
        }
        REARM_EVENTS.forEach((type) => {
          doc?.removeEventListener(type, rearm, { capture: true })
        })
      })
    },
    { flush: 'post', immediate: true },
  )
}
