import type { CountConfig, ShowCountFormatter } from '@v-c/input/interface'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export interface AutoSizeType {
  minRows?: number
  maxRows?: number
}

export interface TextAreaProps {
  value?: string | number
  defaultValue?: string | number
  prefixCls?: string
  autoSize?: boolean | AutoSizeType
  onPressEnter?: (e: KeyboardEvent) => void
  onResize?: (size: { width: number, height: number }) => void
  onClear?: () => void
  readOnly?: boolean
  classNames?: {
    affixWrapper?: string
    textarea?: string
    count?: string
  }
  styles?: {
    affixWrapper?: CSSProperties
    textarea?: CSSProperties
    count?: CSSProperties
  }
  allowClear?: boolean | { clearIcon?: VueNode }
  showCount?: boolean | { formatter: ShowCountFormatter }
  count?: CountConfig
  maxLength?: number
  suffix?: VueNode
  disabled?: boolean
  hidden?: boolean
  onChange?: (e: Event) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  onCompositionStart?: (e: CompositionEvent) => void
  onCompositionEnd?: (e: CompositionEvent) => void
  onKeyDown?: (e: KeyboardEvent) => void
  className?: string
  class?: any
  style?: CSSProperties
  placeholder?: string
}

export interface TextAreaRef {
  resizableTextArea?: any
  focus: () => void
  blur: () => void
  nativeElement: HTMLElement | null
}

export type HTMLTextareaProps = HTMLTextAreaElement
