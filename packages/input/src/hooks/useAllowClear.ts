import type { CommonInputProps } from '../interface'
import { computed } from 'vue'

export default function useAllowClear(
  getAllowClear: () => CommonInputProps['allowClear'],
) {
  return computed(() => {
    const allowClear = getAllowClear()
    return [
      !!allowClear,
      typeof allowClear === 'object' ? allowClear : {},
    ] as const
  })
}
