import type { SetupContext } from 'vue'
import type { InternalMode, SelectorProps } from '../../../interface'
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

export interface SingleSelectorProps<DateType extends object = any> extends SelectorProps<DateType> {
  id?: string
  value?: DateType[]
  onChange: (date: DateType[]) => void

  internalPicker: InternalMode

  disabled?: boolean

  /** All the field show as `placeholder` */
  allHelp?: boolean

  placeholder?: string

  // Invalid
  invalid?: boolean
  onInvalid: (valid: boolean) => void

  removeIcon?: any

  // Vue specific
  maxTagCount?: number | 'responsive'
  multiple?: boolean

  onMouseDown?: (e: MouseEvent) => void

  autoFocus?: boolean
  tabIndex?: number | string
}

const SingleSelector = defineComponent(
  <DateType extends object = any>(
    props: SingleSelectorProps<DateType>,
    { attrs, expose }: SetupContext,
  ) => {
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
      nativeElement: () => rootRef.value,
      focus: (options?: FocusOptions) => {
        inputRef.value?.focus(options)
      },
      blur: () => {
        inputRef.value?.blur()
      },
    })

    // ======================== Props =========================
    // Filter props for root
    const rootProps = useRootProps(props as any)

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
        'aria-required': !!(props as any)['aria-required'],
        'onChange': onSingleChange,
      })) as any,
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
                prefixCls={prefixCls.value!}
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
  },
  {
    name: 'SingleSelector',
    inheritAttrs: false,
  },
)

export default SingleSelector
