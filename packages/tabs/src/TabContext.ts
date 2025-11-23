import type { InjectionKey, ShallowRef } from 'vue'
import type { Tab } from './interface'
import { inject, provide } from 'vue'

export interface TabContextProps {
  tabs: Tab[]
  prefixCls: string
}

const TabContextKey: InjectionKey<ShallowRef<TabContextProps> | null> = Symbol('TabContext')

export function provideTabContext(value: ShallowRef<TabContextProps>) {
  provide(TabContextKey, value)
}

export function useTabContext() {
  return inject(TabContextKey, {} as ShallowRef<TabContextProps>)
}
