import { ref } from 'vue'

/**
 * Memoize a callback function to keep reference stable
 */
export default function useMemoCallback<T extends (...args: any[]) => any>(callback: T): T {
  const fnRef = ref(callback)
  fnRef.value = callback

  const memoFn = ((...args: any[]) => {
    return fnRef.value(...args)
  }) as T

  return memoFn
}
