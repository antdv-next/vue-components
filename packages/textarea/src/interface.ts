import type {
  BaseInputProps,
  CommonInputProps,
  InputProps,
} from '@v-c/input/interface'
import type { CSSProperties, PropType } from 'vue'

export interface AutoSizeType {
  minRows?: number
  maxRows?: number
}

// To compatible with origin usage. We have to wrap this
export interface ResizableTextAreaRef {
  textArea: HTMLTextAreaElement
}

export type HTMLTextareaProps = HTMLTextAreaElement

function textareaProps() {
  return {
    value: {
      type: [String, Number] as PropType<HTMLTextareaProps['value']>,
    },
    prefixCls: String,
    autoSize: Boolean,
    onPressEnter: Function,
    onResize: Function,
  }
}

export type TextAreaProps = Omit<HTMLTextareaProps, 'onResize' | 'value'> & {
  value?: HTMLTextareaProps['value'] | bigint
  prefixCls?: string
  className?: string
  style?: CSSProperties
  autoSize?: boolean | AutoSizeType
  onPressEnter?: HTMLTextAreaElement
  onResize?: (size: { width: number, height: number }) => void
  classNames?: CommonInputProps['classNames'] & {
    textarea?: string
    count?: string
  }
  styles?: {
    textarea?: CSSProperties
    count?: CSSProperties
  }
} & Pick<BaseInputProps, 'allowClear' | 'suffix'> &
Pick<InputProps, 'showCount' | 'count' | 'onClear'>

export interface TextAreaRef {
  resizableTextArea: ResizableTextAreaRef
  focus: () => void
  blur: () => void
  nativeElement: HTMLElement
}
