import type { Ref } from 'vue'
import KeyCode from '@v-c/util/dist/KeyCode'
import raf from '@v-c/util/dist/raf'
import { shallowRef, watch } from 'vue'

const { ESC, TAB } = KeyCode

interface UseAccessibilityProps {
  visible: Ref<boolean>
  triggerRef: Ref<any>
  onVisibleChange?: (visible: boolean) => void
  autoFocus?: Ref<boolean>
  overlayRef?: Ref<any>
}

export default function useAccessibility({
  visible,
  triggerRef,
  onVisibleChange,
  autoFocus,
  overlayRef,
}: UseAccessibilityProps) {
  const focusMenuRef = shallowRef(false)
  const handleCloseMenuAndReturnFocus = () => {
    if (visible.value) {
      triggerRef.value?.focus?.()
      onVisibleChange?.(false)
    }
  }

  const focusMenu = () => {
    if (overlayRef?.value?.focus) {
      overlayRef.value.focus()
      focusMenuRef.value = true
      return true
    }
    return false
  }

  const handleKeyDown = (event: any) => {
    switch (event.keyCode) {
      case ESC:
        handleCloseMenuAndReturnFocus()
        break
      case TAB: {
        let focusResult: boolean = false
        if (!focusMenuRef.value) {
          focusResult = focusMenu()
        }

        if (focusResult) {
          event.preventDefault()
        }
        else {
          handleCloseMenuAndReturnFocus()
        }
        break
      }
    }
  }
  watch(visible, (_n, _o, onCleanup) => {
    if (visible.value) {
      window.addEventListener('keydown', handleKeyDown)
      if (autoFocus) {
        // FIXME: hack with raf
        raf(focusMenu, 3)
      }
      onCleanup(() => {
        window.removeEventListener('keydown', handleKeyDown)
        focusMenuRef.value = false
      })
    }
    else {
      onCleanup(() => {
        focusMenuRef.value = false
      })
    }
  })
}
