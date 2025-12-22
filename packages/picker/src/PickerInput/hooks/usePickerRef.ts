import type { PickerRef } from '../../interface'
import { ref } from 'vue'

export default function usePickerRef(expose: (exposed: Record<string, any>) => void) {
  const selectorRef = ref<PickerRef>()

  expose({
    nativeElement: selectorRef.value?.nativeElement,
    focus: (options: any) => {
      selectorRef.value?.focus(options)
    },
    blur: () => {
      selectorRef.value?.blur()
    },
  })

  return selectorRef
}
