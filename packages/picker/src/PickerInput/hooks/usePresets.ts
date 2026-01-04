import type { Ref } from 'vue'
import type { ValueDate } from '../../interface'
import { warning } from '@v-c/util'
import { computed } from 'vue'

export default function usePresets<DateType = any>(
  presets: Ref<ValueDate<DateType>[] | undefined>,
  legacyRanges?: Ref<Record<string, DateType | (() => DateType)> | undefined>,
) {
  return computed(() => {
    if (presets.value) {
      return presets.value
    }

    if (legacyRanges?.value) {
      warning(false, '`ranges` is deprecated. Please use `presets` instead.')

      return Object.entries(legacyRanges.value).map(([label, value]) => ({ label, value }))
    }

    return []
  })
}
