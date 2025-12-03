import type { InjectionKey, Ref } from 'vue'
import type { SelectInputProps } from '.'
import { inject, provide, ref } from 'vue'

export type ContentContextProps = SelectInputProps

const SelectInputKey: InjectionKey<Ref<ContentContextProps>> = Symbol('SelectInputContext')

export function useSelectInputContext() {
  return inject(SelectInputKey, ref(null) as any) as Ref<ContentContextProps | null>
}

export function useSelectInputProvider(context: Ref<ContentContextProps>) {
  provide(SelectInputKey, context)
}
