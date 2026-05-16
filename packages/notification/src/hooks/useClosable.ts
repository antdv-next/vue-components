import type { AriaAttributes, ComputedRef } from 'vue'
import type { VueNode } from '@v-c/util/dist/type'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed } from 'vue'

export type ClosableConfig = {
  closeIcon?: VueNode
  disabled?: boolean
  onClose?: VoidFunction
} & AriaAttributes & Record<`data-${string}`, unknown>

export type ClosableType = boolean | ClosableConfig | null | undefined

export interface ParsedClosableConfig extends ClosableConfig {
  closeIcon: VueNode
  disabled: boolean
}

/**
 * Normalizes the closable option into a boolean flag, parsed config, and
 * aria props for the close button. Mirrors rc-notification@2.0 useClosable.
 */
export default function useClosable(
  closable: ComputedRef<ClosableType>,
): [ComputedRef<boolean>, ComputedRef<ParsedClosableConfig>, ComputedRef<Record<string, unknown>>] {
  const closableObj = computed<ClosableConfig>(() => {
    const value = closable.value
    if (value === false) {
      return { closeIcon: null, disabled: true }
    }
    if (typeof value === 'object' && value !== null) {
      return value
    }
    return {}
  })

  const closableConfig = computed<ParsedClosableConfig>(() => {
    const obj = closableObj.value
    return {
      ...obj,
      closeIcon: 'closeIcon' in obj ? obj.closeIcon : '×',
      disabled: obj.disabled ?? false,
    }
  })

  const closableAriaProps = computed(() => pickAttrs(closableConfig.value, true))

  return [
    computed(() => !!closable.value),
    closableConfig,
    closableAriaProps,
  ]
}
