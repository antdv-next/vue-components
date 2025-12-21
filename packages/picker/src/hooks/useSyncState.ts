import type { Ref } from 'vue'
import { ref, watch } from 'vue'

/**
 * Sync value with state.
 * This should only used for internal which not affect outside calculation.
 * Since it's not safe for suspense.
 */
export default function useSyncState<T>(
  defaultValue: T,
  controlledValue?: Ref<T | undefined> | (() => T | undefined),
): [getter: (useControlledValueFirst?: boolean) => T, setter: (nextValue: T) => void, value: Ref<T>] {
  const valueRef = ref(defaultValue) as Ref<T>

  const getControlledValue = () => {
    if (typeof controlledValue === 'function') {
      return controlledValue()
    }
    return controlledValue?.value
  }

  const getter = (useControlledValueFirst?: boolean) => {
    const controlled = getControlledValue()
    return useControlledValueFirst && controlled !== undefined ? controlled : valueRef.value
  }

  const setter = (nextValue: T) => {
    valueRef.value = nextValue
  }

  watch(() => getControlledValue(), (val) => {
    if (val !== undefined) {
      valueRef.value = val
    }
  })

  return [getter, setter, valueRef]
}
