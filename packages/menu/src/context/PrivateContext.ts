import type { InjectionKey } from 'vue'
import type { MenuProps } from '../Menu'
import { inject, provide } from 'vue'

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
