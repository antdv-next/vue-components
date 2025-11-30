import type { MaybeRefOrGetter } from 'vue'
import { onBeforeUnmount, ref, toValue } from 'vue'

export default function useLock(duration: MaybeRefOrGetter<number> = 250): [() => boolean, (lock: boolean) => void] {
  const lockRef = ref<boolean | null>(null)
  const timeoutRef = ref<number>()

  onBeforeUnmount(() => {
    if (timeoutRef.value) {
      window.clearTimeout(timeoutRef.value)
    }
  })

  function doLock(locked: boolean) {
    if (locked || lockRef.value === null) {
      lockRef.value = locked
    }

    if (timeoutRef.value) {
      window.clearTimeout(timeoutRef.value)
    }
    timeoutRef.value = window.setTimeout(() => {
      lockRef.value = null
    }, toValue(duration))
  }

  return [() => lockRef.value as boolean, doLock]
}
