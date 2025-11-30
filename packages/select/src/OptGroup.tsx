import type { DefaultOptionType } from './Select'
import { defineComponent } from 'vue'

export interface OptGroupProps extends Omit<DefaultOptionType, 'options'> {
  children?: any
}

const OptGroup = defineComponent<OptGroupProps>(() => {
  return () => null
})

;(OptGroup as any).isSelectOptGroup = true

export default OptGroup
