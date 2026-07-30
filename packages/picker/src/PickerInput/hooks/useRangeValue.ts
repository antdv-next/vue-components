import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { GenerateConfig } from '../../generate'
import type { BaseInfo, FormatType, Locale } from '../../interface'
import { computed, ref, shallowRef, watch } from 'vue'
import { formatValue, isSame, isSameTimestamp } from '../../utils/dateUtil'
import { fillIndex } from '../../utils/miscUtil'

const EMPTY_VALUE: any[] = []

type TriggerCalendarChange<ValueType extends object[]> = (calendarValues: ValueType) => void
type UseInnerValueReturn<ValueType extends object[]> = readonly [
  ShallowRef<ValueType>,
  (val: ValueType) => void,
  Ref<ValueType>,
  TriggerCalendarChange<ValueType>,
  () => void,
]

function useUtil<MergedValueType extends object[], DateType extends MergedValueType[number] = any>(
  generateConfig: Ref<GenerateConfig<DateType>>,
  locale: Ref<Locale>,
  formatList: Ref<FormatType[]>,
) {
  const getDateTexts = (dates: MergedValueType) => {
    return dates.map(date =>
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      formatValue(date, { generateConfig: generateConfig.value, locale: locale.value, format: formatList.value[0] }),
    ) as any as [string, string]
  }

  const isSameDates = (source: MergedValueType, target: MergedValueType) => {
    const maxLen = Math.max(source.length, target.length)
    let diffIndex = -1

    for (let i = 0; i < maxLen; i += 1) {
      const prev = source[i] || null
      const next = target[i] || null

      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      if (prev !== next && !isSameTimestamp(generateConfig.value, prev, next)) {
        diffIndex = i
        break
      }
    }

    return [diffIndex < 0, diffIndex !== 0]
  }

  return [getDateTexts, isSameDates] as const
}

function orderDates<DateType extends object, DatesType extends DateType[]>(
  dates: DatesType,
  generateConfig: GenerateConfig<DateType>,
) {
  return [...dates].sort((a, b) => (generateConfig.isAfter(a, b) ? 1 : -1)) as DatesType
}

/**
 * Control the internal `value` align with prop `value` and provide a temp `calendarValue` for ui.
 * The caller controls the temporary `calendarValue` lifecycle through event handlers.
 */
export function useInnerValue<ValueType extends DateType[], DateType extends object = any>(
  generateConfig: Ref<GenerateConfig<DateType>>,
  locale: Ref<Locale>,
  formatList: Ref<FormatType[]>,
  rangeValue: Ref<boolean | undefined>,
  order: Ref<boolean | undefined>,
  defaultValue: Ref<ValueType | undefined>,
  value: Ref<ValueType | undefined>,
  onCalendarChange?: (
    dates: ValueType,
    dateStrings: [string, string],
    info: BaseInfo,
  ) => void,
  onOk?: (dates: ValueType) => void,
): UseInnerValueReturn<ValueType> {
  const initialValue = ((value.value === undefined ? defaultValue.value : value.value) || EMPTY_VALUE) as ValueType
  const mergedValue = shallowRef(initialValue) as ShallowRef<ValueType>

  watch(value, (value) => {
    mergedValue.value = value || (EMPTY_VALUE as ValueType)
  })

  const setInnerValue = (val: ValueType) => {
    if (value.value === undefined) {
      mergedValue.value = val
    }
  }

  // ========================= Inner Values =========================
  const calendarValue = ref<ValueType>(mergedValue.value) as Ref<ValueType>
  watch(mergedValue, (val) => {
    calendarValue.value = val
  })
  const setCalendarValue = (val: ValueType) => {
    calendarValue.value = val
  }

  // ============================ Change ============================
  const [getDateTexts, isSameDates] = useUtil<ValueType>(generateConfig, locale, formatList)

  const triggerCalendarChange: TriggerCalendarChange<ValueType> = (nextCalendarValues: ValueType) => {
    let clone = [...nextCalendarValues] as ValueType

    if (rangeValue.value) {
      for (let i = 0; i < 2; i += 1) {
        clone[i] = clone[i] || null
      }
    }
    else if (order.value) {
      clone = orderDates(clone.filter(date => date) as ValueType, generateConfig.value)
    }

    // Update merged value
    const [isSameMergedDates, isSameStart] = isSameDates(calendarValue.value, clone)

    if (!isSameMergedDates) {
      setCalendarValue(clone)

      // Trigger calendar change event
      if (onCalendarChange) {
        const cellTexts = getDateTexts(clone)
        onCalendarChange(clone, cellTexts, { range: isSameStart ? 'end' : 'start' })
      }
    }
  }

  const triggerOk = () => {
    if (onOk) {
      onOk(calendarValue.value)
    }
  }

  return [mergedValue, setInnerValue, calendarValue, triggerCalendarChange, triggerOk] as const
}

export default function useRangeValue<ValueType extends DateType[], DateType extends object = any>(
  info: ComputedRef<{
    generateConfig: GenerateConfig<DateType>
    locale: Locale
    picker: string
    allowEmpty: boolean[]
    order: boolean
    onChange?: (dates: ValueType | null, dateStrings: [string, string] | null) => void
  }>,
  mergedValue: Ref<ValueType> | ComputedRef<ValueType>,
  setInnerValue: (nextValue: ValueType) => void,
  getCalendarValue: () => ValueType,
  triggerCalendarChange: TriggerCalendarChange<ValueType>,
  disabled: Ref<boolean[]>,
  formatList: Ref<FormatType[]>,
  isInvalidateDate: (date: DateType, info?: { from?: DateType, activeIndex: number }) => boolean,
) {
  const orderOnChange = computed(() => (disabled.value.some(d => d) ? false : info.value.order))

  // ============================= Util =============================
  const [getDateTexts, isSameDates] = useUtil<ValueType>(computed(() => info.value.generateConfig), computed(() => info.value.locale), formatList)

  // ============================ Values ============================
  // Used for trigger `onChange` event.
  // Record current value which is wait for submit.
  const submitValue = ref(mergedValue.value) as Ref<ValueType>
  watch(mergedValue, (val) => {
    submitValue.value = val
  })
  const setSubmitValue = (val: ValueType) => {
    submitValue.value = val
  }

  // ============================ Submit ============================
  const triggerSubmit = (nextValue?: ValueType) => {
    const {
      generateConfig,
      locale,
      picker,
      onChange,
      allowEmpty,
      order,
    } = info.value

    const isNullValue = nextValue === null

    let clone = [...(nextValue || submitValue.value)] as ValueType

    // Fill null value
    if (isNullValue) {
      const maxLen = Math.max(disabled.value.length, clone.length)

      for (let i = 0; i < maxLen; i += 1) {
        if (!disabled.value[i]) {
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-expect-error
          clone[i] = null
        }
      }
    }

    // Only when exist value to sort
    if (orderOnChange.value && clone[0] && clone[1]) {
      clone = orderDates(clone, generateConfig)
    }

    // Sync `calendarValue`
    triggerCalendarChange(clone)

    // ========= Validate check =========
    const [start, end] = clone

    // >>> Empty
    const startEmpty = !start
    const endEmpty = !end

    const validateEmptyDateRange = allowEmpty
      ? (
          // Validate empty start
          (!startEmpty || allowEmpty[0])
          // Validate empty end
          && (!endEmpty || allowEmpty[1])
        )
      : true

    // >>> Order
    const validateOrder = !order
      || startEmpty
      || endEmpty
      || isSame(generateConfig, locale, start, end, picker as any)
      || generateConfig.isAfter(end, start)

    // >>> Invalid
    const validateDates
      // Validate start
      = (disabled.value[0] || !start || !isInvalidateDate(start, { activeIndex: 0 }))
      // Validate end
        && (disabled.value[1] || !end || !isInvalidateDate(end, { from: start, activeIndex: 1 }))
    // >>> Result
    const allPassed
      // Null value is from clear button
      = isNullValue
      // Normal check
        || (validateEmptyDateRange && validateOrder && validateDates)

    if (allPassed) {
      const oldValue = mergedValue.value
      // Sync value with submit value
      setInnerValue(clone)

      // submitValue.value is old value, setInnerValue is new value,
      // so we need to sync submitValue.value to new value.
      submitValue.value = clone

      const [isSameMergedDates] = isSameDates(clone, oldValue)
      // Trigger `onChange` if needed
      if (onChange && !isSameMergedDates) {
        const everyEmpty = clone.every(val => !val)
        onChange(
          // Return null directly if all date are empty
          (isNullValue && everyEmpty ? null : clone) as any,
          everyEmpty ? null : getDateTexts(clone),
        )
      }
    }

    return allPassed
  }

  // ========================= Flush Submit =========================
  const flushSubmit = (index: number, needTriggerChange: boolean) => {
    const nextSubmitValue = fillIndex(submitValue.value, index, getCalendarValue()[index])
    setSubmitValue(nextSubmitValue)

    if (needTriggerChange) {
      triggerSubmit()
    }
  }

  // ============================= Reset =============================
  // Reset calendar and submit values back to the committed value. The caller
  // owns the temporary `calendarValue` lifecycle, so there is no longer a
  // blur/open effect that submits on its own.
  // 将 calendar 与 submit 值重置回已提交值。临时 `calendarValue` 的生命周期
  // 由调用方掌控，因此不再有基于 blur/open 的自动提交 effect。
  const resetValue = (index?: number) => {
    if (index === undefined) {
      triggerCalendarChange(mergedValue.value)
      submitValue.value = mergedValue.value
      return
    }

    triggerCalendarChange(
      fillIndex(getCalendarValue(), index, mergedValue.value[index]) as ValueType,
    )
    setSubmitValue(fillIndex(submitValue.value, index, mergedValue.value[index]) as ValueType)
  }

  return [flushSubmit, triggerSubmit, resetValue] as const
}
