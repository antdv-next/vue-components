import { defineComponent } from 'vue'
import type { VueNode } from '@v-c/util/dist/type'
import type { DefaultOptionType } from './Select'

export interface OptionProps extends Omit<DefaultOptionType, 'label'> {
  children: VueNode
  [prop: string]: any
}

const Option = defineComponent<OptionProps>(() => {
  return () => null
})

;(Option as any).isSelectOption = true

export default Option
