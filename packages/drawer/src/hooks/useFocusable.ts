import type { Ref } from 'vue'
import { useLockFocus } from '@v-c/util/dist/Dom/focus'
import { useFocusBoundaryProvider } from '@v-c/util/dist/Dom/focusBoundary'
import { computed, nextTick, watch } from 'vue'

export default function useFocusable(
  getContainer: () => HTMLElement,
  open: Ref<boolean | undefined>,
  autoFocus?: Ref<boolean | undefined>,
  focusTrap?: Ref<boolean | undefined>,
  mask?: Ref<boolean | undefined>,
) {
  const mergedFocusTrap = computed(() => focusTrap?.value ?? mask?.value !== false)

  // Focus lock
  const [, registerAllowedElement] = useLockFocus(computed(() => open.value! && mergedFocusTrap.value), getContainer)
  useFocusBoundaryProvider({
    registerAllowedElement,
  })

  // Auto Focus
  watch(
    open,
    (val) => {
      if (val && autoFocus?.value === true) {
        nextTick(() => {
          getContainer()?.focus({ preventScroll: true })
        })
      }
    },
    { flush: 'post', immediate: true },
  )
}
