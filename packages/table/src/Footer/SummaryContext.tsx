import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import type { ColumnType, StickyOffsets } from '../interface'

type FlattenColumns<RecordType> = readonly (ColumnType<RecordType> & { scrollbar?: boolean })[]

export interface SummaryContextProps<RecordType = any> {
  stickyOffsets?: StickyOffsets
  scrollColumnIndex?: number | null
  flattenColumns?: FlattenColumns<RecordType>
}

const SummaryContextKey: InjectionKey<SummaryContextProps> = Symbol('TableSummaryContext')

export const useProvideSummaryContext = (value: SummaryContextProps) => {
  provide(SummaryContextKey, value)
}

export const useInjectSummaryContext = <RecordType = any>() => {
  return inject(SummaryContextKey, {} as SummaryContextProps<RecordType>)
}
