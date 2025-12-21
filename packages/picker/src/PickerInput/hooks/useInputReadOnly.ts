import type { Ref } from 'vue'
import type { FormatType } from '../../interface'
import { computed } from 'vue'

export default function useInputReadOnly<DateType = any>(
  formatList: Ref<FormatType<DateType>[]>,
  inputReadOnly: Ref<boolean | undefined>,
  multiple: Ref<boolean | undefined>,
) {
  return computed(() => {
    if (typeof formatList.value[0] === 'function' || multiple.value) {
      return true
    }

    return inputReadOnly.value
  })
}
