import type { VueNode } from '@v-c/util/dist/type'
import type { PropType } from 'vue'
import type { GenerateConfig } from '../../../generate'
import type { Locale, PickerMode, SelectorProps } from '../../../interface'
import { clsx } from '@v-c/util'
import { computed, defineComponent, ref } from 'vue'
import { usePickerContext } from '../../context'
import MultipleDates from './MultipleDates'

export interface SingleSelectorProps<DateType extends object = any> extends SelectorProps<DateType> {
  value?: DateType[]
  inputElement?: VueNode
  activeHelp?: boolean
  allHelp?: boolean
  maxTagCount?: number | 'responsive'
  onRemove?: (value: DateType) => void
  placeholder?: string
  disabled?: boolean
}

export default defineComponent({
  name: 'SingleSelector',
  inheritAttrs: false,
  props: {
    prefixCls: { type: String, required: true },
    inputElement: { type: Object as PropType<VueNode> },
    value: { type: Array as PropType<any[]> },
    open: { type: Boolean, default: false },
    activeHelp: { type: Boolean },
    allHelp: { type: Boolean },
    maxTagCount: { type: [Number, String] as PropType<number | 'responsive'> },
    onRemove: { type: Function as PropType<(value: any) => void> },
    placeholder: { type: String },
    disabled: { type: Boolean },

    // SelectorProps
    picker: { type: String as PropType<PickerMode> },
    prefix: { type: [Object, String] as PropType<VueNode> },
    clearIcon: { type: [Object, String] as PropType<VueNode> },
    suffixIcon: { type: [Object, String] as PropType<VueNode> },
    focused: { type: Boolean },
    onFocus: { type: Function as PropType<(e: FocusEvent) => void> },
    onBlur: { type: Function as PropType<(e: FocusEvent) => void> },
    onSubmit: { type: Function as PropType<() => void> },
    onKeyDown: { type: Function as PropType<(e: KeyboardEvent) => void> },
    locale: { type: Object as PropType<Locale> },
    generateConfig: { type: Object as PropType<GenerateConfig<any>> },
    direction: { type: String as PropType<'ltr' | 'rtl'> },
    onClick: { type: Function as PropType<(e: MouseEvent) => void> },
    onClear: { type: Function as PropType<() => void> },
    format: { type: Array as PropType<any[]> },
    maskFormat: { type: String },
    onInputChange: { type: Function as PropType<() => void> },
    onInvalid: { type: Function as PropType<(valid: boolean) => void> },
    preserveInvalidOnBlur: { type: Boolean },
    onOpenChange: { type: Function as PropType<(open: boolean) => void> },
    inputReadOnly: { type: Boolean },
  },
  setup(props, { attrs, emit, expose }) {
    const { prefixCls, onRemove } = props
    const ctx = usePickerContext()

    const inputRef = ref<HTMLInputElement>()

    const showPlaceholder = computed(() => {
      if (props.value && props.value.length) {
        return false
      }
      return true
    })

    // ======================== Focus ========================
    const onInternalFocus = (e: FocusEvent) => {
      props.onFocus?.(e)
    }

    const onInternalBlur = (e: FocusEvent) => {
      props.onBlur?.(e)
    }

    // ======================== Input ========================
    const onInternalInput = (e: Event) => {
      // Logic for input change
      props.onInputChange?.()
    }

    const onInternalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        props.onSubmit?.()
      }
      props.onKeyDown?.(e)
    }

    expose({
      focus: () => {
        inputRef.value?.focus()
      },
      blur: () => {
        inputRef.value?.blur()
      },
    })

    return () => {
      const {
        prefixCls,
        value,
        placeholder,
        disabled,
        maxTagCount,
        picker,
        suffixIcon,
        clearIcon,
        open,
        focused,
        activeHelp,
        onClear,
        onClick,
        direction,
        format,
        generateConfig,
        locale,
      } = props

      const selectorCls = `${prefixCls}-selector`

      // Format date for MultipleDates
      const formatDate = (date: any) => {
        // Use first format or default
        const fmt = format?.[0] || 'YYYY-MM-DD'
        if (typeof fmt === 'function') {
          return fmt(date)
        }
        return generateConfig?.locale.format(locale?.locale || 'en_US', date, fmt) || String(date)
      }

      const InputComponent = ctx.value.input || 'input'

      return (
        <div
          class={clsx(selectorCls, {
            [`${selectorCls}-focused`]: focused,
            [`${selectorCls}-disabled`]: disabled,
            [`${selectorCls}-rtl`]: direction === 'rtl',
          })}
          onClick={onClick}
        >
          <div class={`${selectorCls}-content`}>
            {/* Multiple Dates */}
            {picker === ('multiple' as any) && (
              <MultipleDates
                prefixCls={prefixCls}
                value={value || []}
                onRemove={onRemove || (() => {})}
                formatDate={formatDate}
                disabled={disabled}
                maxTagCount={maxTagCount}
                placeholder={showPlaceholder.value ? placeholder : undefined}
              />
            )}

            {/* Input */}
            {/* Note: In multiple mode, input might be inside MultipleDates or parallel?
                Usually parallel or inside.
                For now, placing it parallel but with 0 width if needed, or inline.
                Actually, standard single selector has input visible.
            */}
            <InputComponent
              ref={inputRef}
              class={`${prefixCls}-input`}
              disabled={disabled}
              readonly={props.inputReadOnly}
              onFocus={onInternalFocus}
              onBlur={onInternalBlur}
              onInput={onInternalInput}
              onKeydown={onInternalKeyDown}
              // ... attrs
              {...attrs}
            />
          </div>

          {/* Suffix / Clear */}
          <span class={`${prefixCls}-suffix`}>
            {suffixIcon}
          </span>
          {value && value.length > 0 && !disabled && (
            <span
              class={`${prefixCls}-clear`}
              onClick={(e) => {
                e.stopPropagation()
                onClear?.()
              }}
            >
              {clearIcon}
            </span>
          )}
        </div>
      )
    }
  },
})
