import type { InjectionKey, Ref } from 'vue'
import { inject, provide, ref } from 'vue'

export interface UnstableContextProps {
  /**
   * Used for Timeline component `reverse` prop.
   * Safe to remove if refactor.
   */
  railFollowPrevStatus?: Ref<boolean>
}

const UnstableContextKey: InjectionKey<UnstableContextProps> = Symbol('UnstableContext')

export function useUnstableContext(): UnstableContextProps {
  return inject(UnstableContextKey, {
    railFollowPrevStatus: ref(),
  } as UnstableContextProps)
}

export function useUnstableProvider(value: UnstableContextProps) {
  provide(UnstableContextKey, value)
}
