import type { Ref } from 'vue'
import type { DisplayValueType, Mode } from '../interface'
import { computed } from 'vue'

export interface AllowClearConfig {
  allowClear: boolean
  clearIcon: any
}

export function useAllowClear(_prefixCls: string, displayValues: Ref<DisplayValueType[]>, allowClear?: boolean | { clearIcon?: any }, clearIcon?: any, disabled: Ref<boolean> = computed(() => false), mergedSearchValue?: Ref<string>, mode?: Ref<Mode>) {
  const allowClearConfig = computed<Partial<AllowClearConfig>>(() => {
    if (typeof allowClear === 'boolean') {
      return { allowClear }
    }
    if (allowClear && typeof allowClear === 'object') {
      return allowClear
    }
    return { allowClear: false }
  })

  const merged = computed(() => {
    const mergedAllowClear
      = !disabled.value
        && allowClearConfig.value.allowClear !== false
        && (displayValues.value.length || mergedSearchValue?.value)
        && !(mode?.value === 'combobox' && mergedSearchValue?.value === '')

    return {
      allowClear: mergedAllowClear,
      clearIcon: mergedAllowClear ? allowClearConfig.value.clearIcon || clearIcon || '×' : null,
    }
  })

  return merged
}
