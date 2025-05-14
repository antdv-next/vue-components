import type { Ref } from 'vue'
import KeyCode from '@v-c/util/dist/KeyCode'
import raf from '@v-c/util/dist/raf'
import { onWatcherCleanup, ref, watch } from 'vue'

const { ESC, TAB } = KeyCode

interface UseAccessibilityProps {
  visible: boolean
  triggerRef: Ref<any>
  onVisibleChange?: (visible: boolean) => void
  autoFocus?: boolean
  overlayRef?: Ref<any>
}

export default function useAccessibility({
  visible,
  triggerRef,
  onVisibleChange,
  autoFocus,
  overlayRef,
}: UseAccessibilityProps) {
  const focusMenuRef = ref<boolean>(false)

  const handleCloseMenuAndReturnFocus = () => {
    if (visible) {
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

  const handleKeyDown = (event: KeyboardEvent) => {
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

  watch(() => visible, (newVisible) => {
    if (newVisible) {
      window.addEventListener('keydown', handleKeyDown)
      if (autoFocus) {
        // FIXME: hack with raf
        raf(focusMenu, 3)
      }
    }
    else {
      window.removeEventListener('keydown', handleKeyDown)
      focusMenuRef.value = false
    }
    onWatcherCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown)
      focusMenuRef.value = false
    })
  }, { immediate: true })
}
