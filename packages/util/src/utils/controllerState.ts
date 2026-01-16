import type { Ref } from 'vue'
import { nextTick, shallowRef, toValue, watch } from 'vue'

export function useController<T = any>(
  state: Ref<T | undefined>,
  emit?: any,
  updateKey: string = 'value',
  defaultState?: T,
) {
  const mergedState = shallowRef<T>(defaultState ?? state.value)
  function setState(nextState: T) {
    // 非受控模式下，可以直接赋值
    if (emit) {
      emit(`update:${updateKey}`, nextState)
    }
    nextTick(() => {
      if (state.value === undefined) {
        mergedState.value = nextState
      }
    })
  }

  watch(
    () => toValue(state),
    () => {
      const prevState = toValue(mergedState)
      const nextState = toValue(state)
      if (prevState !== nextState) {
        mergedState.value = nextState as T
      }
    },
  )
  return [state, setState]
}
