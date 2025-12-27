import type { InjectionKey } from 'vue'
import { inject, provide, reactive } from 'vue'

export interface PerfRecord {
  renderWithProps: boolean
}

const defaultPerfRecord: PerfRecord = {
  renderWithProps: false,
}

const PerfContextKey: InjectionKey<PerfRecord> = Symbol('TablePerfContext')

export function useProvidePerfContext(record = reactive({ ...defaultPerfRecord })) {
  provide(PerfContextKey, record)
  return record
}

export function useInjectPerfContext() {
  return inject(PerfContextKey, defaultPerfRecord)
}
