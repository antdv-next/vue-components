import type { ExtractPropTypes, PropType } from 'vue'
import {
  inputProps,
} from '@v-c/input/interface'
import omit from '@v-c/util/dist/omit'

export interface AutoSizeType {
  minRows?: number
  maxRows?: number
}

export type HTMLTextareaProps = HTMLTextAreaElement

export function textareaProps() {
  return {
    ...omit(inputProps(), ['prefix', 'addonBefore', 'addonAfter', 'suffix', 'components']),
    value: {
      type: [String, Number] as PropType<HTMLTextareaProps['value']>,
    },
    prefixCls: String,
    autoSize: [Boolean, Object],
    onPressEnter: Function,
    onResize: Function,
    onClear: Function,
    readOnly: Boolean,
    classNames: Object,
    styles: Object,
  }
}

export type TextAreaProps = Partial<ExtractPropTypes<ReturnType<typeof textareaProps>>>
