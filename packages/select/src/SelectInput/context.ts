import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject, provide } from 'vue'
import type { SelectInputProps } from '.'

export type ContentContextProps = SelectInputProps

const SelectInputContextKey: InjectionKey<ComputedRef<ContentContextProps>> = Symbol(
  'SelectInputContextKey',
)

export function useSelectInputContext() {
  const ctx = inject(SelectInputContextKey, null)
  return computed(() => ctx?.value)
}

export function useProvideSelectInputContext(value: ComputedRef<ContentContextProps>) {
  provide(SelectInputContextKey, value)
}

export default SelectInputContextKey
