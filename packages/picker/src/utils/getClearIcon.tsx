import type { VNode } from 'vue'

export function getClearIcon(
  prefixCls: string,
  allowClear?: boolean | { clearIcon?: VNode },
  clearIcon?: VNode,
) {
  const mergedClearIcon = typeof allowClear === 'object' ? allowClear.clearIcon : clearIcon

  return mergedClearIcon || <span class={`${prefixCls}-clear-btn`} />
}
