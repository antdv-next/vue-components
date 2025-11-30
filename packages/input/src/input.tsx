import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'
import type { HolderRef } from './BaseInput'
import type { ChangeEventInfo, InputProps } from './interface'
import { clsx } from '@v-c/util'
import { triggerFocus } from '@v-c/util/dist/Dom/focus'
import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import BaseInput from './BaseInput'
import useCount from './hooks/useCount.ts'
import { resolveOnChange } from './utils/commonUtils'

const defaults = {
  prefixCls: 'vc-input',
  type: 'text',
} as any
const Input = defineComponent<
  InputProps
>(
  (props = defaults, { slots, expose, attrs }) => {
    const focused = shallowRef(false)
    const compositionRef = shallowRef(false)
    const keyLockRef = shallowRef(false)
    const { count, showCount } = toPropsRefs(props, 'count', 'showCount')

    const onChange = (e: Event) => {
      props?.onChange?.(e as any)
    }

    const inputRef = shallowRef<HTMLInputElement>()
    const holderRef = shallowRef<HolderRef>()

    const focus = (option?: InputFocusOptions) => {
      if (inputRef.value) {
        triggerFocus(inputRef.value, option)
      }
    }

    // ====================== Value =======================
    const value = shallowRef(props?.value ?? props?.defaultValue)
    watch(
      () => props.value,
      (newValue) => {
        value.value = newValue
      },
    )
    const formatValue = computed(() => value.value === undefined || value.value === null ? '' : String(value.value))

    // =================== Select Range ===================
    const selection = shallowRef<[start: number, end: number] | null>(null)
    watch(
      selection,
      (newSelection) => {
        if (newSelection && inputRef.value) {
          inputRef.value.setSelectionRange(...newSelection)
        }
      },
    )

    // ====================== Count =======================
    const countConfig = useCount(count as any, showCount as any)
    const mergedMax = computed(() => countConfig?.value?.max || props?.maxLength)
    const valueLength = computed(() => countConfig.value?.strategy?.(formatValue.value) ?? 0)

    const isOutOfRange = computed(() => !!mergedMax.value && valueLength.value > mergedMax.value)

    // ======================= Ref ========================
    expose({
      focus,
      blur: () => {
        inputRef.value?.blur?.()
      },
      setSelectionRange: (
        start: number,
        end: number,
        direction?: 'forward' | 'backward' | 'none',
      ) => {
        inputRef.value?.setSelectionRange(start, end, direction)
      },
      select: () => {
        inputRef.value?.select()
      },
      input: inputRef,
      nativeElement: computed(() => holderRef.value?.nativeElement || inputRef.value),
    })

    watch(
      () => props.disabled,
      () => {
        if (keyLockRef.value) {
          keyLockRef.value = false
        }
        focused.value = focused.value && props.disabled ? false : focused.value
      },
      {
        immediate: true,
      },
    )

    const triggerChange = (
      e: Event | CompositionEvent,
      currentValue: string,
      info: ChangeEventInfo,
    ) => {
      let cutValue = currentValue
      const config = countConfig.value

      if (
        !compositionRef.value
        && config?.exceedFormatter
        && config.max
        && config.strategy(currentValue) > config.max
      ) {
        cutValue = config.exceedFormatter(currentValue, {
          max: config.max,
        })

        if (currentValue !== cutValue) {
          selection.value = [
            inputRef.value?.selectionStart || 0,
            inputRef.value?.selectionEnd || 0,
          ]
        }
      }
      else if (info.source === 'compositionEnd') {
        return
      }

      if (props.value === undefined) {
        value.value = cutValue
      }

      if (inputRef.value) {
        resolveOnChange(inputRef.value, e, onChange, cutValue)
      }
    }

    const onInternalChange = (e: Event) => {
      triggerChange(e, (e.target as HTMLInputElement).value, {
        source: 'change',
      })
    }

    const onInternalCompositionStart = (e: CompositionEvent) => {
      compositionRef.value = true
      props?.onCompositionStart?.(e as any)
    }

    const onInternalCompositionEnd = (e: CompositionEvent) => {
      compositionRef.value = false
      triggerChange(e, (e.target as HTMLInputElement).value, {
        source: 'compositionEnd',
      })
      props?.onCompositionEnd?.(e as any)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === KeyCodeStr.Enter
        && !keyLockRef.value
        && !e.isComposing
      ) {
        keyLockRef.value = true
        props.onPressEnter?.(e)
      }
      props?.onKeyDown?.(e)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        keyLockRef.value = false
      }
      props?.onKeyUp?.(e)
    }

    const handleFocus = (e: FocusEvent) => {
      focused.value = true
      props?.onFocus?.(e)
    }

    const handleBlur = (e: FocusEvent) => {
      if (keyLockRef.value) {
        keyLockRef.value = false
      }
      focused.value = false
      props?.onBlur?.(e)
    }

    const handleReset = (e: MouseEvent) => {
      if (props.value === undefined) {
        value.value = ''
      }
      focus()
      if (inputRef.value) {
        resolveOnChange(inputRef.value, e, onChange)
      }
    }

    const mergedAllowClear = computed(() => {
      if (!props.allowClear) {
        return props.allowClear
      }

      const clearIcon = slots.clearIcon?.()

      if (clearIcon) {
        return {
          ...(typeof props.allowClear === 'object' ? props.allowClear : {}),
          clearIcon,
        }
      }

      return props.allowClear
    })

    return () => {
      const {
        autoComplete,
        prefixCls = defaults.prefixCls,
        disabled,
        htmlSize,
        classNames,
        styles,
        suffix,
        type = defaults.type,
        classes,
        readOnly,
        hidden,
        dataAttrs,
        components,
      } = props
      const { class: className, style, ...restAttrs } = attrs
      const mergedClassName = className ?? (props as any).class
      const mergedStyle = style ?? (props as any).style

      const prefixNode = slots.prefix?.() ?? props.prefix
      const suffixNode = slots.suffix?.() ?? suffix
      const addonBefore = slots.addonBefore?.() ?? props.addonBefore
      const addonAfter = slots.addonAfter?.() ?? props.addonAfter

      const config = countConfig.value
      const hasMaxLength = Number(mergedMax.value) > 0
      let mergedSuffix = suffixNode
      if (suffixNode || config?.show) {
        const dataCount = config?.showFormatter
          ? config.showFormatter({
              value: formatValue.value,
              count: valueLength.value,
              maxLength: mergedMax.value,
            })
          : `${valueLength.value}${hasMaxLength ? ` / ${mergedMax.value}` : ''}`

        mergedSuffix = (
          <>
            {config?.show && (
              <span
                class={clsx(
                  `${prefixCls}-show-count-suffix`,
                  {
                    [`${prefixCls}-show-count-has-suffix`]: !!suffixNode,
                  },
                  classNames?.count,
                )}
                style={styles?.count}
              >
                {dataCount}
              </span>
            )}
            {suffixNode}
          </>
        )
      }

      const otherProps = omit(
        props as any,
        [
          'prefixCls',
          'onPressEnter',
          'addonBefore',
          'addonAfter',
          'prefix',
          'suffix',
          'allowClear',
          'defaultValue',
          'showCount',
          'count',
          'classes',
          'htmlSize',
          'styles',
          'classNames',
          'onClear',
          'dataAttrs',
          'components',
          'hidden',
          'readOnly',
          'value',
          'type',
          'class',
          'style',
          'onFocus',
          'onBlur',
          'onChange',
          'onKeyDown',
          'onKeyUp',
          'onCompositionStart',
          'onCompositionEnd',
          'onInput',
        ],
      )

      const inputElement = (
        <input
          {...restAttrs}
          {...otherProps}
          autocomplete={autoComplete}
          ref={inputRef}
          value={formatValue.value}
          onChange={onInternalChange}
          onInput={onInternalChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeydown={handleKeyDown}
          onKeyup={handleKeyUp}
          class={clsx(
            prefixCls,
            {
              [`${prefixCls}-disabled`]: disabled,
            },
            classNames?.input,
          )}
          style={styles?.input}
          size={htmlSize}
          type={type}
          maxlength={props.maxLength}
          onCompositionstart={onInternalCompositionStart}
          onCompositionend={onInternalCompositionEnd}
          disabled={disabled}
          readonly={readOnly}
        />
      )

      return (
        <BaseInput
          ref={holderRef as any}
          value={formatValue.value}
          prefixCls={prefixCls}
          class={clsx(mergedClassName as any, isOutOfRange.value && `${prefixCls}-out-of-range`)}
          style={mergedStyle as any}
          allowClear={mergedAllowClear.value as any}
          handleReset={handleReset}
          suffix={mergedSuffix}
          prefix={prefixNode}
          addonBefore={addonBefore}
          addonAfter={addonAfter}
          focused={focused.value}
          triggerFocus={focus}
          disabled={disabled}
          readOnly={readOnly}
          classNames={classNames}
          styles={styles}
          dataAttrs={dataAttrs}
          components={components}
          hidden={hidden}
          onClear={props.onClear}
          classes={classes}
        >
          {inputElement}
        </BaseInput>
      )
    }
  },
  {
    name: 'Input',
    inheritAttrs: false,
  },
)

export default Input
