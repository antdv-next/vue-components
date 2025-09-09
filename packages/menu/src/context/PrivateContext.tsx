import type { InjectionKey } from 'vue'
import type { MenuProps } from '../Menu'
import { defineComponent, inject, provide } from 'vue'

export interface PrivateContextProps {
  _internalRenderMenuItem?: MenuProps['_internalRenderMenuItem']
  _internalRenderSubMenuItem?: MenuProps['_internalRenderSubMenuItem']
}

const PrivateContext: InjectionKey<PrivateContextProps> = Symbol('PrivateContext')

export function useInjectPrivateContext() {
  return inject(PrivateContext) || null
}

export const PrivateContextProvider = defineComponent({
  props: {
    value: Object,
  },
  inheritAttrs: false,
  setup(props, { slots }) {
    provide(PrivateContext, props.value)
    return () => slots.default?.()
  },
})
