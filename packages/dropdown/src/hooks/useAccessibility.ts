import type { Ref } from 'vue'
import KeyCode from '@v-c/util/dist/KeyCode'
import raf from '@v-c/util/dist/raf'
import { shallowRef, watch } from 'vue'

const { ESC, TAB } = KeyCode

interface UseAccessibilityProps {
  open: Ref<boolean>
  triggerRef: Ref<any>
  onOpenChange?: (open: boolean) => void
  autoFocus?: Ref<boolean>
  overlayRef?: Ref<any>
}

export default function useAccessibility({
  open,
  triggerRef,
  onOpenChange,
  autoFocus,
  overlayRef,
}: UseAccessibilityProps) {
  const focusMenuRef = shallowRef(false)
  const handleCloseMenuAndReturnFocus = () => {
    if (open.value) {
      triggerRef.value?.focus?.()
      onOpenChange?.(false)
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
  watch(open, (_n, _o, onCleanup) => {
    if (open.value) {
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
  }, { immediate: true })
}
