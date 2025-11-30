import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject, provide } from 'vue'
import type { BaseSelectProps } from '../BaseSelect'

export interface BaseSelectContextProps extends BaseSelectProps {
  triggerOpen: boolean
  multiple: boolean
  toggleOpen: (open?: boolean) => void
  role?: string
}

const BaseSelectContextKey: InjectionKey<ComputedRef<BaseSelectContextProps>> = Symbol(
  'BaseSelectContextKey',
)

export function useProvideBaseSelectContext(value: ComputedRef<BaseSelectContextProps>) {
  provide(BaseSelectContextKey, value)
}

export default function useBaseProps() {
  const context = inject(BaseSelectContextKey, null)
  return computed(() => context?.value)
}
