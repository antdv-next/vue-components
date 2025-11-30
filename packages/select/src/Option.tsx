import type { VueNode } from '@v-c/util/dist/type'
import type { DefaultOptionType } from './Select'
import { defineComponent } from 'vue'

export interface OptionProps extends Omit<DefaultOptionType, 'label'> {
  children: VueNode
  [prop: string]: any
}

const Option = defineComponent<OptionProps>(() => {
  return () => null
})

;(Option as any).isSelectOption = true

export default Option
