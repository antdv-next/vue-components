import type { InputHTMLAttributes } from 'vue'
import { ref } from 'vue'

export function useCheckbox(defaultChecked = false) {
  const checked = ref(defaultChecked)

  const onChange: InputHTMLAttributes['onChange'] = (event) => {
    const target = event?.target as HTMLInputElement | null
    checked.value = !!target?.checked
  }

  return [checked, onChange] as const
}
