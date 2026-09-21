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
 * The same cutoff while a pointer is down. A drag keeps the target moving, so
 * the count only climbs once the drag has actually stopped — or ended without
 * us hearing about it, when the release landed somewhere we do not see.
 * Generous enough not to cut a real pause mid-drag short, hard enough that a
 * missed release cannot pin the loop open.
 */
const DRAG_IDLE_FRAMES = 600

/**
 * Align reacts to scroll and to window/element *resize*, but nothing tells it
 * that the target simply moved. An ancestor mid-transition (a sider collapsing,
 * a drawer sliding in), a layout animation, or a drag all relocate the target
 * without resizing it and without scrolling, so a popup opened during one stays
 * at the position the target had when it opened and never catches up.
 *
 * Sample the target's viewport rect per frame and re-align when it actually
 * moved. Sampling is not open-ended: reading a rect can force a layout, so once
 * the target has held still the loop parks itself, and the listeners below
 * bring it back when something might move the target again. A popup that is
 * merely open costs nothing, and while a transition really is running the
 * browser is laying out every frame regardless.
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
      let dragging = false

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

        rafId = idle < (dragging ? DRAG_IDLE_FRAMES : IDLE_FRAMES)
          ? win.requestAnimationFrame(sample)
          : undefined
      }

      // Re-arming a parked loop also clears the idle count, so an event that
      // arrives while it is still running simply buys it another window.
      const rearm = () => {
        idle = 0
        if (rafId === undefined) {
          rafId = win.requestAnimationFrame(sample)
        }
      }

      const onPointerDown = () => {
        dragging = true
        rearm()
      }

      const onPointerUp = () => {
        dragging = false
      }

      // `transitionrun` and `animationstart` bubble, so one listener on the
      // document catches an ancestor starting to move wherever it sits. The
      // release of a drag may never reach the document — it can land outside
      // the window — so those go on the window instead.
      const listeners: [EventTarget | undefined, string, EventListener][] = [
        [doc, 'transitionrun', rearm],
        [doc, 'animationstart', rearm],
        [doc, 'pointerdown', onPointerDown],
        [win, 'pointerup', onPointerUp],
        [win, 'pointercancel', onPointerUp],
      ]

      rearm()

      listeners.forEach(([node, type, handler]) => {
        node?.addEventListener(type, handler, { capture: true, passive: true })
      })

      onCleanup(() => {
        if (rafId !== undefined) {
          win.cancelAnimationFrame(rafId)
        }
        listeners.forEach(([node, type, handler]) => {
          node?.removeEventListener(type, handler, { capture: true })
        })
      })
    },
    { flush: 'post', immediate: true },
  )
}
