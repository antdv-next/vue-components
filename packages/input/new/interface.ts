import type { InputFocusOptions } from '@v-c/util/dist/Dom/foucs'
import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, InputHTMLAttributes } from 'vue'
import type { LiteralUnion } from './utils/types'

export interface CommonInputProps {
  prefix: VueNode
  suffix: VueNode
  addonBefore: VueNode
  addonAfter: VueNode
  classNames: {
    affixWrapper?: string
    prefix?: string
    suffix?: string
    groupWrapper?: string
    wrapper?: string
    variant?: string
  }
  styles?: {
    affixWrapper?: CSSProperties
    prefix?: CSSProperties
    suffix?: CSSProperties
  }
  allowClear?: boolean | { clearIcon?: VueNode }
}

type DataAttr = Record<`data-${string}`, string>

export type ValueType = InputHTMLAttributes['value'] | bigint

export interface BaseInputProps extends CommonInputProps {
  value?: ValueType
  prefixCls?: string
  disabled?: boolean
  focused?: boolean
  triggerFocus?: () => void
  readOnly?: boolean
  handleReset?: MouseEventHandler
  onClear?: () => void
  hidden?: boolean
  dataAttrs?: {
    affixWrapper?: DataAttr
  }
  components?: {
    affixWrapper?: 'span' | 'div'
    groupWrapper?: 'span' | 'div'
    wrapper?: 'span' | 'div'
    groupAddon?: 'span' | 'div'
  }
}

export type ShowCountFormatter = (args: {
  value: string
  count: number
  maxLength?: number
}) => any

export type ExceedFormatter = (
  value: string,
  config: { max: number },
) => string

export interface CountConfig {
  max?: number
  strategy?: (value: string) => number
  show?: boolean | ShowCountFormatter
  /** Trigger when content larger than the `max` limitation */
  exceedFormatter?: ExceedFormatter
}

export interface InputProps extends Omit<CommonInputProps, 'classNames' | 'styles'> {
  value?: ValueType
  prefixCls?: string
  // ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#%3Cinput%3E_types
  type?: LiteralUnion<'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week', string>
  /** It's better to use `count.show` instead */
  showCount?:
    | boolean
    | {
      formatter: ShowCountFormatter
    }
  onPressEnter: (e: Event) => void
  autoComplete?: string
  htmlSize?: number
  classNames?: CommonInputProps['classNames'] & {
    input?: string
    count?: string
  }
  styles?: CommonInputProps['styles'] & {
    input?: CSSProperties
    count?: CSSProperties
  }
  count?: CountConfig
  onClear?: () => void
}

export interface InputRef {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  setSelectionRange: (
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none',
  ) => void
  select: () => void
  input: HTMLInputElement | null
  nativeElement: HTMLElement | null
}

export interface ChangeEventInfo {
  source: 'compositionEnd' | 'change'
}
