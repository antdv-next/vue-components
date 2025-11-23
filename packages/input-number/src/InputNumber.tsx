import type { DecimalClass, ValueType } from '@v-c/mini-decimal'
import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'
import getMiniDecimal, {
  getNumberPrecision,
  num2str,
  toFixed,
  validateNumber,
} from '@v-c/mini-decimal'
import { clsx } from '@v-c/util'
import { triggerFocus } from '@v-c/util/dist/Dom/focus'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent, shallowRef, watch, watchEffect } from 'vue'
import useCursor from './hooks/useCursor'
import useFrame from './hooks/useFrame'
import StepHandler from './StepHandler'
import { getDecupleSteps } from './utils/numberUtil'

export type { ValueType }

type SemanticName = 'root' | 'actions' | 'input' | 'action' | 'prefix' | 'suffix'

export interface InputNumberProps<T extends ValueType = ValueType> {
  mode?: 'input' | 'spinner'
  prefixCls?: string
  class?: any
  className?: string
  style?: any
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, any>>
  min?: T
  max?: T
  step?: ValueType
  defaultValue?: T
  value?: T | null
  disabled?: boolean
  readOnly?: boolean
  prefix?: any
  suffix?: any
  upHandler?: any
  downHandler?: any
  keyboard?: boolean
  changeOnWheel?: boolean
  controls?: boolean
  parser?: (displayValue: string | undefined) => T
  formatter?: (value: T | undefined, info: { userTyping: boolean, input: string }) => string
  precision?: number
  decimalSeparator?: string
  onInput?: (text: string) => void
  onChange?: (value: T | null) => void
  onPressEnter?: (e: KeyboardEvent) => void
  onStep?: (value: T, info: { offset: ValueType, type: 'up' | 'down', emitter: 'handler' | 'keyboard' | 'wheel' }) => void
  changeOnBlur?: boolean
  tabIndex?: number
  onMouseDown?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseOut?: (event: MouseEvent) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  onCompositionStart?: (event: CompositionEvent) => void
  onCompositionEnd?: (event: CompositionEvent) => void
  onBeforeInput?: (event: InputEvent) => void
  stringMode?: boolean
}

export interface InputNumberRef extends HTMLInputElement {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  nativeElement: HTMLElement | null
  input: HTMLInputElement | null
}

const defaults: InputNumberProps = {
  prefixCls: 'vc-input-number',
  step: 1,
  controls: true,
  changeOnWheel: false,
  mode: 'input',
  stringMode: false,
}

function getDecimalValue(stringMode: boolean | undefined, decimalValue: DecimalClass) {
  if (stringMode || decimalValue.isEmpty()) {
    return decimalValue.toString()
  }

  return decimalValue.toNumber()
}

function getDecimalIfValidate(value: ValueType) {
  const decimal = getMiniDecimal(value)
  return decimal.isInvalidate() ? null : decimal
}

const InputNumber = defineComponent<InputNumberProps>(
  (props = defaults, { attrs, slots, expose, emit }) => {
    const focus = shallowRef(false)
    const userTypingRef = shallowRef(false)
    const compositionRef = shallowRef(false)
    const shiftKeyRef = shallowRef(false)

    const rootRef = shallowRef<HTMLDivElement>()
    const inputRef = shallowRef<HTMLInputElement>()

    expose({
      focus: (option?: InputFocusOptions) => {
        if (inputRef.value) {
          triggerFocus(inputRef.value, option)
        }
      },
      blur: () => {
        inputRef.value?.blur?.()
      },
      nativeElement: computed(() => rootRef.value || inputRef.value || null),
      input: inputRef,
    })

    // ============================ Value =============================
    const decimalValue = shallowRef<DecimalClass>(getMiniDecimal((props.value ?? props.defaultValue ?? '') as any))

    const setUncontrolledDecimalValue = (newDecimal: DecimalClass) => {
      if (props.value === undefined) {
        decimalValue.value = newDecimal
      }
    }

    // ====================== Parser & Formatter ======================
    const getPrecision = (numStr: string, userTyping: boolean) => {
      if (userTyping) {
        return undefined
      }

      if (props.precision !== undefined && props.precision >= 0) {
        return props.precision
      }

      return Math.max(getNumberPrecision(numStr), getNumberPrecision(props.step ?? 1))
    }

    const mergedParser = (num: string | number) => {
      const numStr = String(num)

      if (props.parser) {
        return props.parser(numStr)
      }

      let parsedStr = numStr
      if (props.decimalSeparator) {
        parsedStr = parsedStr.replace(props.decimalSeparator, '.')
      }

      return parsedStr.replace(/[^\w.-]+/g, '')
    }

    const inputValue = shallowRef<string | number>('')
    const inputValueRef = shallowRef<string | number>('')

    const mergedFormatter = (number: string, userTyping: boolean) => {
      if (props.formatter) {
        return props.formatter(number, { userTyping, input: String(inputValueRef.value) })
      }

      let str = typeof number === 'number' ? num2str(number) : number

      if (!userTyping) {
        const mergedPrecision = getPrecision(str, userTyping)

        if (validateNumber(str) && (props.decimalSeparator || (mergedPrecision !== undefined && mergedPrecision >= 0))) {
          const separatorStr = props.decimalSeparator || '.'

          str = toFixed(str, separatorStr, mergedPrecision)
        }
      }

      return str
    }

    const syncInputValue = () => {
      const initValue = props.defaultValue ?? props.value
      if (decimalValue.value.isInvalidate() && ['string', 'number'].includes(typeof initValue as any)) {
        inputValue.value = Number.isNaN(initValue as any) ? '' : (initValue as any)
      }
      else {
        inputValue.value = mergedFormatter(decimalValue.value.toString(), false)
      }
      inputValueRef.value = inputValue.value
    }

    syncInputValue()

    watch(inputValue, (val) => {
      inputValueRef.value = val
    })

    const setInputValue = (newValue: DecimalClass, userTyping: boolean) => {
      inputValue.value = mergedFormatter(
        newValue.isInvalidate()
          ? newValue.toString(false)
          : newValue.toString(!userTyping),
        userTyping,
      )
    }

    // >>> Max & Min limit
    const maxDecimal = computed(() => props.max !== undefined ? getDecimalIfValidate(props.max as any) : null)
    const minDecimal = computed(() => props.min !== undefined ? getDecimalIfValidate(props.min as any) : null)

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
    const recordCursorRef = shallowRef<() => void>(() => {})
    const restoreCursorRef = shallowRef<() => void>(() => {})
    watchEffect(() => {
      if (inputRef.value) {
        const [record, restore] = useCursor(inputRef.value, focus.value)
        recordCursorRef.value = record
        restoreCursorRef.value = restore
      }
    })
    const recordCursor = () => recordCursorRef.value?.()
    const restoreCursor = () => restoreCursorRef.value?.()

    // ============================= Data =============================
    const getRangeValue = (target: DecimalClass) => {
      if (maxDecimal.value && !target.lessEquals(maxDecimal.value)) {
        return maxDecimal.value
      }

      if (minDecimal.value && !minDecimal.value.lessEquals(target)) {
        return minDecimal.value
      }

      return null
    }

    const isInRange = (target: DecimalClass) => !getRangeValue(target)

    const triggerValueUpdate = (newValue: DecimalClass, userTyping: boolean): DecimalClass => {
      let updateValue = newValue

      let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty()

      if (!updateValue.isEmpty() && !userTyping) {
        updateValue = getRangeValue(updateValue) || updateValue
        isRangeValidate = true
      }

      if (!props.readOnly && !props.disabled && isRangeValidate) {
        const numStr = updateValue.toString()
        const mergedPrecision = getPrecision(numStr, userTyping)
        if (mergedPrecision !== undefined && mergedPrecision >= 0) {
          updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision))

          if (!isInRange(updateValue)) {
            updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision, true))
          }
        }

        if (!updateValue.equals(decimalValue.value)) {
          setUncontrolledDecimalValue(updateValue)
          const outValue = updateValue.isEmpty() ? null : getDecimalValue(props.stringMode, updateValue)
          props.onChange?.(outValue as any)
          emit('change', outValue as any)

          if (props.value === undefined) {
            setInputValue(updateValue, userTyping)
          }

          emit('update:value', outValue as any)
        }

        return updateValue
      }

      return decimalValue.value
    }

    // ========================== User Input ==========================
    const onNextPromise = useFrame()

    const collectInputValue = (inputStr: string) => {
      recordCursor()

      inputValueRef.value = inputStr
      inputValue.value = inputStr

      if (!compositionRef.value) {
        const finalValue = mergedParser(inputStr)
        const finalDecimal = getMiniDecimal(finalValue as any)
        if (!finalDecimal.isNaN()) {
          triggerValueUpdate(finalDecimal, true)
        }
      }

      props.onInput?.(inputStr)
      emit('input', inputStr)

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
    const onCompositionStart = (e: CompositionEvent) => {
      compositionRef.value = true
      emit('compositionstart', e)
      props.onCompositionStart?.(e)
    }

    const onCompositionEnd = (e: CompositionEvent) => {
      compositionRef.value = false
      emit('compositionend', e)
      props.onCompositionEnd?.(e)

      if (inputRef.value) {
        collectInputValue(inputRef.value.value)
      }
    }

    // >>> Input
    const onInternalInput = (e: Event) => {
      collectInputValue((e.target as HTMLInputElement).value)
    }

    // ============================= Step =============================
    const onInternalStep = (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => {
      if ((up && upDisabled.value) || (!up && downDisabled.value)) {
        return
      }

      userTypingRef.value = false

      let stepDecimal = getMiniDecimal(shiftKeyRef.value ? getDecupleSteps(props.step ?? 1) : props.step ?? 1)
      if (!up) {
        stepDecimal = stepDecimal.negate()
      }

      const target = (decimalValue.value || getMiniDecimal(0)).add(stepDecimal.toString())

      const updatedValue = triggerValueUpdate(target, false)

      const outValue = getDecimalValue(props.stringMode, updatedValue)
      props.onStep?.(outValue as any, {
        offset: shiftKeyRef.value ? getDecupleSteps(props.step ?? 1) : props.step ?? 1,
        type: up ? 'up' : 'down',
        emitter,
      })
      emit('step', outValue as any, {
        offset: shiftKeyRef.value ? getDecupleSteps(props.step ?? 1) : props.step ?? 1,
        type: up ? 'up' : 'down',
        emitter,
      })

      inputRef.value?.focus()
    }

    // ============================ Flush =============================
    const flushInputValue = (userTyping: boolean) => {
      const parsedValue = getMiniDecimal(mergedParser(inputValue.value))
      let formatValue: DecimalClass

      if (!parsedValue.isNaN()) {
        formatValue = triggerValueUpdate(parsedValue, userTyping)
      }
      else {
        formatValue = triggerValueUpdate(decimalValue.value, userTyping)
      }

      if (props.value !== undefined) {
        setInputValue(decimalValue.value, false)
      }
      else if (!formatValue.isNaN()) {
        setInputValue(formatValue, false)
      }
    }

    const onBeforeInput = (e: InputEvent) => {
      userTypingRef.value = true
      emit('beforeinput', e)
      props.onBeforeInput?.(e)
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
        props.onPressEnter?.(event)
      }

      if (props.keyboard === false) {
        props.onKeyDown?.(event)
        emit('keydown', event)
        return
      }

      if (!compositionRef.value && ['Up', 'ArrowUp', 'Down', 'ArrowDown'].includes(key)) {
        onInternalStep(key === 'Up' || key === 'ArrowUp', 'keyboard')
        event.preventDefault()
      }

      props.onKeyDown?.(event)
      emit('keydown', event)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      userTypingRef.value = false
      shiftKeyRef.value = false
      emit('keyup', event)
      props.onKeyUp?.(event)
    }

    // ============================ Wheel ============================
    watchEffect((onCleanup) => {
      if (props.changeOnWheel && focus.value && inputRef.value) {
        const onWheel = (event: WheelEvent) => {
          onInternalStep(event.deltaY < 0, 'wheel')
          event.preventDefault()
        }
        inputRef.value.addEventListener('wheel', onWheel, { passive: false })
        onCleanup(() => inputRef.value?.removeEventListener('wheel', onWheel))
      }
    })

    // >>> Focus & Blur
    const onBlur = (e: FocusEvent) => {
      if (props.changeOnBlur ?? true) {
        flushInputValue(false)
      }

      focus.value = false
      userTypingRef.value = false
      emit('blur', e)
      props.onBlur?.(e)
    }

    const onFocus = (e: FocusEvent) => {
      focus.value = true
      emit('focus', e)
      props.onFocus?.(e)
    }

    // >>> Mouse events
    const onInternalMouseDown = (event: MouseEvent) => {
      if (inputRef.value && event.target !== inputRef.value) {
        inputRef.value.focus()
        event.preventDefault()
      }

      emit('mousedown', event)
      props.onMouseDown?.(event)
    }

    // ========================== Controlled ==========================
    watch([() => props.precision, () => props.formatter, () => props.decimalSeparator], () => {
      if (!decimalValue.value.isInvalidate()) {
        setInputValue(decimalValue.value, false)
      }
    })

    watch(() => props.value, (newVal) => {
      const newValue = getMiniDecimal((newVal ?? '') as any)
      decimalValue.value = newValue

      const currentParsedValue = getMiniDecimal(mergedParser(inputValue.value))

      if (!newValue.equals(currentParsedValue) || !userTypingRef.value || props.formatter) {
        setInputValue(newValue, userTypingRef.value)
      }
    })

    // ============================ Cursor ============================
    watch(() => inputValue.value, () => {
      if (props.formatter) {
        restoreCursor()
      }
    })

    return () => {
      const {
        prefixCls = defaults.prefixCls,
        classNames,
        styles,
        step = defaults.step,
        disabled,
        readOnly,
        controls = defaults.controls,
        mode = defaults.mode,
      } = props

      const mergedPrefixCls = prefixCls || defaults.prefixCls!

      const { class: className, style, ...restAttrs } = attrs
      const mergedClassName = props.className || (className as any)
      const mergedStyle = {
        ...styles?.root,
        ...(props.style as any),
        ...(style as any),
      }

      const prefixNode = slots.prefix?.() ?? props.prefix
      const suffixNode = slots.suffix?.() ?? props.suffix
      const upNode = slots.upHandler?.() ?? props.upHandler
      const downNode = slots.downHandler?.() ?? props.downHandler

      const upHandlerNode = (
        <StepHandler
          prefixCls={mergedPrefixCls}
          action="up"
          disabled={upDisabled.value}
          onStep={onInternalStep}
          className={classNames?.action}
          style={styles?.action}
        >
          {upNode}
        </StepHandler>
      )

      const downHandlerNode = (
        <StepHandler
          prefixCls={mergedPrefixCls}
          action="down"
          disabled={downDisabled.value}
          onStep={onInternalStep}
          className={classNames?.action}
          style={styles?.action}
        >
          {downNode}
        </StepHandler>
      )

      const inputAttrs = omit(
        {
          ...restAttrs,
        },
        [
          'prefixCls',
          'classNames',
          'styles',
          'defaultValue',
          'value',
          'prefix',
          'suffix',
          'upHandler',
          'downHandler',
          'keyboard',
          'changeOnWheel',
          'controls',
          'mode',
          'parser',
          'formatter',
          'precision',
          'decimalSeparator',
          'onChange',
          'onInput',
          'onPressEnter',
          'onStep',
          'changeOnBlur',
          'class',
          'style',
          'onMouseDown',
          'onClick',
          'onMouseUp',
          'onMouseLeave',
          'onMouseMove',
          'onMouseEnter',
          'onMouseOut',
          'onFocus',
          'onBlur',
          'onKeyDown',
          'onKeyUp',
          'onCompositionStart',
          'onCompositionEnd',
          'onBeforeInput',
        ],
      )

      return (
        <div
          ref={rootRef}
          class={clsx(
            mergedPrefixCls,
            `${mergedPrefixCls}-mode-${mode}`,
            mergedClassName,
            classNames?.root,
            {
              [`${mergedPrefixCls}-focused`]: focus.value,
              [`${mergedPrefixCls}-disabled`]: disabled,
              [`${mergedPrefixCls}-readonly`]: readOnly,
              [`${mergedPrefixCls}-not-a-number`]: decimalValue.value.isNaN(),
              [`${mergedPrefixCls}-out-of-range`]: !decimalValue.value.isInvalidate() && !isInRange(decimalValue.value),
            },
          )}
          style={mergedStyle}
          onMousedown={onInternalMouseDown}
          onMouseup={(e: MouseEvent) => {
            emit('mouseup', e)
            props.onMouseUp?.(e)
          }}
          onMouseleave={(e: MouseEvent) => {
            emit('mouseleave', e)
            props.onMouseLeave?.(e)
          }}
          onMousemove={(e: MouseEvent) => {
            emit('mousemove', e)
            props.onMouseMove?.(e)
          }}
          onMouseenter={(e: MouseEvent) => {
            emit('mouseenter', e)
            props.onMouseEnter?.(e)
          }}
          onMouseout={(e: MouseEvent) => {
            emit('mouseout', e)
            props.onMouseOut?.(e)
          }}
          onClick={(e: MouseEvent) => {
            emit('click', e)
            props.onClick?.(e)
          }}
        >
          {mode === 'spinner' && controls && downHandlerNode}

          {prefixNode !== undefined && (
            <div class={clsx(`${mergedPrefixCls}-prefix`, classNames?.prefix)} style={styles?.prefix}>
              {prefixNode}
            </div>
          )}

          <input
            autocomplete="off"
            role="spinbutton"
            aria-valuemin={props.min as any}
            aria-valuemax={props.max as any}
            aria-valuenow={decimalValue.value.isInvalidate() ? null : (decimalValue.value.toString() as any)}
            step={step as any}
            ref={inputRef}
            class={clsx(`${mergedPrefixCls}-input`, classNames?.input)}
            style={styles?.input}
            value={inputValue.value}
            onChange={onInternalInput}
            disabled={disabled}
            readonly={readOnly}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeydown={onKeyDown}
            onKeyup={onKeyUp}
            onCompositionstart={onCompositionStart}
            onCompositionend={onCompositionEnd}
            onBeforeinput={onBeforeInput}
            {...inputAttrs as any}
          />

          {suffixNode !== undefined && (
            <div class={clsx(`${mergedPrefixCls}-suffix`, classNames?.suffix)} style={styles?.suffix}>
              {suffixNode}
            </div>
          )}

          {mode === 'spinner' && controls && upHandlerNode}

          {mode === 'input' && controls && (
            <div class={clsx(`${mergedPrefixCls}-actions`, classNames?.actions)} style={styles?.actions}>
              {upHandlerNode}
              {downHandlerNode}
            </div>
          )}
        </div>
      )
    }
  },
  {
    name: 'InputNumber',
    inheritAttrs: false,
    emits: [
      'change',
      'update:value',
      'input',
      'pressEnter',
      'step',
      'mousedown',
      'click',
      'mouseup',
      'mouseleave',
      'mousemove',
      'mouseenter',
      'mouseout',
      'focus',
      'blur',
      'keydown',
      'keyup',
      'compositionstart',
      'compositionend',
      'beforeinput',
    ],
  },
)

export default InputNumber
