import type { InjectionKey } from 'vue'
import type { ColumnType, StickyOffsets } from '../interface'
import { inject, provide } from 'vue'

type FlattenColumns<RecordType> = readonly (ColumnType<RecordType> & { scrollbar?: boolean })[]

export interface SummaryContextProps<RecordType = any> {
  stickyOffsets?: StickyOffsets
  scrollColumnIndex?: number | null
  flattenColumns?: FlattenColumns<RecordType>
}

const SummaryContextKey: InjectionKey<SummaryContextProps> = Symbol('TableSummaryContext')

export function useProvideSummaryContext(value: SummaryContextProps) {
  provide(SummaryContextKey, value)
}

export function useInjectSummaryContext<RecordType = any>() {
  return inject(SummaryContextKey, {} as SummaryContextProps<RecordType>)
}
