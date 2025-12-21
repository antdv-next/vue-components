import type { CSSProperties, FunctionalComponent } from 'vue'

export interface OptionProps {
  value?: string
  key?: string
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

const Option: FunctionalComponent<OptionProps> = () => null

export default Option
