import type { ComputedRef, MaybeRef } from 'vue'
import raf from '@v-c/util/dist/raf'
import { computed, onBeforeUnmount, shallowRef, unref, watch } from 'vue'

/**
 * Run the auto-close timer for a notice and report progress updates.
 * Returns controls to pause and resume the timer.
 */
export default function useNoticeTimer(
  duration: MaybeRef<number | false | null | undefined>,
  onClose: () => void,
  onUpdate: (ptg: number) => void,
): [() => void, () => void, ComputedRef<number>] {
  const durationMs = computed(() => {
    const value = unref(duration)
    const merged = typeof value === 'number' ? value : 0
    return Math.max(merged, 0) * 1000
  })

  const walking = shallowRef(durationMs.value > 0)
  const passTime = shallowRef(0)
  let lastRafTime: number | null = null
  let rafId: number | null = null

  function syncPassTime() {
    const now = Date.now()
    if (lastRafTime !== null) {
      passTime.value += now - lastRafTime
    }
    lastRafTime = now
  }

  function cancelRaf() {
    if (rafId !== null) {
      raf.cancel(rafId)
      rafId = null
    }
  }

  function onPause() {
    syncPassTime()
    walking.value = false
  }

  function onResume() {
    if (durationMs.value > 0) {
      lastRafTime = Date.now()
      walking.value = true
    }
    else {
      onUpdate(0)
    }
  }

  // Reset when durationMs changed.
  watch(durationMs, () => {
    passTime.value = 0
    lastRafTime = null
    walking.value = durationMs.value > 0
  })

  // Drive raf loop while walking.
  watch(walking, (isWalking) => {
    cancelRaf()
    if (!isWalking) {
      return
    }

    function step() {
      syncPassTime()

      if (passTime.value >= durationMs.value) {
        onUpdate(1)
        onClose()
      }
      else {
        onUpdate(Math.min(passTime.value / durationMs.value, 1))
        rafId = raf(step)
      }
    }

    step()
  }, { immediate: true })

  onBeforeUnmount(() => {
    cancelRaf()
  })

  const percent = computed(() => {
    if (durationMs.value <= 0)
      return 0
    return Math.min(passTime.value / durationMs.value, 1)
  })

  return [onResume, onPause, percent]
}
