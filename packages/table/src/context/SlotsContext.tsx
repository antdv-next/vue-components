import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject, provide } from 'vue'
import type { ColumnType } from '../interface'

export type ContextSlots = {
  emptyText?: (...args: any[]) => any
  expandIcon?: (...args: any[]) => any
  title?: (...args: any[]) => any
  footer?: (...args: any[]) => any
  summary?: (...args: any[]) => any
  bodyCell?: (...args: any[]) => any
  expandColumnTitle?: (...args: any[]) => any
  headerCell?: (...args: any[]) => any
  customFilterIcon?: (...args: any[]) => any
  customFilterDropdown?: (...args: any[]) => any
  // legacy column slots
  [key: string]: ((...args: any[]) => any) | undefined
}

const SlotsContextKey: InjectionKey<ComputedRef<ContextSlots>> = Symbol('SlotsContextProps')

export const useProvideSlots = (props: ComputedRef<ContextSlots>) => {
  provide(SlotsContextKey, props)
}

export const useInjectSlots = () => {
  return inject(SlotsContextKey, computed(() => ({})) as ComputedRef<ContextSlots>)
}

export type ResizeColumnContextProps = {
  onResizeColumn: (width: number, column: ColumnType<any>) => void
}

const ResizeColumnContextKey: InjectionKey<ResizeColumnContextProps> = Symbol('ResizeColumnContext')

export const useProvideResizeColumn = (props: ResizeColumnContextProps) => {
  provide(ResizeColumnContextKey, props)
}

export const useInjectResizeColumn = () => {
  return inject(ResizeColumnContextKey, { onResizeColumn: () => {} } as ResizeColumnContextProps)
}
