import type { CSSProperties, PropType, VNode } from 'vue'
import { BaseInput } from '@v-c/input'
import useCount from '@v-c/input/hooks/useCount'
import { resolveOnChange } from '@v-c/input/utils/commonUtils'
import cls from 'classnames'
import { computed, defineComponent, nextTick, ref, shallowRef, watch } from 'vue'
import ResizableTextArea from './ResizableTextArea'

export default defineComponent({
  name: 'TextArea',
  inheritAttrs: false,
  props: {
    defaultValue: [String, Number],
    value: [String, Number],
    onFocus: Function,
    onBlur: Function,
    onChange: Function,
    allowClear: Boolean,
    maxLength: Number,
    onCompositionStart: Function,
    onCompositionEnd: Function,
    suffix: [String, Object] as PropType<string | VNode>,
    prefixCls: { type: String, default: 'vc-textarea' },
    showCount: Boolean,
    count: [Object, Boolean],
    disabled: Boolean,
    hidden: Boolean,
    classNames: Object,
    styles: Object,
    onResize: Function,
    onClear: Function,
    onPressEnter: Function,
    readOnly: Boolean,
    autoSize: [Boolean, Object],
    onKeyDown: Function,
  },
  emits: ['update:value', 'change', 'compositionStart', 'compositionEnd', 'pressEnter', 'keydown', 'focus', 'blur', 'resize'],
  setup(props, { attrs, expose, slots, emit }) {
    function onChange(e: Event) {
      emit('change', e)
    }

    const stateValue = shallowRef(props.value ?? props.defaultValue)
    watch(
      () => props.value,
      (newValue) => {
        if ('value' in props || {}) {
          stateValue.value = newValue
        }
      },
    )
    const setValue = (value: string | number, callback?: Function) => {
      if (stateValue.value === value) {
        return
      }
      if (props.value === undefined) {
        stateValue.value = value
      }
      nextTick(() => {
        callback && callback()
      })
    }
    const formatValue = computed(() =>
      stateValue.value === undefined || stateValue.value === null ? '' : String(stateValue.value),
    )

    const focused = ref(false)

    const compositionRef = ref(false)

    const textareaResized = ref<boolean>(false)

    // =============================== Ref ================================
    const holderRef = ref<InstanceType<typeof BaseInput>>()
    const resizableTextAreaRef = ref<InstanceType<typeof ResizableTextArea>>()
    const getTextArea = () => resizableTextAreaRef.value?.textArea

    const focus = () => {
      getTextArea().focus()
    }
    expose({
      resizableTextArea: resizableTextAreaRef.value,
      focus,
      blur: () => {
        getTextArea().blur()
      },
      nativeElement: holderRef.value?.nativeElement || getTextArea(),
    })

    watch(
      () => props.disabled,
      (newDisabled) => {
        focused.value = !newDisabled && focused.value
      },
    )

    // =========================== Select Range ===========================
    const selection = ref<[start: number, end: number] | null>(null)

    watch(
      () => selection.value,
      (newSelection) => {
        if (newSelection) {
          getTextArea().setSelectionRange(...newSelection)
        }
      },
    )

    // ============================== Count ===============================
    const countConfig = useCount(props.count, props.showCount)
    const mergedMax = countConfig.max ?? props.maxLength

    // Max length value
    const hasMaxLength = Number(mergedMax) > 0

    const valueLength = computed(() => countConfig.strategy(formatValue.value))

    const isOutOfRange = !!mergedMax && valueLength.value > mergedMax

    // ============================== Change ==============================
    const triggerChange = (
      e: Event | CompositionEvent,
      currentValue: string,
    ) => {
      let cutValue = currentValue
      if (
        !compositionRef.value
        && countConfig.exceedFormatter
        && countConfig.max
        && countConfig.strategy(currentValue) > countConfig.max
      ) {
        cutValue = countConfig.exceedFormatter(currentValue, {
          max: countConfig.max,
        })

        if (currentValue !== cutValue) {
          selection.value = [
            getTextArea().selectionStart || 0,
            getTextArea().selectionEnd || 0,
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
      emit('compositionStart', e)
    }

    const onInternalCompositionEnd = (e: CompositionEvent) => {
      compositionRef.value = false
      triggerChange(e, (e.target as HTMLTextAreaElement).value)
      emit('compositionEnd', e)
    }

    const onInternalChange = (e: Event) => {
      triggerChange(e, (e.target as HTMLTextAreaElement).value)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && props.onPressEnter) {
        emit('pressEnter', e)
      }
      emit('keydown', e)
    }

    const handleFocus = (e: FocusEvent) => {
      focused.value = true
      emit('focus', e)
    }

    const handleBlur = (e: FocusEvent) => {
      focused.value = false
      emit('blur', e)
    }

    // ============================== Reset ===============================
    const handleReset = (e: MouseEvent) => {
      resolveOnChange(getTextArea(), e, triggerChange)
      setValue('', () => focus())
      emit('update:value', '')
    }

    const handleResize = (size: { width: number, height: number }) => {
      emit('resize', size)
      if (getTextArea()?.style.height) {
        textareaResized.value = true
      }
    }

    return () => {
      const {
        allowClear,
        maxLength,
        prefixCls = 'vc-textarea',
        showCount,
        disabled,
        hidden,
        classNames,
        styles,
        onClear,
        readOnly,
        autoSize,
      } = props
      let suffixNode = slots.suffix?.()
      let dataCount: unknown
      if (countConfig.show) {
        if (countConfig.showFormatter) {
          dataCount = countConfig.showFormatter({
            value: formatValue.value,
            count: valueLength.value,
            maxLength: mergedMax,
          })
        }
        else {
          dataCount = `${valueLength.value}${hasMaxLength ? ` / ${mergedMax}` : ''}`
        }

        suffixNode = (
          <>
            {suffixNode}
            <span
              class={cls(`${prefixCls}-data-count`, classNames?.count)}
              style={styles?.count}
            >
              {dataCount}
            </span>
          </>
        )
      }

      const isPureTextArea = !autoSize && !showCount && !allowClear
      return (
        <BaseInput
          ref={holderRef}
          v-model:value={formatValue.value}
          allowClear={allowClear}
          handleReset={handleReset}
          suffix={suffixNode}
          prefixCls={prefixCls}
          classNames={{
            ...classNames,
            affixWrapper: cls(classNames?.affixWrapper, {
              [`${prefixCls}-show-count`]: showCount,
              [`${prefixCls}-textarea-allow-clear`]: allowClear,
            }),
          }}
          disabled={disabled}
          focused={focused.value}
          class={cls([attrs.class], isOutOfRange && `${prefixCls}-out-of-range`)}
          style={{
            ...attrs.style as CSSProperties,
            ...(textareaResized.value && !isPureTextArea ? { height: 'auto' } : {}),
          }}
          dataAttrs={{
            affixWrapper: {
              'data-count': typeof dataCount === 'string' ? dataCount : undefined,
            },
          }}
          hidden={hidden}
          readOnly={readOnly}
          onClear={onClear}
        >
          <ResizableTextArea
            value={stateValue.value}
            autoSize={autoSize}
            maxLength={maxLength}
            onKeydown={handleKeyDown}
            onChange={onInternalChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionstart={onInternalCompositionStart}
            onCompositionend={onInternalCompositionEnd}
            class={cls(classNames?.textarea)}
            style={{ ...styles?.textarea, resize: attrs.style?.resize }}
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
})
