import type { InjectionKey, Ref } from 'vue'
import type { BaseSelectProps } from '../BaseSelect'
import { inject, provide, ref } from 'vue'

export interface BaseSelectContextProps extends BaseSelectProps {
  triggerOpen: boolean
  multiple: boolean
  toggleOpen: (open?: boolean) => void
  role?: string
  lockOptions: boolean
  rawOpen: boolean
}

const BaseSelectContext: InjectionKey<Ref<BaseSelectContextProps>> = Symbol('BaseSelectContext')

export function useBaseSelectProvider(context: Ref<BaseSelectContextProps>) {
  provide(BaseSelectContext, context)
}

export default function useBaseProps() {
  return inject(BaseSelectContext, ref(null) as any) as Ref<BaseSelectContextProps | null>
}
