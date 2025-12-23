import type { PickerRef } from '../../interface'
import { ref } from 'vue'

export default function usePickerRef(expose: (exposed: PickerRef) => void) {
  const selectorRef = ref<PickerRef>()

  expose({
    get nativeElement() {
      return selectorRef.value?.nativeElement
    },
    focus: (options?: FocusOptions) => {
      selectorRef.value?.focus(options)
    },
    blur: () => {
      selectorRef.value?.blur()
    },
  } as PickerRef)

  return selectorRef
}
