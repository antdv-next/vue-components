import type { InjectionKey, ShallowRef } from 'vue'
import { inject, provide, shallowRef } from 'vue'
import type { MenuProps } from '../interface'

export interface PrivateContextProps {
  _internalRenderMenuItem?: MenuProps['_internalRenderMenuItem']
  _internalRenderSubMenuItem?: MenuProps['_internalRenderSubMenuItem']
}

const PrivateContextKey: InjectionKey<ShallowRef<PrivateContextProps>> = Symbol('MenuPrivateContext')

export function providePrivateContext(value: PrivateContextProps) {
  const context = shallowRef(value)
  provide(PrivateContextKey, context)
  return context
}

export function usePrivateContext() {
  return inject(PrivateContextKey, shallowRef<PrivateContextProps>({}))
}
