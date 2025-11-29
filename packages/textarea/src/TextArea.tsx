import type { TextAreaProps } from './interface'
import { BaseInput, resolveOnChange, useCount } from '@v-c/input'
import { clsx } from '@v-c/util'
import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
import { getAttrStyleAndClass, toPropsRefs } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import ResizableTextArea from './ResizableTextArea.tsx'

const defaults = {
  prefixCls: 'vc-textarea',
}
const TextArea = defineComponent<TextAreaProps>(
  (props = defaults, { expose, attrs }) => {
    const { count, showCount } = toPropsRefs(props, 'count', 'showCount')
    const value = shallowRef(props?.value ?? props?.defaultValue ?? '')
    watch(
      () => props.value,
      () => {
        value.value = props.value
      },
    )
    const formatValue = computed(() => value.value === undefined || value.value === null ? '' : String(value.value))
    const focused = shallowRef(false)
    const compositionRef = shallowRef(false)

    const textareaResized = shallowRef<boolean>()

    // =============================== Ref ================================
    const holderRef = shallowRef()
    const resizableTextAreaRef = shallowRef()
    const getTextArea = () => resizableTextAreaRef.value?.textArea

    const focus = () => {
      getTextArea().focus()
    }

    expose({
      resizableTextArea: resizableTextAreaRef,
      focus,
      blur: () => {
        getTextArea().blur()
      },
      nativeElement: computed(() => holderRef.value?.nativeElement || getTextArea()),
    })

    watch(
      () => props.disabled,
      () => {
        const prev = focused.value
        if (props.disabled && prev) {
          focused.value = !props?.disabled && prev
        }
      },
      { immediate: true, flush: 'post' },
    )
    // =========================== Select Range ===========================
    const selection = shallowRef<[number, number] | null>(null)
    watch(
      selection,
      () => {
        if (selection.value) {
          getTextArea().setSelectionRange(...selection.value)
        }
      },
    )

    // ============================== Count ===============================
    const countConfig = useCount(count as any, showCount)
    const mergedMax = computed(() => countConfig.value.max ?? props.maxLength)

    // Max length value
    const hasMaxLength = computed(() => Number(mergedMax.value) > 0)

    const valueLength = computed(() => countConfig.value.strategy(formatValue.value))

    const isOutOfRange = computed(() => !!mergedMax.value && valueLength.value > mergedMax.value)

    // ============================== Change ==============================
    const triggerChange = (e: any, currentValue: string) => {
      let cutValue = currentValue
      if (!compositionRef.value
        && countConfig.value.exceedFormatter
        && countConfig.value.max
        && countConfig.value.strategy(currentValue) > countConfig.value.max
      ) {
        cutValue = countConfig.value.exceedFormatter(currentValue, {
          max: countConfig.value.max,
        })

        if (currentValue !== cutValue) {
          selection.value = [
            getTextArea().selectionStart || 0,
            getTextArea().selectionEnd || 0,
          ]
        }
      }

      value.value = cutValue

      resolveOnChange(e.currentTarget, e, props.onChange as unknown as any, cutValue)
    }

    // =========================== Value Update ===========================
    const onInternalCompositionStart = () => {
      compositionRef.value = true
    }

    const onInternalCompositionEnd = (e: any) => {
      compositionRef.value = false
      // Trigger change event after composition end
      triggerChange(e, e.currentTarget.value)
    }

    const onInternalChange = (e: any) => {
      triggerChange(e, e.target.value)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const { onPressEnter } = props
      if (e.key === KeyCodeStr.Enter && onPressEnter && !e.isComposing) {
        onPressEnter(e)
      }
    }
    const handleFocus = () => {
      focused.value = true
    }

    const handleBlur = () => {
      focused.value = false
    }

    // ============================== Reset ===============================
    const handleReset = (e: MouseEvent) => {
      value.value = ''
      focus()
      resolveOnChange(getTextArea(), e, props.onChange as unknown as any)
    }

    const handleResize: TextAreaProps['onResize'] = (size) => {
      props?.onResize?.(size)
      if (getTextArea()?.style.height) {
        textareaResized.value = true
      }
    }
    return () => {
      const {
        suffix,
        classNames,
        styles,
        prefixCls = 'vc-textarea',
        allowClear,
        autoSize,
        showCount,
        disabled,
        hidden,
        readOnly,
        onClear,
        maxLength,
      } = props
      const { style, restAttrs, className } = getAttrStyleAndClass(attrs)
      let suffixNode: any = suffix
      let dataCount: any
      if (countConfig.value.show) {
        if (countConfig.value.showFormatter) {
          dataCount = countConfig.value.showFormatter?.({
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

      const textareaProps = {
        onKeydown: handleKeyDown,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onCompositionstart: onInternalCompositionStart,
        onCompositionend: onInternalCompositionEnd,
      }
      return (
        <BaseInput
          ref={holderRef}
          value={formatValue.value}
          allowClear={allowClear}
          handleReset={handleReset}
          suffix={suffixNode}
          prefixCls={prefixCls}
          classNames={{
            ...classNames,
            affixWrapper: clsx(classNames?.affixWrapper, {
              [`${prefixCls}-show-count`]: showCount,
              [`${prefixCls}-textarea-allow-clear`]: allowClear,
            }),
          }}
          disabled={disabled}
          focused={focused.value}
          class={clsx(className, isOutOfRange.value && `${prefixCls}-out-of-range`)}
          style={{
            ...style,
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
            {...restAttrs}
            autoSize={autoSize}
            maxLength={maxLength}
            onChange={onInternalChange}
            {
              ...textareaProps
            }
            class={clsx(classNames?.textarea)}
            style={{ resize: style?.resize, ...styles?.textarea }}
            disabled={disabled}
            value={value.value}
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
  },
)

export default TextArea
