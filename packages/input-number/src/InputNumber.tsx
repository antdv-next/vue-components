import type {
  DecimalClass,
  ValueType,
} from '@v-c/mini-decimal'
import type { CSSProperties, ExtractPropTypes, PropType, SlotsType, VNode } from 'vue'
import { BaseInput } from '@v-c/input'
import { triggerFocus } from '@v-c/input/utils/commonUtils'
import getMiniDecimal, {
  getNumberPrecision,
  num2str,
  toFixed,
  validateNumber,
} from '@v-c/mini-decimal'
import clsx from 'classnames'
import { computed, defineComponent, ref, watch, watchEffect } from 'vue'
import useCursor from './hooks/useCursor'
import useFrame from './hooks/useFrame'
import { useInjectSemanticContext, useProvideSemanticContext } from './SemanticContext'
import StepHandler from './StepHandler'
import { getDecupleSteps } from './utils/numberUtil'

export type { ValueType }
type InputFocusOptions = Parameters<HTMLInputElement['focus']>[0]
export interface InputNumberRef extends HTMLInputElement {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  nativeElement: HTMLElement
}

/**
 * We support `stringMode` which need handle correct type when user call in onChange
 * format max or min value
 * 1. if isInvalid return null
 * 2. if precision is undefined, return decimal
 * 3. format with precision
 *    I. if max > 0, round down with precision. Example: max= 3.5, precision=0  afterFormat: 3
 *    II. if max < 0, round up with precision. Example: max= -3.5, precision=0  afterFormat: -4
 *    III. if min > 0, round up with precision. Example: min= 3.5, precision=0  afterFormat: 4
 *    IV. if min < 0, round down with precision. Example: max= -3.5, precision=0  afterFormat: -3
 */
function getDecimalValue(stringMode: boolean, decimalValue: DecimalClass) {
  if (stringMode || decimalValue.isEmpty()) {
    return decimalValue.toString()
  }

  return decimalValue.toNumber()
}

function getDecimalIfValidate(value: ValueType) {
  const decimal = getMiniDecimal(value)
  return decimal.isInvalidate() ? null : decimal
}

function inputNumberProps() {
  return {
    prefixCls: { type: String, default: 'vc-input-number' },
    min: [Number, String],
    max: [Number, String],
    step: { type: [Number, String], default: 1 },
    defaultValue: [Number, String],
    value: {
      type: [Number, String],
    },
    disabled: Boolean,
    readOnly: Boolean,
    upHandler: Object as PropType<VNode>,
    downHandler: Object as PropType<VNode>,
    keyboard: Boolean,
    changeOnWheel: { type: Boolean, default: false },
    controls: { type: Boolean, default: true },
    stringMode: Boolean,
    parser: Function as PropType<(displayValue: string | undefined) => ValueType>,
    formatter: Function as PropType<(value: ValueType | undefined, info: { userTyping: boolean, input: string }) => string>,
    precision: Number,
    decimalSeparator: String,
    onChange: Function as PropType<(value: ValueType | null) => void>,
    onInput: Function as PropType<(text: string) => void>,
    onPressEnter: Function as PropType<(e: KeyboardEvent) => void>,
    onStep: Function as PropType<(value: ValueType, info: { offset: ValueType, type: 'up' | 'down', emitter: 'handler' | 'keyboard' | 'wheel' }) => void>,
    changeOnBlur: { type: Boolean, default: true },
    classNames: Object,
    styles: Object,
  }
}

export type InputNumberProps = Partial<ExtractPropTypes<ReturnType<typeof inputNumberProps>>>

type InternalInputNumberProps = Omit<InputNumberProps, 'prefix' | 'suffix'>

const InternalInputNumber = defineComponent<InternalInputNumberProps>({
  name: 'InternalInputNumber',
  props: {
    ...inputNumberProps(),
  },
  slots: Object as SlotsType<{
    upHandler: any
    downHandler: any
  }>,
  emits: ['step', 'change', 'input', 'pressEnter'],
  setup(props, { attrs, slots, expose, emit }) {
    const { classNames, styles } = useInjectSemanticContext() || {}

    const inputRef = ref<HTMLInputElement>()
    const focus = ref(false)
    const userTypingRef = ref(false)
    const compositionRef = ref(false)
    const shiftKeyRef = ref(false)

    // ============================ Value =============================
    // Real value control
    const decimalValue = ref<DecimalClass>(getMiniDecimal(props.value ?? props.defaultValue))

    function setUncontrolledDecimalValue(newDecimal: DecimalClass) {
      if (props.value === undefined) {
        decimalValue.value = newDecimal
      }
    }

    // ====================== Parser & Formatter ======================
    /**
     * `precision` is used for formatter & onChange.
     * It will auto generate by `value` & `step`.
     * But it will not block user typing.
     *
     * Note: Auto generate `precision` is used for legacy logic.
     * We should remove this since we already support high precision with BigInt.
     *
     * @param numStr  Provide which number should calculate precision
     * @param userTyping  Change by user typing
     */
    const getPrecision = (numStr: string, userTyping: boolean) => {
      const { precision, step = 1 } = props
      if (userTyping) {
        return undefined
      }
      if (precision && precision >= 0) {
        return precision
      }
      return Math.max(getNumberPrecision(numStr), getNumberPrecision(step))
    }

    // >>> Parser
    const mergedParser = (num: string | number) => {
      const numStr = String(num)

      if (props.parser) {
        return props.parser(numStr)
      }

      let parsedStr = numStr
      if (props.decimalSeparator) {
        parsedStr = parsedStr.replace(props.decimalSeparator, '.')
      }

      // [Legacy] We still support auto convert `$ 123,456` to `123456`
      return parsedStr.replace(/[^\w.-]+/g, '')
    }

    // >>> Formatter
    const inputValueRef = ref<string | number>('')
    const mergedFormatter = (number: string, userTyping: boolean) => {
      if (props.formatter) {
        return props.formatter(number, { userTyping, input: String(inputValueRef.value) })
      }

      let str = typeof number === 'number' ? num2str(number) : number

      // User typing will not auto format with precision directly
      if (!userTyping) {
        const mergedPrecision = getPrecision(str, userTyping)

        if (validateNumber(str) && (props.decimalSeparator || mergedPrecision! >= 0)) {
          // Separator
          const separatorStr = props.decimalSeparator || '.'

          str = toFixed(str, separatorStr, mergedPrecision)
        }
      }

      return str
    }

    // ========================== InputValue ==========================
    /**
     * Input text value control
     *
     * User can not update input content directly. It updates with follow rules by priority:
     *  1. controlled `value` changed
     *    [SPECIAL] Typing like `1.` should not immediately convert to `1`
     *  2. User typing with format (not precision)
     *  3. Blur or Enter trigger revalidate
     */
    const formatValue = () => {
      const initValue = props.defaultValue ?? props.value
      if (!initValue) {
        return ''
      }
      if (decimalValue.value.isInvalidate() && ['string', 'number'].includes(typeof initValue)) {
        return Number.isNaN(initValue) ? '' : initValue
      }
      return mergedFormatter(decimalValue.value.toString(), false)
    }
    const inputValue = ref<string | number>(formatValue())
    inputValueRef.value = inputValue.value

    // Should always be string
    function setInputValue(newValue: DecimalClass, userTyping: boolean) {
      inputValue.value
        = mergedFormatter(
          // Invalidate number is sometime passed by external control, we should let it go
          // Otherwise is controlled by internal interactive logic which check by userTyping
          // You can ref 'show limited value when input is not focused' test for more info.
          newValue.isInvalidate() ? newValue.toString(false) : newValue.toString(!userTyping),
          userTyping,
        )
    }

    // >>> Max & Min limit
    const maxDecimal = ref()
    const minDecimal = ref()
    watch([() => props.max, () => props.precision], ([newMax]) => {
      maxDecimal.value = getDecimalIfValidate(newMax!)
    }, { immediate: true })
    watch([() => props.min, () => props.precision], ([newMin]) => {
      minDecimal.value = getDecimalIfValidate(newMin!)
    }, { immediate: true })

    const upDisabled = computed(() => {
      if (!maxDecimal.value || !decimalValue.value || decimalValue.value.isInvalidate()) {
        return false
      }

      return maxDecimal.value.lessEquals(decimalValue.value)
    })

    const downDisabled = computed(() => {
      if (!minDecimal.value || !decimalValue.value || decimalValue.value.isInvalidate()) {
        return false
      }

      return decimalValue.value.lessEquals(minDecimal.value)
    })

    // Cursor controller
    const [recordCursor, restoreCursor] = useCursor(inputRef.value!, focus.value)

    // ============================= Data =============================
    /**
     * Find target value closet within range.
     * e.g. [11, 28]:
     *    3  => 11
     *    23 => 23
     *    99 => 28
     */
    const getRangeValue = (target: DecimalClass) => {
      // target > max
      if (maxDecimal.value && !target.lessEquals(maxDecimal.value)) {
        return maxDecimal.value
      }

      // target < min
      if (minDecimal.value && !minDecimal.value.lessEquals(target)) {
        return minDecimal.value
      }

      return null
    }

    /**
     * Check value is in [min, max] range
     */
    const isInRange = (target: DecimalClass) => !getRangeValue(target)

    /**
     * Trigger `onChange` if value validated and not equals of origin.
     * Return the value that re-align in range.
     */
    const triggerValueUpdate = (newValue: DecimalClass, userTyping: boolean): DecimalClass => {
      const { readOnly, disabled, stringMode = false } = props
      let updateValue = newValue

      let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty()

      // Skip align value when trigger value is empty.
      // We just trigger onChange(null)
      // This should not block user typing
      if (!updateValue.isEmpty() && !userTyping) {
        // Revert value in range if needed
        updateValue = getRangeValue(updateValue) || updateValue
        isRangeValidate = true
      }

      if (!readOnly && !disabled && isRangeValidate) {
        const numStr = updateValue.toString()
        const mergedPrecision = getPrecision(numStr, userTyping)
        if (mergedPrecision! >= 0) {
          updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision))

          // When to fixed. The value may out of min & max range.
          // 4 in [0, 3.8] => 3.8 => 4 (toFixed)
          if (!isInRange(updateValue)) {
            updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision, true))
          }
        }

        // Trigger event
        if (!updateValue.equals(decimalValue.value)) {
          setUncontrolledDecimalValue(updateValue)
          emit('change', updateValue.isEmpty() ? null : getDecimalValue(stringMode, updateValue))

          // Reformat input if value is not controlled
          if (props.value === undefined) {
            setInputValue(updateValue, userTyping)
          }
        }

        return updateValue
      }

      return decimalValue.value
    }

    // ========================== User Input ==========================
    const onNextPromise = useFrame()

    // >>> Collect input value
    const collectInputValue = (inputStr: string) => {
      recordCursor()

      // Update inputValue in case input can not parse as number
      // Refresh ref value immediately since it may used by formatter
      inputValueRef.value = inputStr
      inputValue.value = inputStr

      // Parse number
      if (!compositionRef.value) {
        const finalValue = mergedParser(inputStr)
        const finalDecimal = getMiniDecimal(finalValue)
        if (!finalDecimal.isNaN()) {
          triggerValueUpdate(finalDecimal, true)
        }
      }

      // Trigger onInput later to let user customize value if they want to handle something after onChange
      emit('input', inputStr)

      // optimize for chinese input experience
      // https://github.com/ant-design/ant-design/issues/8196
      onNextPromise(() => {
        let nextInputStr = inputStr
        if (!props.parser) {
          nextInputStr = inputStr.replace(/。/g, '.')
        }

        if (nextInputStr !== inputStr) {
          collectInputValue(nextInputStr)
        }
      })
    }

    // >>> Composition
    const onCompositionStart = () => {
      compositionRef.value = true
    }

    const onCompositionEnd = () => {
      compositionRef.value = false

      collectInputValue(inputRef.value!.value)
    }

    // >>> Input
    const onInternalInput = (e: Event) => {
      collectInputValue((e.target as HTMLInputElement).value)
    }

    // ============================= Step =============================
    const onInternalStep = (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => {
      const { step = 1, stringMode = false } = props
      // Ignore step since out of range
      if ((up && upDisabled.value) || (!up && downDisabled.value)) {
        return
      }

      // Clear typing status since it may be caused by up & down key.
      // We should sync with input value.
      userTypingRef.value = false

      let stepDecimal = getMiniDecimal(shiftKeyRef.value ? getDecupleSteps(step) : step)
      if (!up) {
        stepDecimal = stepDecimal.negate()
      }

      const target = (decimalValue.value || getMiniDecimal(0)).add(stepDecimal.toString())

      const updatedValue = triggerValueUpdate(target, false)

      emit('step', getDecimalValue(stringMode, updatedValue), {
        offset: shiftKeyRef.value ? getDecupleSteps(step) : step,
        type: up ? 'up' : 'down',
        emitter,
      })
      inputRef.value?.focus()
    }

    // ============================ Flush =============================
    /**
     * Flush current input content to trigger value change & re-formatter input if needed.
     * This will always flush input value for update.
     * If it's invalidate, will fallback to last validate value.
     */
    const flushInputValue = (userTyping: boolean) => {
      const parsedValue = getMiniDecimal(mergedParser(inputValue.value))
      let formatValue: DecimalClass

      if (!parsedValue.isNaN()) {
        // Only validate value or empty value can be re-fill to inputValue
        // Reassign the formatValue within ranged of trigger control
        formatValue = triggerValueUpdate(parsedValue, userTyping)
      }
      else {
        formatValue = triggerValueUpdate(decimalValue.value, userTyping)
      }

      if (props.value !== undefined) {
        // Reset back with controlled value first
        setInputValue(decimalValue.value, false)
      }
      else if (!formatValue.isNaN()) {
        // Reset input back since no validate value
        setInputValue(formatValue, false)
      }
    }

    // Solve the issue of the event triggering sequence when entering numbers in chinese input (Safari)
    const onBeforeInput = () => {
      userTypingRef.value = true
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const { key, shiftKey } = event
      userTypingRef.value = true

      shiftKeyRef.value = shiftKey

      if (key === 'Enter') {
        if (!compositionRef.value) {
          userTypingRef.value = false
        }
        flushInputValue(false)
        emit('pressEnter', event)
      }

      if (!props.keyboard) {
        return
      }

      // Do step
      if (!compositionRef.value && ['Up', 'ArrowUp', 'Down', 'ArrowDown'].includes(key)) {
        onInternalStep(key === 'Up' || key === 'ArrowUp', 'keyboard')
        event.preventDefault()
      }
    }

    const onKeyUp = () => {
      userTypingRef.value = false
      shiftKeyRef.value = false
    }

    // >>> Focus & Blur
    const onBlur = () => {
      const { changeOnBlur = true } = props
      if (changeOnBlur) {
        flushInputValue(false)
      }

      focus.value = false

      userTypingRef.value = false
    }

    // ========================== Controlled ==========================
    // Input by precision & formatter
    watch([() => props.precision, () => props.formatter], () => {
      if (!decimalValue.value.isInvalidate()) {
        setInputValue(decimalValue.value, false)
      }
    })

    // Input by value
    watch(() => props.value, (newVal) => {
      const newValue = getMiniDecimal(newVal!)
      decimalValue.value = newValue

      const currentParsedValue = getMiniDecimal(mergedParser(inputValue.value))

      // When user typing from `1.2` to `1.`, we should not convert to `1` immediately.
      // But let it go if user set `formatter`
      if (!newValue.equals(currentParsedValue) || !userTypingRef.value || props.formatter) {
        // Update value as effect
        setInputValue(newValue, userTypingRef.value)
      }
    })

    // ============================ Cursor ============================
    watch(() => inputValue.value, () => {
      if (props.formatter) {
        restoreCursor()
      }
    })

    // ============================ Wheel ============================
    watchEffect((onCleanup) => {
      if (props.changeOnWheel && focus.value) {
        const onWheel = (event: WheelEvent) => {
          // moving mouse wheel rises wheel event with deltaY < 0
          // scroll value grows from top to bottom, as screen Y coordinate
          onInternalStep(event.deltaY < 0, 'wheel')
          event.preventDefault()
        }
        const input = inputRef.value
        if (input) {
          input.addEventListener('wheel', onWheel, { passive: false })
          onCleanup(() => input.removeEventListener('wheel', onWheel))
        }
      }
    })

    expose({
      focus: (option?: InputFocusOptions) => {
        if (inputRef.value)
          triggerFocus(inputRef.value, option)
      },
      blur: () => {
        inputRef.value?.blur()
      },
    })
    return () => {
      const {
        prefixCls = 'vc-input-number',
        min,
        max,
        step = 1,
        defaultValue,
        value,
        disabled,
        readOnly,
        upHandler = slots.upHandler,
        downHandler = slots.downHandler,
        keyboard,
        changeOnWheel = false,
        controls = true,

        stringMode,

        parser,
        formatter,
        precision,
        decimalSeparator,

        onChange,
        onInput,
        onPressEnter,
        onStep,

        changeOnBlur = true,

        ...inputProps
      } = props
      const inputClassName = `${prefixCls}-input`
      return (
        <div
          class={clsx(prefixCls, [attrs.class], {
            [`${prefixCls}-focused`]: focus.value,
            [`${prefixCls}-disabled`]: disabled,
            [`${prefixCls}-readonly`]: readOnly,
            [`${prefixCls}-not-a-number`]: decimalValue.value.isNaN(),
            [`${prefixCls}-out-of-range`]: !decimalValue.value.isInvalidate() && !isInRange(decimalValue.value),
          })}
          style={{ ...attrs.style as CSSProperties }}
          onKeydown={onKeyDown}
          onKeyup={onKeyUp}
        >
          {controls && (
            <StepHandler
              prefixCls={prefixCls}
              upDisabled={upDisabled.value}
              downDisabled={downDisabled.value}
              onStep={onInternalStep}
              v-slots={{ upNode: upHandler, downNode: downHandler }}
            />
          )}
          <div
            class={clsx(`${inputClassName}-wrap`, classNames?.actions)}
            style={styles?.actions}
          >
            <input
              autocomplete="off"
              role="spinbutton"
              aria-valuemin={min as any}
              aria-valuemax={max as any}
              aria-valuenow={decimalValue.value.isInvalidate() ? null : (decimalValue.value.toString() as any)}
              step={step}
              {...inputProps}
              ref={inputRef}
              class={inputClassName}
              value={inputValue.value}
              onChange={onInternalInput}
              disabled={disabled}
              readonly={readOnly}
              onFocus={() => focus.value = true}
              onBlur={onBlur}
              onCompositionstart={onCompositionStart}
              onCompositionend={onCompositionEnd}
              onBeforeinput={onBeforeInput}
            />
          </div>
        </div>
      )
    }
  },
})

export default defineComponent({
  name: 'InputNumber',
  props: {
    ...inputNumberProps(),
    prefix: Object,
    suffix: Object,
    addonBefore: Object,
    addonAfter: Object,
  },
  emits: ['change', 'update:value', 'step'],
  slots: Object as SlotsType<{
    upHandler: any
    downHandler: any
    prefix: any
    suffix: any
    addonBefore: any
    addonAfter: any
  }>,
  setup(props, { attrs, expose, slots }) {
    const { classNames, styles } = props
    useProvideSemanticContext({
      classNames,
      styles,
    })
    const holderRef = ref<InstanceType<typeof BaseInput> | null>(null)
    const inputFocusRef = ref()

    const focus = (option?: InputFocusOptions) => {
      if (inputFocusRef.value) {
        inputFocusRef.value.focus(option)
      }
    }

    expose({
      focus,
      blur: () => inputFocusRef.value?.blur(),
      nativeElement: computed(() => holderRef.value?.nativeElement || inputFocusRef.value),
    })
    return () => {
      const {
        disabled,
        prefixCls = 'vc-input-number',
        value,
        prefix = slots.prefix?.(),
        suffix = slots.suffix?.(),
        addonBefore = slots.addonBefore,
        addonAfter = slots.addonAfter,
        classNames,
        styles,
        ...rest
      } = props
      return (
        <BaseInput
          class={attrs.class}
          triggerFocus={focus}
          prefixCls={prefixCls}
          value={value}
          disabled={disabled}
          style={attrs.style}
          prefix={prefix}
          suffix={suffix}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          classNames={classNames}
          styles={styles}
          components={{
            affixWrapper: 'div',
            groupWrapper: 'div',
            wrapper: 'div',
            groupAddon: 'div',
          }}
          ref={holderRef}
        >
          <InternalInputNumber
            prefixCls={prefixCls}
            disabled={disabled}
            ref={inputFocusRef}
            class={classNames?.input}
            style={styles?.input}
            v-slots={slots}
            {...rest}
          />
        </BaseInput>
      )
    }
  },
})
