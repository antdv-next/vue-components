import type { Ref } from 'vue'
import type { LegacyKey } from '../Cascader'
import { ref, watch } from 'vue'
import { useCascaderContext } from '../context'

/**
 * Control the active open options path.
 */
function useActive(multiple: Ref<boolean>, open: Ref<boolean | undefined>): [Ref<LegacyKey[]>, (activeValueCells: LegacyKey[]) => void] {
  const context = useCascaderContext()
  const activeValueCells = ref<LegacyKey[]>([])

  watch(
    [open, () => context.value?.values?.[0]],
    () => {
      if (!multiple.value) {
        activeValueCells.value = context.value?.values?.[0] || []
      }
    },
    { immediate: true },
  )

  return [activeValueCells, (next) => {
    activeValueCells.value = next
  }]
}

export default useActive
