import type { Ref } from 'vue'
import { raf } from '@v-c/util'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export default function useDelayState<T>(
  value: Ref<T | undefined>,
  defaultValue: T,
  onChange?: (next: T) => void,
) {
  const internalValue = ref(defaultValue)
  const state = computed(() => (value.value !== undefined ? value.value : internalValue.value))

  const nextValueRef = ref(state.value)
  const rafRef = ref<number>()

  const cancelRaf = () => {
    if (rafRef.value) {
      raf.cancel(rafRef.value)
    }
  }

  const doUpdate = () => {
    if (value.value === undefined) {
      internalValue.value = nextValueRef.value
    }

    if (onChange && state.value !== nextValueRef.value) {
      onChange(nextValueRef.value)
    }
  }

  const updateValue = (next: T, immediately?: boolean) => {
    cancelRaf()
    nextValueRef.value = next

    if (next || immediately) {
      doUpdate()
    }
    else {
      rafRef.value = raf(doUpdate)
    }
  }

  watch(value, () => {
    if (value.value !== undefined) {
      nextValueRef.value = value.value
    }
  })

  onBeforeUnmount(() => {
    cancelRaf()
  })

  return [state, updateValue] as const
}
