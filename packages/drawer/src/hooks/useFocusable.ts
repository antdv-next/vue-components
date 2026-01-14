import type { Ref } from 'vue'
import { useLockFocus } from '@v-c/util/dist/Dom/focus'
import { computed, watch } from 'vue'

export default function useFocusable(
  getContainer: () => HTMLElement,
  open: Ref<boolean | undefined>,
  autoFocus?: Ref<boolean | undefined>,
  focusTrap?: Ref<boolean | undefined>,
  mask?: Ref<boolean | undefined>,
) {
  const mergedFocusTrap = computed(() => focusTrap?.value ?? mask?.value !== false)

  // Focus lock
  useLockFocus(computed(() => open.value! && mergedFocusTrap.value), getContainer)

  // Auto Focus
  watch(
    open,
    (val) => {
      if (val && autoFocus?.value === true) {
        getContainer()?.focus({ preventScroll: true })
      }
    },
  )
}
