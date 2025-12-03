import { onUnmounted, shallowRef } from 'vue'

export default function useLock(duration: number = 250): [() => boolean, (lock: boolean) => void] {
  const lockRef = shallowRef<boolean | null>(null)
  const timeoutRef = shallowRef<number | null>(null)

  // Clean up
  function cleanup() {
    if (timeoutRef.value !== null) {
      window.clearTimeout(timeoutRef.value)
      timeoutRef.value = null
    }
  }
  onUnmounted(() => {
    cleanup()
  })

  function doLock(locked: boolean) {
    if (locked || lockRef.value === null) {
      lockRef.value = locked
    }

    cleanup()
    timeoutRef.value = window.setTimeout(() => {
      lockRef.value = null
      timeoutRef.value = null
    }, duration)
  }

  return [() => !!lockRef.value, doLock]
}
