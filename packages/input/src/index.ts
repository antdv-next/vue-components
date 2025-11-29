import BaseInput from './BaseInput'
import useCount from './hooks/useCount'
import Input from './input'

export type {
  BaseInputProps,
  CommonInputProps,
  CountConfig,
  InputProps,
  InputRef,
  ShowCountFormatter,
} from './interface'

export { BaseInput }
export {
  useCount,
}

export { resolveOnChange } from './utils/commonUtils'

export default Input
