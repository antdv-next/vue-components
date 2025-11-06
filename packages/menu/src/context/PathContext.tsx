import type { InjectionKey, Ref } from 'vue'
import { computed, defineComponent, inject, provide, ref } from 'vue'

const EmptyList: string[] = []

// ========================= Path Register =========================
export interface PathRegisterContextProps {
  registerPath: (key: string, keyPath: string[]) => void
  unregisterPath: (key: string, keyPath: string[]) => void
}

const PathRegisterContextKey: InjectionKey<PathRegisterContextProps> = Symbol('PathRegisterContext')

export function useMeasure() {
  return inject(PathRegisterContextKey, null)
}

export function useMeasureProvider(context: PathRegisterContextProps) {
  provide(PathRegisterContextKey, context)
}

export const MeasureProvider = defineComponent<PathRegisterContextProps>(
  (props, { slots }) => {
    useMeasureProvider(props)
    return () => {
      return slots?.default?.()
    }
  },
)

// ========================= Path Tracker ==========================

const PathTrackerContextKey: InjectionKey<Ref<string[]>> = Symbol('PathTrackerContext')

export function useFullPath(eventKey?: Ref<string | undefined>) {
  const parentKeyPath = inject(PathTrackerContextKey, ref(EmptyList))
  return computed(() => {
    return eventKey !== undefined ? [...parentKeyPath.value, eventKey.value] : parentKeyPath.value
  })
}

// =========================== Path User ===========================
export interface PathUserContextProps {
  isSubPathKey: (pathKeys: string[], eventKey: string) => boolean
}

const PathUserContextKey: InjectionKey<PathUserContextProps> = Symbol('PathUserContext')

export function usePathUserContextProvider(context: PathUserContextProps) {
  provide(PathUserContextKey, context)
}

export function usePathUser() {
  return inject(PathUserContextKey, null)
}

export const PathUserProvider = defineComponent<PathUserContextProps>(
  (props, { slots }) => {
    usePathUserContextProvider(props)
    return () => {
      return slots?.default?.()
    }
  },
)
