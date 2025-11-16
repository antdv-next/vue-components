import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import type { InternalNamePath } from './interface'

export interface ListContextProps {
  getKey: (namePath: InternalNamePath) => [InternalNamePath[number], InternalNamePath]
}

const ListContextKey: InjectionKey<ListContextProps | null> = Symbol('FormListContext')

export function useListContextProvider(context: ListContextProps | null) {
  provide(ListContextKey, context)
}

export function useListContext() {
  return inject(ListContextKey, null)
}

export default ListContextKey
