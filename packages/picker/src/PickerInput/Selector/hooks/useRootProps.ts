import type { ComputedRef, Reactive } from 'vue'
import { computed } from 'vue'
import { pickProps } from '../../../utils/miscUtil'

const propNames = ['onMouseEnter', 'onMouseLeave'] as const

export default function useRootProps(
  props: Reactive<Record<string, any>>,
): ComputedRef<Record<string, any>> {
  return computed(() => {
    return pickProps(props, propNames)
  })
}
