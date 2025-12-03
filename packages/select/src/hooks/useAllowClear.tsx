import type { Ref } from 'vue'
import type { DisplayValueType, Mode } from '../interface.ts'
import { computed } from 'vue'

export interface AllowClearConfig {
  allowClear: boolean
  clearIcon: any
}

export function useAllowClear(
  _prefixCls: Ref<string>,
  displayValues: Ref<DisplayValueType[]>,
  allowClear?: Ref<boolean | { clearIcon?: any }>,
  clearIcon?: Ref<any>,
  disabled?: Ref<boolean>,
  mergedSearchValue?: Ref<string>,
  mode?: Ref<Mode>,
) {
  // Convert boolean to object first
  const allowClearConfig = computed<Partial<AllowClearConfig>>(() => {
    if (typeof allowClear?.value === 'boolean') {
      return { allowClear: allowClear.value }
    }
    if (allowClear?.value && typeof allowClear.value === 'object') {
      return allowClear.value
    }
    return { allowClear: false }
  })

  return computed(() => {
    const mergedAllowClear = !disabled?.value
      && allowClearConfig.value?.allowClear !== false
      && (displayValues.value.length || mergedSearchValue?.value)
      && !(mode?.value === 'combobox' && mergedSearchValue?.value === '')
    return {
      allowClear: !!mergedAllowClear,
      clearIcon: mergedAllowClear ? allowClearConfig.value.clearIcon || clearIcon?.value || '×' : null,
    } as AllowClearConfig
  })
}
