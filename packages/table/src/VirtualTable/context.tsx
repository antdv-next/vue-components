import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import type { GetComponent, TableSticky } from '../interface'

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

export const useProvideStaticContext = (value: StaticContextProps) => {
  provide(StaticContextKey, value)
}

export const useInjectStaticContext = () => {
  return inject(StaticContextKey, {} as StaticContextProps)
}

export const useProvideGridContext = (value: GridContextProps) => {
  provide(GridContextKey, value)
}

export const useInjectGridContext = () => {
  return inject(GridContextKey, {} as GridContextProps)
}
