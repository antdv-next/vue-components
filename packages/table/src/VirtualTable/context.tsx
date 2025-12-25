import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import type { GetComponent, TableSticky } from '../interface'

export interface StaticContextProps {
  scrollY: number
  listItemHeight: number
  sticky?: boolean | TableSticky
  getComponent: GetComponent
  onScroll?: (e: Event) => void
}

const StaticContextKey: InjectionKey<StaticContextProps> = Symbol('StaticContextProps')

export const useProvideStatic = (props: StaticContextProps) => {
  provide(StaticContextKey, props)
}

export const useInjectStatic = () => {
  return inject(StaticContextKey, null as any)
}

export interface GridContextProps {
  columnsOffset: number[]
}

const GridContextKey: InjectionKey<GridContextProps> = Symbol('GridContextProps')

export const useProvideGrid = (props: GridContextProps) => {
  provide(GridContextKey, props)
}

export const useInjectGrid = () => {
  return inject(GridContextKey, { columnsOffset: [] } as GridContextProps)
}
