import type { InjectionKey } from 'vue'
import { inject, provide, reactive } from 'vue'

export interface PerfRecord {
  renderWithProps: boolean
}

const defaultPerfRecord: PerfRecord = {
  renderWithProps: false,
}

const PerfContextKey: InjectionKey<PerfRecord> = Symbol('TablePerfContext')

export const useProvidePerfContext = (record = reactive({ ...defaultPerfRecord })) => {
  provide(PerfContextKey, record)
  return record
}

export const useInjectPerfContext = () => {
  return inject(PerfContextKey, defaultPerfRecord)
}
