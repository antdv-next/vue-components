import type { Ref } from 'vue'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import { ref } from 'vue'
import channelUpdate from './channelUpdate'

type Updater<T> = T | ((origin: T) => T)

type UpdateCallbackFunc = () => void

type NotifyEffectUpdate = (callback: UpdateCallbackFunc) => void

/**
 * Batcher for record any useEffectState need update.
 */
export function useBatcher(): NotifyEffectUpdate {
  // Updater Trigger
  const updateFuncRef = ref<UpdateCallbackFunc[] | null>(null)

  // Notify update
  const notifyEffectUpdate: NotifyEffectUpdate = (callback) => {
    if (!updateFuncRef.value) {
      updateFuncRef.value = []

      channelUpdate(() => {
        updateFuncRef.value!.forEach((fn) => {
          fn()
        })
        updateFuncRef.value = null
      })
    }

    updateFuncRef.value.push(callback)
  }

  return notifyEffectUpdate
}

/**
 * Trigger state update by ref to save perf.
 */
export default function useEffectState<T extends string | number | object>(
  notifyEffectUpdate: NotifyEffectUpdate,
  defaultValue?: T | null | undefined,
): [Ref<T | null | undefined>, (nextValue: Updater<T>) => void] {
  // Value
  const stateValue = ref(defaultValue) as Ref<T | null | undefined>

  // Set State
  const setEffectVal = useEvent((nextValue: Updater<T>) => {
    notifyEffectUpdate(() => {
      stateValue.value = nextValue as any
    })
  })

  return [stateValue, setEffectVal]
}
