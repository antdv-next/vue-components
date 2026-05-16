import type { BaseInputProps, CommonInputProps, InputProps } from '@v-c/input'
import type { ChangeEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSProperties } from 'vue'

export interface AutoSizeType {
  minRows?: number
  maxRows?: number
}

// To compatible with origin usage. We have to wrap this
export interface ResizableTextAreaRef {
  textArea: HTMLTextAreaElement
}

export interface TextAreaProps {
  value?: any
  defaultValue?: any
  prefixCls?: string
  disabled?: boolean
  autoSize?: boolean | AutoSizeType
  onPressEnter?: (e: any) => void
  onResize?: (size: { width: number, height: number }) => void
  classNames?: CommonInputProps['classNames'] & {
    textarea?: string
    count?: string
  }
  styles?: {
    textarea?: CSSProperties
    count?: CSSProperties
    clear?: CSSProperties
  }
  allowClear?: BaseInputProps['allowClear']
  suffix?: BaseInputProps['suffix']
  showCount?: InputProps['showCount']
  count?: InputProps['count']
  onClear?: InputProps['onClear']
  onChange?: ChangeEventHandler
  maxLength?: number
  hidden?: boolean
  readOnly?: boolean
  placeholder?: string
  autoFocus?: boolean
  onKeydown?: (e: KeyboardEvent) => void
  onKeyup?: (e: KeyboardEvent) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  /**
   * Whether to trigger onChange during IME composition.
   * When false (default), onChange only fires after compositionEnd with the final value.
   * When true, onChange fires on every keystroke including intermediate IME values.
   */
  changeOnComposing?: boolean
}

export interface TextAreaRef {
  resizableTextArea: ResizableTextAreaRef
  focus: () => void
  blur: () => void
  nativeElement: HTMLElement
}
