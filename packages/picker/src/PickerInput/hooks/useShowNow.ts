import type { Ref } from 'vue'
import type { InternalMode, PanelMode } from '../../interface'
import { computed } from 'vue'

export default function useShowNow(
  picker: Ref<InternalMode>,
  mode: Ref<PanelMode>,
  showNow: Ref<boolean | undefined>,
  showToday: Ref<boolean | undefined>,
  rangePicker?: Ref<boolean | undefined>,
) {
  return computed(() => {
    if (mode.value !== 'date' && mode.value !== 'time') {
      return false
    }

    if (showNow.value !== undefined) {
      return showNow.value
    }

    if (showToday.value !== undefined) {
      return showToday.value
    }

    return !rangePicker?.value && (picker.value === 'date' || picker.value === 'time')
  })
}
