import type { FunctionalComponent } from 'vue'
import type { DefaultOptionType } from './Select.tsx'

export interface OptionProps extends Omit<DefaultOptionType, 'label'> {
  /** Save for customize data */
  [prop: string]: any
}

const Option: FunctionalComponent<OptionProps> = () => null

;(Option as any).isSelectOption = true

export default Option
