import type { ComputedRef, CSSProperties, ExtractPropTypes, PropType, Ref } from 'vue'
import type { HandlesRef } from './Handles'
import type {
  AriaValueFormat,
  Direction,
  OnStartMove,
  SliderClassNames,
  SliderStyles,
} from './interface'
import type { InternalMarkObj, MarkObj } from './Marks'
import isEqual from '@v-c/util/dist/isEqual'
import warning from '@v-c/util/dist/warning'
import cls from 'classnames'
import { computed, defineComponent, isVNode, ref, shallowRef, watch, watchEffect } from 'vue'
import { useProviderSliderContext } from './context'
import Handles from './Handles'
import useDrag from './hooks/useDrag'
import useOffset from './hooks/useOffset'
import useRange from './hooks/useRange'
import Marks from './Marks'
import Steps from './Steps'
import Tracks from './Tracks'

export interface RangeConfig {
  editable?: boolean
  draggableTrack?: boolean
  /** Set min count when `editable` */
  minCount?: number
  /** Set max count when `editable` */
  maxCount?: number
}

type ValueType = number | number[]

function sliderProps() {
  return {
    prefixCls: { type: String, default: 'vc-slider' },
    className: String,
    classNames: Object as PropType<SliderClassNames>,
    styles: Object as PropType<SliderStyles>,
    id: String,
    disabled: { type: Boolean, default: false },
    keyboard: { type: Boolean, default: true },
    autoFocus: Boolean,
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    value: [Number, Array] as PropType<ValueType>,
    defaultValue: [Number, Array] as PropType<ValueType>,
    range: [Boolean, Object] as PropType<boolean | RangeConfig>,
    count: Number,
    allowCross: { type: Boolean, default: true },
    pushable: { type: [Boolean, Number], default: false },
    reverse: Boolean,
    vertical: Boolean,
    included: { type: Boolean, default: true },
    startPoint: Number,
    trackStyle: [Object, Array] as PropType<Record<string, any> | Record<string, any>[]>,
    handleStyle: [Object, Array] as PropType<Record<string, any> | Record<string, any>[]>,
    railStyle: Object as PropType<Record<string, any>>,
    dotStyle: [Object, Function] as PropType<Record<string, any> | ((dotValue: number) => Record<string, any>)>,
    activeDotStyle: [Object, Function] as PropType<Record<string, any> | ((dotValue: number) => Record<string, any>)>,
    marks: Object as PropType<Record<string | number, any | MarkObj>>,
    dots: Boolean,
    handleRender: Function,
    activeHandleRender: Function,
    track: { type: Boolean, default: true },
    tabIndex: { type: [Number, Array] as PropType<ValueType>, default: 0 },
    ariaLabelForHandle: [String, Array] as PropType<string | string[]>,
    ariaLabelledByForHandle: [String, Array] as PropType<string | string[]>,
    ariaRequired: Boolean,
    ariaValueTextFormatterForHandle: [Function, Array] as PropType<AriaValueFormat | AriaValueFormat[]>,
    onFocus: Function as PropType<(e: FocusEvent) => void>,
    onBlur: Function as PropType<(e: FocusEvent) => void>,
    onChange: Function as PropType<(value: ValueType) => void>,
    /** @deprecated It's always better to use `onChange` instead */
    onBeforeChange: Function as PropType<(value: ValueType) => void>,
    /** @deprecated Use `onChangeComplete` instead */
    onAfterChange: Function as PropType<(value: ValueType) => void>,
    onChangeComplete: Function as PropType<(value: ValueType) => void>,
  }
}
export type SliderProps = Partial<ExtractPropTypes<ReturnType<typeof sliderProps>>>

export interface SliderRef {
  focus: () => void
  blur: () => void
}

export default defineComponent({
  name: 'Slider',
  props: {
    ...sliderProps(),
  },
  emits: ['focus', 'blur', 'change', 'beforeChange', 'afterChange', 'changeComplete'],
  setup(props, { attrs, emit, expose }) {
    const handlesRef = ref<HandlesRef>()
    const containerRef = ref<HTMLDivElement>()

    const direction = shallowRef<Direction>('ltr')
    watch([() => props.reverse, () => props.vertical], ([newReverse, newVertical]) => {
      if (newVertical) {
        direction.value = newReverse ? 'ttb' : 'btt'
      }
      else {
        direction.value = newReverse ? 'rtl' : 'ltr'
      }
    }, { immediate: true })

    const mergedMin = shallowRef(0)
    const mergedMax = shallowRef(100)
    const mergedStep = shallowRef(1)
    const markList = ref<InternalMarkObj[]>([])

    const mergedValue = ref<ValueType>(props.defaultValue! || props.value!)
    const rawValues = ref<number[] | ComputedRef<number[]>>([])
    const getRange = ref()
    const getOffset = ref()

    watchEffect(() => {
      const {
        range,
        min,
        max,
        step,
        pushable,
        marks,
        allowCross,
        value,
        count,
      } = props
      // ============================ Range =============================
      const [rangeEnabled, rangeEditable, rangeDraggableTrack, minCount, maxCount] = useRange(range)
      getRange.value = {
        rangeEnabled,
        rangeEditable,
        rangeDraggableTrack,
        minCount,
        maxCount,
      }

      mergedMin.value = isFinite(min) ? min : 0
      mergedMax.value = isFinite(max) ? max : 100

      // ============================= Step =============================
      mergedStep.value = step !== null && step <= 0 ? 1 : step

      // ============================= Push =============================
      const mergedPush = computed(() => {
        if (typeof pushable === 'boolean') {
          return pushable ? mergedStep.value : false
        }
        return pushable >= 0 ? pushable : false
      })

      // ============================ Marks =============================
      markList.value = Object.keys(marks || {})
        .map<InternalMarkObj>((key) => {
          const mark = marks?.[key]
          const markObj: InternalMarkObj = {
            value: Number(key),
          }

          if (
            mark
            && typeof mark === 'object'
            && !isVNode(mark)
            && ('label' in mark || 'style' in mark)
          ) {
            markObj.style = mark.style
            markObj.label = mark.label
          }
          else {
            markObj.label = mark
          }

          return markObj
        })
        .filter(({ label }) => label || typeof label === 'number')
        .sort((a, b) => a.value - b.value)

      // ============================ Format ============================
      const [formatValue, offsetValues] = useOffset(
        mergedMin.value,
        mergedMax.value,
        mergedStep.value,
        markList.value,
        allowCross,
        mergedPush.value,
      )
      getOffset.value = {
        formatValue,
        offsetValues,
      }

      // ============================ Values ============================
      if (value !== undefined) {
        mergedValue.value = value
      }

      const getRawValues = computed(() => {
        const valueList
            = mergedValue.value === null || mergedValue.value === undefined
              ? []
              : Array.isArray(mergedValue.value)
                ? mergedValue.value
                : [mergedValue.value]

        const [val0 = mergedMin.value] = valueList
        let returnValues = mergedValue.value === null ? [] : [val0]

        // Format as range
        if (rangeEnabled) {
          returnValues = [...valueList]

          // When count provided or value is `undefined`, we fill values
          if (count || mergedValue.value === undefined) {
            const pointCount = count! >= 0 ? count! + 1 : 2
            returnValues = returnValues.slice(0, pointCount)

            // Fill with count
            while (returnValues.length < pointCount) {
              returnValues.push(returnValues[returnValues.length - 1] ?? mergedMin.value)
            }
          }
          returnValues.sort((a, b) => a - b)
        }

        // Align in range
        returnValues.forEach((val, index) => {
          returnValues[index] = formatValue(val)
        })

        return returnValues
      })

      rawValues.value = getRawValues.value
    })

    // =========================== onChange ===========================
    const getTriggerValue = (triggerValues: number[]) => {
      return getRange.value.rangeEnabled ? triggerValues : triggerValues[0]
    }

    const triggerChange = (nextValues: number[]) => {
      // Order first
      const cloneNextValues = [...nextValues].sort((a, b) => a - b)

      // Trigger event if needed
      if (!isEqual(cloneNextValues, rawValues.value, true)) {
        emit('change', getTriggerValue(cloneNextValues))
      }

      // We set this later since it will re-render component immediately
      mergedValue.value = cloneNextValues
    }

    const finishChange = (draggingDelete?: boolean) => {
      // Trigger from `useDrag` will tell if it's a delete action
      if (draggingDelete) {
        handlesRef.value?.hideHelp()
      }

      const finishValue = getTriggerValue(rawValues.value)
      if (props.onAfterChange) {
        emit('afterChange', finishValue)
        warning(
          false,
          '[vc-slider] `onAfterChange` is deprecated. Please use `onChangeComplete` instead.',
        )
      }
      emit('changeComplete', finishValue)
    }

    const onDelete = (index: number) => {
      if (props.disabled || !getRange.value.rangeEditable || rawValues.value.length <= getRange.value.minCount) {
        return
      }

      const cloneNextValues = [...rawValues.value]
      cloneNextValues.splice(index, 1)

      emit('beforeChange', getTriggerValue(cloneNextValues))
      triggerChange(cloneNextValues)

      const nextFocusIndex = Math.max(0, index - 1)
      handlesRef.value?.hideHelp()
      handlesRef.value?.focus(nextFocusIndex)
    }
    const [draggingIndex, draggingValue, draggingDelete, cacheValues, onStartDrag] = useDrag(
      containerRef as Ref<HTMLDivElement>,
      direction,
      rawValues,
      mergedMin,
      mergedMax,
      getOffset.value.formatValue,
      triggerChange,
      finishChange,
      getOffset.value.offsetValues,
      getRange.value.rangeEditable,
      getRange.value.minCount,
    )

    /**
     * When `rangeEditable` will insert a new value in the values array.
     * Else it will replace the value in the values array.
     */
    const changeToCloseValue = (newValue: number, e?: MouseEvent) => {
      if (!props.disabled) {
        // Create new values
        const cloneNextValues = [...rawValues.value]

        let valueIndex = 0
        let valueBeforeIndex = 0 // Record the index which value < newValue
        let valueDist = mergedMax.value - mergedMin.value

        rawValues.value.forEach((val, index) => {
          const dist = Math.abs(newValue - val)
          if (dist <= valueDist) {
            valueDist = dist
            valueIndex = index
          }

          if (val < newValue) {
            valueBeforeIndex = index
          }
        })

        let focusIndex = valueIndex

        if (getRange.value.rangeEditable && valueDist !== 0 && (!getRange.value.maxCount || rawValues.value.length < getRange.value.maxCount)) {
          cloneNextValues.splice(valueBeforeIndex + 1, 0, newValue)
          focusIndex = valueBeforeIndex + 1
        }
        else {
          cloneNextValues[valueIndex] = newValue
        }
        // Fill value to match default 2 (only when `rawValues` is empty)
        if (getRange.value.rangeEnabled && !rawValues.value.length && props.count === undefined) {
          cloneNextValues.push(newValue)
        }

        const nextValue = getTriggerValue(cloneNextValues)
        emit('beforeChange', nextValue)
        triggerChange(cloneNextValues)

        if (e) {
          (document.activeElement as HTMLElement)?.blur?.()
          handlesRef.value?.focus(focusIndex)
          onStartDrag(e, focusIndex, cloneNextValues)
        }
        else {
          if (props.onAfterChange) {
            // https://github.com/ant-design/ant-design/issues/49997
            emit('afterChange', nextValue)
            warning(
              false,
              '[vc-slider] `onAfterChange` is deprecated. Please use `onChangeComplete` instead.',
            )
          }
          emit('changeComplete', nextValue)
        }
      }
    }

    // ============================ Click =============================
    const onSliderMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      const { width, height, left, top, bottom, right }
          = containerRef.value!.getBoundingClientRect()
      const { clientX, clientY } = e

      let percent: number
      switch (direction.value) {
        case 'btt':
          percent = (bottom - clientY) / height
          break

        case 'ttb':
          percent = (clientY - top) / height
          break

        case 'rtl':
          percent = (right - clientX) / width
          break

        default:
          percent = (clientX - left) / width
      }

      const nextValue = mergedMin.value + percent * (mergedMax.value - mergedMin.value)
      console.log('click', nextValue, getOffset.value.formatValue(nextValue))
      changeToCloseValue(getOffset.value.formatValue(nextValue), e)
    }

    // =========================== Keyboard ===========================
    const keyboardValue = ref<number | null>(null)

    const onHandleOffsetChange = (offset: number | 'min' | 'max', valueIndex: number) => {
      if (!props.disabled) {
        const next = getOffset.value.offsetValues(rawValues.value, offset, valueIndex)

        emit('beforeChange', getTriggerValue(rawValues.value))
        triggerChange(next.values)

        keyboardValue.value = next.value
      }
    }

    watchEffect(() => {
      if (keyboardValue.value !== null) {
        const valueIndex = rawValues.value.indexOf(keyboardValue.value)
        if (valueIndex >= 0) {
          handlesRef.value?.focus(valueIndex)
        }
      }

      keyboardValue.value = null
    })

    // ============================= Drag =============================
    const mergedDraggableTrack = computed(() => {
      if (getRange.value.rangeDraggableTrack && mergedStep.value === null) {
        if (process.env.NODE_ENV !== 'production') {
          warning(false, '`draggableTrack` is not supported when `step` is `null`.')
        }
        return false
      }
      return getRange.value.rangeDraggableTrack
    })

    const onStartMove: OnStartMove = (e, valueIndex) => {
      console.log('onStartMove-valueIndex', valueIndex)
      onStartDrag(e, valueIndex)

      emit('beforeChange', getTriggerValue(rawValues.value))
    }

    // Auto focus for updated handle
    const dragging = computed(() => draggingIndex.value !== -1)
    watchEffect(() => {
      if (!dragging.value) {
        const valueIndex = rawValues.value.lastIndexOf(draggingValue.value)
        handlesRef.value?.focus(valueIndex)
      }
    })

    // =========================== Included ===========================
    const sortedCacheValues = computed(
      () => [...cacheValues.value].sort((a, b) => a - b),
    )

    // Provide a range values with included [min, max]
    // Used for Track, Mark & Dot
    const [includedStart, includedEnd] = computed(() => {
      if (!getRange.value.rangeEnabled) {
        return [mergedMin.value, sortedCacheValues.value[0]]
      }

      return [sortedCacheValues.value[0], sortedCacheValues.value[sortedCacheValues.value.length - 1]]
    }).value

    // ============================= Refs =============================
    expose({
      focus: () => {
        handlesRef.value?.focus(0)
      },
      blur: () => {
        const { activeElement } = document
        if (containerRef.value?.contains(activeElement)) {
          (activeElement as HTMLElement)?.blur()
        }
      },
    })

    // ========================== Auto Focus ==========================
    watchEffect(() => {
      if (props.autoFocus) {
        handlesRef.value?.focus(0)
      }
    })
    // =========================== Context ============================
    const context = computed(() => ({
      min: mergedMin,
      max: mergedMax,
      direction,
      disabled: props.disabled,
      keyboard: props.keyboard,
      step: mergedStep,
      included: props.included,
      includedStart,
      includedEnd,
      range: getRange.value.rangeEnabled,
      tabIndex: props.tabIndex,
      ariaLabelForHandle: props.ariaLabelForHandle,
      ariaLabelledByForHandle: props.ariaLabelledByForHandle,
      ariaRequired: props.ariaRequired,
      ariaValueTextFormatterForHandle: props.ariaValueTextFormatterForHandle,
      styles: props.styles || {},
      classNames: props.classNames || {},
    }))
    useProviderSliderContext(context.value)

    // ============================ Render ============================
    return () => {
      const {
        prefixCls = 'vc-slider',
        id,

        // Status
        disabled = false,
        vertical,

        // Style
        startPoint,
        trackStyle,
        handleStyle,
        railStyle,
        dotStyle,
        activeDotStyle,

        // Decorations
        dots,
        handleRender,
        activeHandleRender,

        // Components
        track,
        classNames,
        styles,
      } = props
      return (
        <div
          ref={containerRef}
          class={cls(prefixCls, [attrs.class], {
            [`${prefixCls}-disabled`]: disabled,
            [`${prefixCls}-vertical`]: vertical,
            [`${prefixCls}-horizontal`]: !vertical,
            [`${prefixCls}-with-marks`]: markList.value.length,
          })}
          style={attrs.style as CSSProperties}
          onMousedown={onSliderMouseDown}
          id={id}
        >
          <div
            class={cls(`${prefixCls}-rail`, classNames?.rail)}
            style={{ ...railStyle, ...styles?.rail }}
          />

          {track && (
            <Tracks
              prefixCls={prefixCls}
              // 将style换成trackStyle，因为vue通过attrs取style，数组会合并，相同的样式名如backgroundColor后一个会覆盖前面的
              trackStyle={trackStyle}
              values={rawValues.value}
              startPoint={startPoint}
              onStartMove={mergedDraggableTrack.value ? onStartMove : undefined}
            />
          )}

          <Steps
            prefixCls={prefixCls}
            marks={markList.value}
            dots={dots}
            style={dotStyle}
            activeStyle={activeDotStyle}
          />

          <Handles
            ref={handlesRef}
            prefixCls={prefixCls}
            // 原因如⬆️trackStyle
            handleStyle={handleStyle}
            values={cacheValues.value}
            draggingIndex={draggingIndex.value}
            draggingDelete={draggingDelete.value}
            onStartMove={onStartMove}
            onOffsetChange={onHandleOffsetChange}
            onFocus={(e: FocusEvent) => emit('focus', e)}
            onBlur={(e: FocusEvent) => emit('blur', e)}
            handleRender={handleRender}
            activeHandleRender={activeHandleRender}
            onChangeComplete={finishChange}
            onDelete={getRange.value.rangeEditable ? onDelete : () => {}}
          />

          <Marks prefixCls={prefixCls} marks={markList.value} onClick={changeToCloseValue} />
        </div>
      )
    }
  },
})
