import { shallowRef } from 'vue'

/**
 * Same as `useCallback` but always return a memoized function
 * which will call latest callback from ref.
 */
export default function useRefFunc<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = shallowRef(callback)
  callbackRef.value = callback

  const cacheFn = ((...args: any[]) => {
    return callbackRef.value(...args)
  }) as T

  return cacheFn
}
