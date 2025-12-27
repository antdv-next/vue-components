import type { InjectionKey } from 'vue'
import type { GetComponent, TableSticky } from '../interface'
import { inject, provide } from 'vue'

export interface StaticContextProps {
  scrollY: number
  listItemHeight?: number
  sticky?: boolean | TableSticky
  getComponent: GetComponent
  onScroll?: (event: Event) => void
}

export interface GridContextProps {
  columnsOffset: number[]
}

const StaticContextKey: InjectionKey<StaticContextProps> = Symbol('TableVirtualStaticContext')
const GridContextKey: InjectionKey<GridContextProps> = Symbol('TableVirtualGridContext')

export function useProvideStaticContext(value: StaticContextProps) {
  provide(StaticContextKey, value)
}

export function useInjectStaticContext() {
  return inject(StaticContextKey, {} as StaticContextProps)
}

export function useProvideGridContext(value: GridContextProps) {
  provide(GridContextKey, value)
}

export function useInjectGridContext() {
  return inject(GridContextKey, {} as GridContextProps)
}
