import type { InjectionKey } from 'vue'
import { defineComponent, inject, provide } from 'vue'

const EmptyList: string[] = []

// ========================= Path Register =========================
export interface PathRegisterContextProps {
  registerPath: (key: string, keyPath: string[]) => void
  unregisterPath: (key: string, keyPath: string[]) => void
}

export const PathRegisterContext: InjectionKey<PathRegisterContextProps> = Symbol('PathRegisterContext')

export const PathRegisterContextProvider = defineComponent({
  props: {
    value: Object,
  },
  setup(props, { slots }) {
    provide(PathRegisterContext, props.value)
    return () => slots.default?.()
  },
})

export function useMeasure() {
  return inject(PathRegisterContext)
}

// ========================= Path Tracker ==========================
export const PathTrackerContext: InjectionKey<string[]> = Symbol('PathTrackerContext')

export const PathTrackerContextProvider = defineComponent({
  props: {
    value: Array,
  },
  inheritAttrs: false,
  setup(props, { slots }) {
    provide(PathTrackerContext, EmptyList)
    return () => slots.default?.()
  },
})

export function useFullPath(eventKey?: string) {
  const parentKeyPath = inject(PathTrackerContext) ?? EmptyList
  return eventKey !== undefined ? [...parentKeyPath, eventKey] : parentKeyPath
}

// =========================== Path User ===========================
export interface PathUserContextProps {
  isSubPathKey: (pathKeys: string[], eventKey: string) => boolean
}

export const PathUserContext: InjectionKey<PathUserContextProps> = Symbol('PathUserContext')

export const PathUserContextProvider = defineComponent({
  props: {
    value: Object,
  },
  inheritAttrs: false,
  setup(props, { slots }) {
    provide(PathUserContext, props.value)
    return () => slots.default?.()
  },
})

export function useInjectPathUserContext() {
  return inject(PathUserContext) || null
}
