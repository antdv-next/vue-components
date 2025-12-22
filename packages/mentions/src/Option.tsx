import type { CSSProperties, FunctionalComponent } from 'vue'

export interface OptionProps {
  value?: string
  key?: string
  disabled?: boolean
  class?: string
  style?: CSSProperties
}

const Option: FunctionalComponent<OptionProps> = () => null

export default Option
