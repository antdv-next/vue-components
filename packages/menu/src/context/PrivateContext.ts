import type { InjectionKey } from 'vue'
import type { MenuProps } from '../Menu'
import { defineComponent, inject, provide } from 'vue'

export interface PrivateContextProps {
  _internalRenderMenuItem?: MenuProps['_internalRenderMenuItem']
  _internalRenderSubMenuItem?: MenuProps['_internalRenderSubMenuItem']
}

const PrivateContextKey: InjectionKey<PrivateContextProps> = Symbol('PrivateContext')

export function usePrivateProvider(context: PrivateContextProps) {
  provide(PrivateContextKey, context)
}

export function usePrivateContext() {
  return inject(PrivateContextKey, {})
}

export const PrivateContextProvider = defineComponent<PrivateContextProps>(
  (props, { slots }) => {
    usePrivateProvider(props)
    return () => {
      return slots?.default?.()
    }
  },
  {
    props: ['_internalRenderMenuItem', '_internalRenderSubMenuItem'],
  },
)
