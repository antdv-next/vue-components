import { ref } from 'vue'

/**
 * Cache callback function that always return same ref instead.
 * This is used for context optimization.
 */
export default function useMemoCallback<T extends (...args: any[]) => void>(
  func: T,
): T {
  const funRef = ref(func)
  funRef.value = func

  const callback = ((...args: any[]) => funRef.value?.(...args)) as any

  return func ? callback : undefined
}
