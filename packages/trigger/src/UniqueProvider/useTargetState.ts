import type { UniqueShowOptions } from '../context.ts'
import { ref } from 'vue'

/**
 * Control the state of popup bind target:
 * 1. When set `target`. Do show the popup.
 * 2. When `target` is removed. Do hide the popup.
 * 3. When `target` change to another one:
 *  a. We wait motion finish of previous popup.
 *  b. Then we set new target and show the popup.
 * 4. During appear/enter animation, cache new options and apply after animation completes.
 */
export default function useTargetState() {
  const options = ref<UniqueShowOptions>()
  const open = ref(false)
  const isAnimating = ref(false)
  const pendingOptionsRef = ref<UniqueShowOptions | null>()

  const trigger = (nextOptions: UniqueShowOptions | false) => {
    const wasOpen = open.value
    if (nextOptions === false) {
      // Clear pending options when hiding
      pendingOptionsRef.value = null
      open.value = false
    }
    else {
      if (isAnimating.value && wasOpen) {
        // If enter animation is in progress, cache new options
        pendingOptionsRef.value = nextOptions
      }
      else {
        open.value = true
        options.value = nextOptions
        pendingOptionsRef.value = null
        // Only mark as animating when transitioning from closed to open
        if (!wasOpen) {
          isAnimating.value = true
        }
      }
    }
  }
  const onVisibleChanged = (visible: boolean) => {
    if (visible) {
      // Animation enter completed, check if there are pending options
      isAnimating.value = false
      if (pendingOptionsRef.value) {
        // Apply pending options
        options.value = pendingOptionsRef.value
        pendingOptionsRef.value = null
      }
    }
    else {
      // Animation leave completed
      isAnimating.value = false
      pendingOptionsRef.value = null
    }
  }
  return [trigger, open, options, onVisibleChanged] as const
}
