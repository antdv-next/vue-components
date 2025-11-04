import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
import { warning } from '@v-c/util/dist/warning'
import { ref, watchEffect } from 'vue'
import { getWin } from '../util'

export default function useWinClick(
  open: boolean,
  clickToHide: boolean,
  targetEle: HTMLElement,
  popupEle: HTMLElement,
  mask: boolean,
  maskClosable: boolean,
  inPopupOrChild: (target: EventTarget) => boolean,
  triggerOpen: (open: boolean) => void,
) {
  const popupPointerDownRef = ref(false)
  watchEffect((onCleanup) => {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      const onPointerDown = () => {
        popupPointerDownRef.value = false
      }
      const onTriggerClose = (e: MouseEvent) => {
        if (
          open
          && !inPopupOrChild(e.composedPath?.()?.[0] || e.target)
          && !popupPointerDownRef.value
        ) {
          triggerOpen(false)
        }
      }

      const win = getWin(popupEle)
      if (win) {
        win.addEventListener('pointerdown', onPointerDown, true)
        win.addEventListener('mousedown', onTriggerClose, true)
        win.addEventListener('contextmenu', onTriggerClose, true)
      }

      // shadow root
      const targetShadowRoot = getShadowRoot(targetEle)
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener('mousedown', onTriggerClose, true)
        targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true)
      }

      // Warning if target and popup not in same root
      if (process.env.NODE_ENV !== 'production') {
        const targetRoot = targetEle?.getRootNode?.()
        const popupRoot = popupEle.getRootNode?.()

        warning(
          targetRoot === popupRoot,
          `trigger element and popup element should in same shadow root.`,
        )
      }
      onCleanup(() => {
        console.log('watchEffect-onCleanup')
        if (win) {
          win.removeEventListener('pointerdown', onPointerDown, true)
          win.removeEventListener('mousedown', onTriggerClose, true)
          win.removeEventListener('contextmenu', onTriggerClose, true)
        }

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
  })
  function onPopupPointerDown() {
    popupPointerDownRef.value = true
  }

  return onPopupPointerDown
}
