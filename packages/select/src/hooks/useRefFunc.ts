import { shallowRef } from 'vue'

/**
 * Same as `React.useCallback` but always return a memoized function
 * but redirect to real function.
 * In Vue, we use shallowRef to store the callback reference.
 */
export default function useRefFunc<T extends (...args: any[]) => any>(callback: T): T {
  const funcRef = shallowRef<T>(callback)
  funcRef.value = callback

  const cacheFn = (...args: any[]) => {
    return funcRef.value(...args)
  }

  return cacheFn as T
}
