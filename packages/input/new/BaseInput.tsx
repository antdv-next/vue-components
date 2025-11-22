import type { BaseInputProps } from './interface.ts'
import { defineComponent } from 'vue'

export const BaseInput = defineComponent<
  BaseInputProps
>(
  (props, { slots, expose, emit, attrs }) => {
    return () => {
      return null
    }
  },
)
