import type { CSSProperties } from 'vue'
import type { TextAreaProps } from './interface'
import { BaseInput, resolveOnChange, useCount } from '@v-c/input'
import { classNames as clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent, nextTick, shallowRef, watch } from 'vue'
import ResizableTextArea from './ResizableTextArea'

const defaults: TextAreaProps = {
  prefixCls: 'vc-textarea',
}

export default defineComponent<TextAreaProps>(
  (props = defaults, { attrs, expose, slots, emit }) => {
    const stateValue = shallowRef(props.value ?? props.defaultValue)
    watch(
      () => props.value,
      (newValue) => {
        if ('value' in props || {}) {
          stateValue.value = newValue
        }
      },
    )

    const setValue = (val: string | number, callback?: () => void) => {
      if (stateValue.value === val) {
        return
      }
      if (props.value === undefined) {
        stateValue.value = val
      }
      nextTick(() => {
        callback?.()
      })
    }

    const formatValue = computed(() =>
      stateValue.value === undefined || stateValue.value === null ? '' : String(stateValue.value),
    )

    const focused = shallowRef(false)
    const compositionRef = shallowRef(false)
    const textareaResized = shallowRef<boolean>(false)

    // =============================== Ref ================================
    const holderRef = shallowRef<any>()
    const resizableTextAreaRef = shallowRef<any>()
    const getTextArea = () => resizableTextAreaRef.value?.textArea

    const focus = () => {
      getTextArea()?.focus()
    }

    expose({
      resizableTextArea: resizableTextAreaRef,
      focus,
      blur: () => {
        getTextArea()?.blur()
      },
      nativeElement: computed(() => holderRef.value?.nativeElement || getTextArea() || null),
    })

    watch(
      () => props.disabled,
      (newDisabled) => {
        focused.value = !newDisabled && focused.value
      },
    )

    // =========================== Select Range ===========================
    const selection = shallowRef<[start: number, end: number] | null>(null)
    watch(selection, (newSelection) => {
      if (newSelection) {
        getTextArea()?.setSelectionRange(...newSelection)
      }
    })

    // ============================== Count ===============================
    const countConfig = useCount(computed(() => props.count as any), computed(() => props.showCount as any))
    const mergedMax = computed(() => countConfig.value.max ?? props.maxLength)

    const hasMaxLength = computed(() => Number(mergedMax.value) > 0)
    const valueLength = computed(() => countConfig.value.strategy(formatValue.value))
    const isOutOfRange = computed(() => !!mergedMax.value && valueLength.value > mergedMax.value)

    // ============================== Change ==============================
    const onChange = (e: Event) => {
      props.onChange?.(e)
    }

    const triggerChange = (
      e: Event | CompositionEvent,
      currentValue: string,
    ) => {
      let cutValue = currentValue
      const cfg = countConfig.value
      if (
        !compositionRef.value
        && cfg.exceedFormatter
        && cfg.max
        && cfg.strategy(currentValue) > cfg.max
      ) {
        cutValue = cfg.exceedFormatter(currentValue, {
          max: cfg.max,
        })

        if (currentValue !== cutValue) {
          selection.value = [
            getTextArea()?.selectionStart || 0,
            getTextArea()?.selectionEnd || 0,
          ]
        }
      }
      setValue(cutValue)
      emit('update:value', cutValue)

      nextTick(() => {
        resizableTextAreaRef.value?.setValue?.(cutValue)
      })
      resolveOnChange((e.currentTarget as HTMLInputElement), e, onChange, cutValue)
    }

    // =========================== Value Update ===========================
    const onInternalCompositionStart = (e: CompositionEvent) => {
      compositionRef.value = true
      props.onCompositionStart?.(e)
    }

    const onInternalCompositionEnd = (e: CompositionEvent) => {
      compositionRef.value = false
      triggerChange(e, (e.target as HTMLTextAreaElement).value)
      // emit('compositionEnd', e)
      props.onCompositionEnd?.(e)
    }

    const onInternalChange = (e: Event) => {
      triggerChange(e, (e.target as HTMLTextAreaElement).value)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && props.onPressEnter && !e.isComposing) {
        // emit('pressEnter', e)
        props.onPressEnter?.(e)
      }
      // emit('keydown', e)
      props.onKeyDown?.(e)
    }

    const handleFocus = (e: FocusEvent) => {
      focused.value = true
      // emit('focus', e)
      props.onFocus?.(e)
    }

    const handleBlur = (e: FocusEvent) => {
      focused.value = false
      // emit('blur', e)
      props.onBlur?.(e)
    }

    // ============================== Reset ===============================
    const handleReset = (e: MouseEvent) => {
      resolveOnChange(getTextArea() as HTMLInputElement, e, onChange)
      setValue('', () => focus())
      emit('update:value', '')
    }

    const handleResize = (size: { width: number, height: number }) => {
      // emit('resize', size)
      props.onResize?.(size)
      if (getTextArea()?.style.height) {
        textareaResized.value = true
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
        allowClear,
        maxLength,
        prefixCls = defaults.prefixCls!,
        showCount,
        disabled,
        hidden,
        classNames,
        styles,
        onClear,
        readOnly,
        autoSize,
        suffix,
      } = props

      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const mergedClassName = props.className || (attrClass as any)
      const mergedStyle: CSSProperties = {
        ...(props.style as CSSProperties),
        ...(attrStyle as CSSProperties),
      }

      const suffixSlot = slots.suffix?.()
      let suffixNode = suffixSlot ?? suffix
      let dataCount: unknown
      if (countConfig.value.show) {
        if (countConfig.value.showFormatter) {
          dataCount = countConfig.value.showFormatter({
            value: formatValue.value,
            count: valueLength.value,
            maxLength: mergedMax.value,
          })
        }
        else {
          dataCount = `${valueLength.value}${hasMaxLength.value ? ` / ${mergedMax.value}` : ''}`
        }

        suffixNode = (
          <>
            {suffixNode}
            <span
              class={clsx(`${prefixCls}-data-count`, classNames?.count)}
              style={styles?.count}
            >
              {dataCount}
            </span>
          </>
        )
      }

      const isPureTextArea = !autoSize && !showCount && !allowClear

      const baseInputClassNames = {
        ...classNames,
        affixWrapper: clsx(classNames?.affixWrapper, {
          [`${prefixCls}-show-count`]: showCount,
          [`${prefixCls}-textarea-allow-clear`]: allowClear,
        }),
      }

      const inputAttrs = omit(restAttrs, [
        'class',
        'style',
        'onFocus',
        'onBlur',
        'onChange',
        'onCompositionstart',
        'onCompositionend',
        'onKeydown',
        'onKeyup',
        'onInput',
      ])

      const restProps = omit(props, [
        'class',
        'style',
        'onFocus',
        'onBlur',
        'onChange',
        'onCompositionEnd',
        'onCompositionStart',
        'onKeyDown',
        'allowClear',
        'maxLength',
        'prefixCls',
        'showCount',
        'disabled',
        'hidden',
        'classNames',
        'styles',
        'onClear',
        'readOnly',
        'autoSize',
        'suffix',
        'onResize',
      ])

      return (
        <BaseInput
          ref={holderRef}
          value={formatValue.value}
          allowClear={mergedAllowClear.value as any}
          handleReset={handleReset}
          suffix={suffixNode}
          prefixCls={prefixCls}
          classNames={baseInputClassNames as any}
          disabled={disabled}
          focused={focused.value}
          class={clsx([mergedClassName], isOutOfRange.value && `${prefixCls}-out-of-range`)}
          style={{
            ...mergedStyle,
            ...(textareaResized.value && !isPureTextArea ? { height: 'auto' } : {}),
          }}
          dataAttrs={{
            affixWrapper: {
              'data-count': typeof dataCount === 'string' ? dataCount : undefined,
            } as any,
          }}
          hidden={hidden}
          readOnly={readOnly}
          onClear={onClear}
        >
          <ResizableTextArea
            {...inputAttrs}
            {...restProps}
            value={stateValue.value as any}
            autoSize={autoSize as any}
            maxLength={maxLength}
            onKeydown={handleKeyDown as any}
            onChange={onInternalChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionstart={onInternalCompositionStart}
            onCompositionend={onInternalCompositionEnd}
            class={clsx(classNames?.textarea)}
            style={{ ...styles?.textarea, resize: (attrStyle as any)?.resize }}
            disabled={disabled}
            prefixCls={prefixCls}
            onResize={handleResize}
            ref={resizableTextAreaRef}
            readOnly={readOnly}
          />
        </BaseInput>
      )
    }
  },
  {
    name: 'TextArea',
    inheritAttrs: false,
    emits: [
      'update:value',
      'change',
      'compositionStart',
      'compositionEnd',
      'pressEnter',
      'keydown',
      'focus',
      'blur',
      'resize',
    ],
  },
)
