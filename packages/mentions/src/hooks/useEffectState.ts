import { shallowRef, watch } from 'vue'

export type Trigger = (callback?: VoidFunction) => void

/**
 * Trigger a callback on state change
 */

export default function useEffectState(): Trigger {
  const effectId = shallowRef<{
    id: number
    callback: VoidFunction | undefined
  }>({
    id: 0,
    callback: undefined,
  })

  const update = (callback?: VoidFunction) => {
    effectId.value = {
      id: effectId.value.id + 1,
      callback,
    }
  }

  watch(
    () => effectId?.value?.id,
    () => {
      effectId.value?.callback?.()
    },
  )
  return update
}
