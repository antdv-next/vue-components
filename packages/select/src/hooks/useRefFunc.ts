export default function useRefFunc<T extends (...args: any[]) => any>(callback: T): T {
  const cacheFn = (...args: any[]) => {
    return callback(...args)
  }
  return cacheFn as any
}
