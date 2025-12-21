import type { InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'

export interface UnstableContextProps {
  /** Only used for antd site v6 preview usage. */
  open?: Ref<boolean>
}

const UnstableContextKey: InjectionKey<UnstableContextProps> = Symbol('UnstableContext')
export function useUnstableContext() {
  return inject(UnstableContextKey, {})
}

export function useUnstableContextProvider(value: UnstableContextProps) {
  provide(UnstableContextKey, value)
}
