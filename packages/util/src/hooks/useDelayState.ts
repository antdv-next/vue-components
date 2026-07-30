import type { Ref } from 'vue'
import { onBeforeUnmount, ref } from 'vue'
import raf from '../raf'

export type DelayConfig = { frame: number, ms?: never } | { frame?: never, ms: number }

export type SetDelayState<T> = (
  nextValue: T | ((prev: T) => T),
  /** `true` updates immediately. `false` delays the update by one frame. */
  immediatelyOrDelay?: boolean | DelayConfig,
) => void

type DelayInfo
  = | [isRaf: true, delay: number]
    | [isRaf: false, delay: ReturnType<typeof setTimeout>]

/**
 * Similar to `useState`, but updates on the next frame by default.
 * Pending updates are always replaced by the latest one.
 */
export default function useDelayState<T>(
  defaultValue: T | (() => T),
): [Ref<T>, SetDelayState<T>] {
  const initValue: T
    = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue

  const value = ref(initValue) as Ref<T>
  let delayInfo: DelayInfo | null = null

  const cancelPending = () => {
    if (delayInfo) {
      const [isRaf, delay] = delayInfo
      if (isRaf) {
        raf.cancel(delay)
      }
      else {
        clearTimeout(delay)
      }
      delayInfo = null
    }
  }

  const applyValue = (nextValue: T | ((prev: T) => T)) => {
    value.value
      = typeof nextValue === 'function'
        ? (nextValue as (prev: T) => T)(value.value)
        : nextValue
  }

  const setDelayValue: SetDelayState<T> = (nextValue, immediatelyOrDelay) => {
    const delayConfig = immediatelyOrDelay || { frame: 1 }
    cancelPending()

    if (delayConfig === true) {
      applyValue(nextValue)
    }
    else if ('ms' in delayConfig) {
      delayInfo = [false, setTimeout(() => applyValue(nextValue), delayConfig.ms)]
    }
    else {
      delayInfo = [true, raf(() => applyValue(nextValue), delayConfig.frame)]
    }
  }

  onBeforeUnmount(cancelPending)

  return [value, setDelayValue]
}
