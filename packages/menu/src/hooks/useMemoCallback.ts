import { shallowRef } from 'vue'

export default function useMemoCallback<T extends (...args: any[]) => any>(func?: T): T | undefined {
  if (!func) {
    return undefined
  }

  const ref = shallowRef(func)
  ref.value = func

  const callback = ((...args: any[]) => ref.value?.(...args)) as T

  return callback
}
