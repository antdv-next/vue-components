import type { VueNode } from '@v-c/util/dist/type'
import type { ComputedRef, Ref } from 'vue'
import { warning } from '@v-c/util'
import { computed } from 'vue'

export function fillClearIcon(
  prefixCls: string,
  allowClear?: boolean | { clearIcon?: VueNode },
  clearIcon?: VueNode,
) {
  if (process.env.NODE_ENV !== 'production' && clearIcon) {
    warning(false, '`clearIcon` will be removed in future. Please use `allowClear` instead.')
  }

  if (allowClear === false) {
    return null
  }

  const config = allowClear && typeof allowClear === 'object' ? allowClear : {}

  return config.clearIcon || clearIcon || <span class={`${prefixCls}-clear-btn`} />
}

export default function useClearIcon(
  prefixCls: Ref<string>,
  allowClear?: Ref<boolean | { clearIcon?: VueNode }>,
  clearIcon?: ComputedRef<VueNode>,
): ComputedRef<VueNode> {
  return computed(() => fillClearIcon(prefixCls.value, allowClear?.value, clearIcon?.value))
}
