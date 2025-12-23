import type { PropType } from 'vue'
import type { GenerateConfig } from '../../../generate'
import type { InternalMode, Locale, SelectorProps } from '../../../interface'
import type { InputRef } from '../Input'
import { clsx } from '@v-c/util'
import { computed, defineComponent, ref } from 'vue'
import { isSame } from '../../../utils/dateUtil'
import { usePickerContext } from '../../context'
import useInputProps from '../hooks/useInputHooks'
import useRootProps from '../hooks/useRootProps'
import Icon, { ClearIcon } from '../Icon'
import Input from '../Input'
import MultipleDates from './MultipleDates'

export interface SingleSelectorProps<DateType extends object = any>
  extends /** @vue-ignore */ SelectorProps<DateType> {
  id?: string
  value?: DateType[]
  onChange: (date: DateType[]) => void

  internalPicker: InternalMode

  disabled: boolean

  /** All the field show as `placeholder` */
  allHelp: boolean

  placeholder?: string

  // Invalid
  invalid: boolean
  onInvalid: (valid: boolean) => void

  removeIcon?: any

  // Vue specific
  maxTagCount?: number | 'responsive'
  multiple?: boolean

  onMouseDown: (e: MouseEvent) => void

  autoFocus: boolean
  tabIndex: number | string
}

export default defineComponent(<DateType extends object = any>(props: SingleSelectorProps<DateType>, { attrs, expose }: { attrs: Record<string, any>, expose: (expose: Record<string, any>) => void }) => {
  const rtl = computed(() => props.direction === 'rtl')

  // ======================== Prefix ========================
  const ctx = usePickerContext()
  const prefixCls = computed(() => ctx.value.prefixCls)
  const classNames = computed(() => ctx.value.classNames)
  const styles = computed(() => ctx.value.styles)

  // ========================= Refs =========================
  const rootRef = ref<HTMLDivElement>()
  const inputRef = ref<InputRef>()

  expose({
    nativeElement: rootRef.value,
    focus: (options?: FocusOptions) => {
      inputRef.value?.focus(options)
    },
    blur: () => {
      inputRef.value?.blur()
    },
  })

  // ======================== Props =========================
  // Filter props for root
  const rootProps = useRootProps(props)

  // ======================== Change ========================
  const onSingleChange = (date: any) => {
    props.onChange?.([date])
  }

  const onMultipleRemove = (date: any) => {
    const nextValues = (props.value || []).filter(
      oriDate =>
        oriDate
        && !isSame(
          props.generateConfig!,
          props.locale!,
          oriDate,
          date,
          props.internalPicker as InternalMode,
        ),
    )
    props.onChange?.(nextValues)

    // When `open`, it means user is operating the
    if (!props.open) {
      props.onSubmit?.()
    }
  }

  // ======================== Inputs ========================
  const [getInputProps, getText] = useInputProps(
    computed(() => ({
      ...props,
      'aria-required': !!props['aria-required'],
      'onChange': onSingleChange,
    })),
    ({ valueTexts }) => ({
      value: valueTexts[0] || '',
      active: props.focused,
    }),
  )

  // ======================== Render ========================
  return () => {
    const {
      prefix,
      clearIcon,
      suffixIcon,
      placeholder,
      onClick,
      onClear,
      multiple,
      maxTagCount,
      removeIcon,
      onMouseDown,
      value,
      disabled,
      invalid,
      autoFocus,
      tabIndex,
    } = props

    const showClear = !!(clearIcon && value && value.length && !disabled)

    // ======================= Multiple =======================
    const selectorNode = multiple
      ? (
          <>
            <MultipleDates
              prefixCls={prefixCls.value}
              value={value as any[]}
              onRemove={onMultipleRemove}
              formatDate={getText}
              maxTagCount={maxTagCount}
              disabled={disabled}
              removeIcon={removeIcon}
              placeholder={placeholder}
            />
            <input
              class={`${prefixCls.value}-multiple-input`}
              value={(value || []).map(getText).join(',')}
              ref={inputRef as any}
              readonly
              autofocus={autoFocus}
              tabindex={tabIndex as any}
            />
            <Icon type="suffix" icon={suffixIcon} />
            {showClear && <ClearIcon icon={clearIcon} onClear={onClear as any} />}
          </>
        )
      : (
          <Input
            ref={inputRef}
            {...getInputProps()}
            autofocus={autoFocus}
            // @ts-expect-error: Native
            tabindex={tabIndex}
            suffixIcon={suffixIcon}
            clearIcon={showClear && <ClearIcon icon={clearIcon} onClear={onClear as any} />}
            showActiveCls={false}
          />
        )

    return (
      <div
        {...rootProps.value}
        class={clsx(
          prefixCls.value,
          {
            [`${prefixCls.value}-multiple`]: multiple,
            [`${prefixCls.value}-focused`]: props.focused,
            [`${prefixCls.value}-disabled`]: disabled,
            [`${prefixCls.value}-invalid`]: invalid,
            [`${prefixCls.value}-rtl`]: rtl.value,
          },
          attrs.class as any,
        )}
        style={{ ...(attrs.style as any) }}
        ref={rootRef}
        onClick={onClick as any}
        // Not lose current input focus
        onMousedown={(e) => {
          const { target } = e
          if (target !== inputRef.value?.inputElement) {
            e.preventDefault()
          }

          onMouseDown?.(e)
        }}
      >
        {prefix && (
          <div
            class={clsx(`${prefixCls.value}-prefix`, classNames.value.prefix)}
            style={styles.value.prefix}
          >
            {prefix}
          </div>
        )}
        {selectorNode}
      </div>
    )
  }
}, {
  name: 'SingleSelector',
  inheritAttrs: false,
  props: {
    // ...SelectorProps
    'picker': String as PropType<SingleSelectorProps<any>['picker']>,
    'prefix': Object as PropType<SingleSelectorProps<any>['prefix']>,
    'clearIcon': Object as PropType<SingleSelectorProps<any>['clearIcon']>,
    'suffixIcon': Object as PropType<SingleSelectorProps<any>['suffixIcon']>,
    'focused': Boolean as PropType<SingleSelectorProps<any>['focused']>,
    'onFocus': Function as PropType<SingleSelectorProps<any>['onFocus']>,
    'onBlur': Function as PropType<SingleSelectorProps<any>['onBlur']>,
    'onSubmit': Function as PropType<SingleSelectorProps<any>['onSubmit']>,
    'onKeyDown': Function as PropType<SingleSelectorProps<any>['onKeyDown']>,
    'locale': { type: Object as PropType<SingleSelectorProps<any>['locale']> },
    'generateConfig': { type: Object as PropType<SingleSelectorProps<any>['generateConfig']> },
    'direction': String as PropType<SingleSelectorProps<any>['direction']>,
    'onClick': Function as PropType<SingleSelectorProps<any>['onClick']>,
    'onClear': Function as PropType<SingleSelectorProps<any>['onClear']>,
    'format': Array as PropType<SingleSelectorProps<any>['format']>,
    'maskFormat': String as PropType<SingleSelectorProps<any>['maskFormat']>,
    'onInputChange': Function as PropType<SingleSelectorProps<any>['onInputChange']>,
    'onInvalid': Function as PropType<SingleSelectorProps<any>['onInvalid']>,
    'preserveInvalidOnBlur': Boolean as PropType<SingleSelectorProps<any>['preserveInvalidOnBlur']>,
    'onOpenChange': Function as PropType<SingleSelectorProps<any>['onOpenChange']>,
    'inputReadOnly': Boolean as PropType<SingleSelectorProps<any>['inputReadOnly']>,
    'activeHelp': Boolean as PropType<SingleSelectorProps<any>['activeHelp']>,
    'open': Boolean as PropType<SingleSelectorProps<any>['open']>,

    // SingleSelectorProps specific
    'id': String as PropType<SingleSelectorProps<any>['id']>,
    'value': Array as PropType<SingleSelectorProps<any>['value']>,
    'onChange': Function as PropType<SingleSelectorProps<any>['onChange']>,
    'internalPicker': String as PropType<SingleSelectorProps<any>['internalPicker']>,
    'disabled': Boolean as PropType<SingleSelectorProps<any>['disabled']>,
    'allHelp': Boolean as PropType<SingleSelectorProps<any>['allHelp']>,
    'placeholder': String as PropType<SingleSelectorProps<any>['placeholder']>,
    'invalid': Boolean as PropType<SingleSelectorProps<any>['invalid']>,
    'removeIcon': Object as PropType<SingleSelectorProps<any>['removeIcon']>,
    'maxTagCount': [Number, String] as PropType<number | 'responsive'>,
    'multiple': Boolean as PropType<SingleSelectorProps<any>['multiple']>,

    // Native Input
    'required': Boolean as PropType<boolean>,
    'aria-required': Boolean as PropType<boolean | undefined>,
    'autoFocus': Boolean as PropType<boolean>,
    'tabIndex': [Number, String] as PropType<number | string>,
    'onMouseDown': Function as PropType<(e: MouseEvent) => void>,
  },
})
