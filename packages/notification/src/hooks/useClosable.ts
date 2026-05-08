import type { VueNode } from '@v-c/util/dist/type'
import type { ComputedRef, MaybeRef } from 'vue'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed, unref } from 'vue'

export type ClosableConfig = {
  closeIcon?: VueNode
  disabled?: boolean
  onClose?: VoidFunction
} & Record<string, any>

export type ClosableType = boolean | ClosableConfig | null | undefined

export interface ParsedClosableConfig {
  closeIcon: VueNode
  disabled: boolean
  onClose?: VoidFunction
  [key: string]: any
}

/**
 * Normalize the closable option into an enabled flag, parsed config, and aria props.
 */
export default function useClosable(closable: MaybeRef<ClosableType>): [
  ComputedRef<boolean>,
  ComputedRef<ParsedClosableConfig>,
  ComputedRef<Record<string, any>>,
] {
  const closableObj = computed<ClosableConfig>(() => {
    const value = unref(closable)
    if (value === false) {
      return { closeIcon: null, disabled: true }
    }
    if (typeof value === 'object' && value !== null) {
      return value
    }
    return {}
  })

  const enabled = computed(() => !!unref(closable))

  const closableConfig = computed<ParsedClosableConfig>(() => {
    const obj = closableObj.value
    return {
      ...obj,
      closeIcon: 'closeIcon' in obj ? obj.closeIcon : '×',
      disabled: obj.disabled ?? false,
    }
  })

  const closableAriaProps = computed(() => pickAttrs(closableConfig.value, true))

  return [enabled, closableConfig, closableAriaProps]
}
