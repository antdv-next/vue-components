import type { Ref } from 'vue'
import { warning } from '@v-c/util'
import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
import { shallowRef, watch, watchEffect } from 'vue'
import { getWin } from '../util.ts'

/**
 * Close if click on the window.
 * Return the function that click on the Popup element.
 */
export default function useWinClick(
  open: Ref<boolean>,
  clickToHide: Ref<boolean>,
  targetEle: Ref<HTMLElement>,
  popupEle: Ref<HTMLElement>,
  mask: Ref<boolean>,
  maskClosable: Ref<boolean>,
  inPopupOrChild: (target: EventTarget) => boolean,
  triggerOpen: (open: boolean) => void,
) {
  const openRef = shallowRef(open.value)
  watchEffect(() => {
    openRef.value = open.value
  })
  const popupPointerDownRef = shallowRef(false)
  // Click to hide is special action since click popup element should not hide
  watch(
    [clickToHide, targetEle, popupEle, mask, maskClosable],
    ([clickToHide, targetEle, popupEle, mask, maskClosable], _o, onCleanup) => {
      if (clickToHide && popupEle && (!mask || maskClosable)) {
        const onPointerDown = () => {
          popupPointerDownRef.value = false
        }

        const onTriggerClose = (e: MouseEvent) => {
          if (
            openRef.value
            && !inPopupOrChild(e.composedPath?.()?.[0] || e.target)
            && !popupPointerDownRef.value
          ) {
            triggerOpen(false)
          }
        }

        const win = getWin(popupEle)

        win!.addEventListener('pointerdown', onPointerDown, true)
        win!.addEventListener('mousedown', onTriggerClose, true)
        win!.addEventListener('contextmenu', onTriggerClose, true)

        // shadow root
        const targetShadowRoot: any = getShadowRoot(targetEle)
        if (targetShadowRoot) {
          targetShadowRoot.addEventListener('mousedown', onTriggerClose, true)
          targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true)
        }

        // Warning if target and popup not in same root
        if (process.env.NODE_ENV !== 'production' && targetEle) {
          const targetRoot = targetEle.getRootNode?.()
          const popupRoot = popupEle.getRootNode?.()

          warning(
            targetRoot === popupRoot,
            `trigger element and popup element should in same shadow root.`,
          )
        }
        onCleanup(() => {
          win!.removeEventListener('pointerdown', onPointerDown, true)
          win!.removeEventListener('mousedown', onTriggerClose, true)
          win!.removeEventListener('contextmenu', onTriggerClose, true)

          if (targetShadowRoot) {
            targetShadowRoot.removeEventListener(
              'mousedown',
              onTriggerClose,
              true,
            )
            targetShadowRoot.removeEventListener(
              'contextmenu',
              onTriggerClose,
              true,
            )
          }
        })
      }
    },
  )
  function onPopupPointerDown() {
    popupPointerDownRef.value = true
  }
  return onPopupPointerDown
}
