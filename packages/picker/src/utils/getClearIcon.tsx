import type { VNode } from 'vue'
import { isVueRenderable } from '@v-c/util'

export function getClearIcon(
  prefixCls: string,
  allowClear?: boolean | { clearIcon?: VNode },
  clearIcon?: VNode,
) {
  const mergedClearIcon = typeof allowClear === 'object' ? allowClear.clearIcon : clearIcon

  return isVueRenderable(mergedClearIcon)
    ? mergedClearIcon
    : <span class={`${prefixCls}-clear-btn`} />
}
