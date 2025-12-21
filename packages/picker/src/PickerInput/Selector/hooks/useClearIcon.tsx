import type { VueNode } from '@v-c/util/dist/type'
import type { ComputedRef, Ref } from 'vue'
import { warning } from '@v-c/util'
import { computed } from 'vue'

export default function useClearIcon(
  prefixCls: Ref<string>,
  allowClear?: Ref<boolean | { clearIcon?: VueNode }>,
  clearIcon?: ComputedRef<VueNode>,
): ComputedRef<VueNode> {
  return computed(() => {
    if (process.env.NODE_ENV !== 'production' && clearIcon) {
      warning(false, '`clearIcon` will be removed in future. Please use `allowClear` instead.')
    }

    if (allowClear?.value === false) {
      return null
    }

    const config = allowClear?.value && typeof allowClear.value === 'object' ? allowClear.value : {}

    return config.clearIcon || clearIcon?.value || <span class={`${prefixCls.value}-clear-btn`} />
  })
}
