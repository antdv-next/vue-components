import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject, provide } from 'vue'

const EmptyList: string[] = []

export interface PathRegisterContextProps {
  registerPath: (key: string, keyPath: string[]) => void
  unregisterPath: (key: string, keyPath: string[]) => void
}

const PathRegisterContextKey: InjectionKey<PathRegisterContextProps | null> = Symbol('MenuPathRegister')

export function providePathRegisterContext(value: PathRegisterContextProps | null) {
  provide(PathRegisterContextKey, value)
}

export function useMeasure() {
  return inject(PathRegisterContextKey, null)
}

const PathTrackerContextKey: InjectionKey<ComputedRef<string[]>> = Symbol('MenuPathTracker')

export function providePathTrackerContext(path: ComputedRef<string[]>) {
  provide(PathTrackerContextKey, path)
}

export function useFullPath(eventKey?: string) {
  const parentKeyPath = inject(
    PathTrackerContextKey,
    computed(() => EmptyList),
  )

  return computed(() => {
    const parent = parentKeyPath.value
    if (eventKey === undefined) {
      return parent
    }
    return [...parent, eventKey]
  })
}

export interface PathUserContextProps {
  isSubPathKey: (pathKeys: string[], eventKey: string) => boolean
}

const PathUserContextKey: InjectionKey<PathUserContextProps | null> = Symbol('MenuPathUser')

export function providePathUserContext(value: PathUserContextProps | null) {
  provide(PathUserContextKey, value)
}

export function usePathUserContext() {
  return inject(PathUserContextKey, null)
}
