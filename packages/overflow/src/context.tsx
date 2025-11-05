import type { Key } from '@v-c/util/dist/type'
import type { ComputedRef, InjectionKey, PropType } from 'vue'
import { computed, defineComponent, inject, provide } from 'vue'

export interface OverflowContextType {
  prefixCls: string
  responsive: boolean
  order: number
  registerSize: (key: Key, width: number | null) => void
  display: boolean

  invalidate: boolean

  // Item Usage
  item?: any
  itemKey?: Key
  className?: string
}

const OverflowContextKey: InjectionKey<ComputedRef<OverflowContextType | null>> = Symbol('OverflowContext')

export const OverflowContextProvider = defineComponent({
  name: 'OverflowContextProvider',
  inheritAttrs: false,
  props: {
    value: { type: Object as PropType<any> },
  },
  setup(props, { slots }) {
    provide(
      OverflowContextKey,
      computed(() => props.value!),
    )
    return () => slots.default?.()
  },
})

export function useInjectOverflowContext() {
  return inject(OverflowContextKey, null)
}
