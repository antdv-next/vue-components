import { onBeforeUnmount, ref } from 'vue'

export default function useLock(duration: number = 250): [() => boolean, (lock: boolean) => void] {
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
    }, duration)
  }

  return [() => lockRef.value as boolean, doLock]
}
