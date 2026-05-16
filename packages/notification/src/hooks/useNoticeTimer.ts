import type { ComputedRef } from 'vue'
import { onScopeDispose, shallowRef, watch } from 'vue'

/**
 * Runs the notice auto-close timer and reports progress updates via rAF.
 * Returns controls to pause and resume the timer. Mirrors rc-notification@2.0
 * useNoticeTimer.
 */
export default function useNoticeTimer(
  duration: ComputedRef<number | false | null | undefined>,
  onClose: () => void,
  onUpdate: (percent: number) => void,
): [() => void, () => void] {
  const durationMs = shallowRef(0)
  const walking = shallowRef(false)
  let passTime = 0
  let lastRafTime: number | null = null
  let rafId: number | null = null

  const syncPassTime = () => {
    const now = Date.now()
    if (lastRafTime !== null) {
      passTime += now - lastRafTime
    }
    lastRafTime = now
  }

  const cancelStep = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const onPause = () => {
    syncPassTime()
    walking.value = false
  }

  const onResume = () => {
    if (durationMs.value > 0) {
      lastRafTime = Date.now()
      walking.value = true
    }
    else {
      onUpdate(0)
    }
  }

  // Reset accumulated passTime whenever duration changes.
  watch(duration, () => {
    const next = typeof duration.value === 'number' ? duration.value : 0
    durationMs.value = Math.max(next, 0) * 1000
    passTime = 0
    walking.value = durationMs.value > 0
  }, { immediate: true })

  // Drive the rAF loop while walking is true.
  watch(walking, (isWalking) => {
    cancelStep()
    if (!isWalking) {
      return
    }
    lastRafTime = Date.now()

    const step = () => {
      syncPassTime()
      if (passTime >= durationMs.value) {
        onUpdate(1)
        onClose()
        return
      }
      onUpdate(Math.min(passTime / durationMs.value, 1))
      rafId = requestAnimationFrame(step)
    }

    step()
  }, { immediate: true })

  onScopeDispose(() => {
    cancelStep()
  })

  return [onResume, onPause]
}
