import type { Ref } from 'vue'
import type { GenerateConfig } from '../../generate'
import type { InternalMode, Locale, PanelMode } from '../../interface'
import { computed, ref, watch } from 'vue'
import useSyncState from '../../hooks/useSyncState'
import { fillTime, isSame } from '../../utils/dateUtil'

export function offsetPanelDate<DateType = any>(
  generateConfig: GenerateConfig<DateType>,
  picker: InternalMode,
  date: DateType,
  offset: number,
) {
  switch (picker) {
    case 'date':
    case 'datetime':
    case 'week':
      return generateConfig.addMonth(date, offset)

    case 'month':
    case 'quarter':
      return generateConfig.addYear(date, offset)

    case 'year':
      return generateConfig.addYear(date, offset * 10)

    case 'decade':
      return generateConfig.addYear(date, offset * 100)

    default:
      return date
  }
}

const EMPTY_LIST: any[] = []

export default function useRangePickerValue<DateType extends object, ValueType extends DateType[]>(
  generateConfig: Ref<GenerateConfig<DateType>>,
  locale: Ref<Locale>,
  calendarValue: Ref<ValueType>,
  modes: Ref<PanelMode[]>,
  open: Ref<boolean>,
  activeIndex: Ref<number>,
  pickerMode: Ref<InternalMode>,
  multiplePanel: Ref<boolean>,
  defaultPickerValue: Ref<any> = ref(EMPTY_LIST),
  pickerValue: Ref<any> = ref(EMPTY_LIST),
  timeDefaultValue: Ref<any> = ref(EMPTY_LIST),
  onPickerValueChange?: ((dates: ValueType, info: any) => void) | Ref<((dates: ValueType, info: any) => void) | undefined>,
  minDate?: Ref<DateType | undefined>,
  maxDate?: Ref<DateType | undefined>,
): [currentIndexPickerValue: Ref<DateType>, setCurrentIndexPickerValue: (value: DateType, source?: 'reset' | 'panel') => void] {
  const isTimePicker = computed(() => pickerMode.value === 'time')

  const mergedActiveIndex = computed(() => activeIndex.value || 0)

  const getDefaultPickerValue = (index: number) => {
    let now = generateConfig.value?.getNow?.()
    if (!now) {
      return
    }

    if (isTimePicker.value) {
      now = fillTime(generateConfig.value, now)
    }

    return defaultPickerValue.value?.[index] || calendarValue.value?.[index] || now
  }

  const [getStartPickerValue, setStartPickerValue]
    = useSyncState(getDefaultPickerValue(0), () => pickerValue.value?.[0])

  const [getEndPickerValue, setEndPickerValue]
    = useSyncState(getDefaultPickerValue(1), () => pickerValue.value?.[1])

  const currentPickerValue = computed(() => {
    const current = [getStartPickerValue(true), getEndPickerValue(true)][mergedActiveIndex.value]
    if (!current) {
      return current
    }

    return isTimePicker.value
      ? current
      : fillTime(generateConfig.value, current, timeDefaultValue.value?.[mergedActiveIndex.value])
  }) as Ref<DateType>

  const setCurrentPickerValue = (nextPickerValue: DateType, source: 'reset' | 'panel' = 'panel') => {
    const prevStartPickerValue = getStartPickerValue(true)
    const prevEndPickerValue = getEndPickerValue(true)

    const updater = [setStartPickerValue, setEndPickerValue][mergedActiveIndex.value]
    updater(nextPickerValue)

    const clone: any[] = [prevStartPickerValue, prevEndPickerValue]
    clone[mergedActiveIndex.value] = nextPickerValue

    const mergedCallback = typeof onPickerValueChange === 'function' ? onPickerValueChange : onPickerValueChange?.value

    if (
      mergedCallback
      && (
        !isSame(generateConfig.value, locale.value, prevStartPickerValue, clone[0], pickerMode.value)
        || !isSame(generateConfig.value, locale.value, prevEndPickerValue, clone[1], pickerMode.value)
      )
    ) {
      mergedCallback(clone as ValueType, {
        source,
        range: mergedActiveIndex.value === 1 ? 'end' : 'start',
        mode: modes.value as any,
      })
    }
  }

  const getEndDatePickerValue = (startDate: DateType, endDate: DateType) => {
    if (multiplePanel.value) {
      const SAME_CHECKER: Partial<Record<InternalMode, PanelMode>> = {
        date: 'month',
        datetime: 'month',
        week: 'month',
        month: 'year',
        quarter: 'year',
      }

      const mode = SAME_CHECKER[pickerMode.value]
      if (mode && !isSame(generateConfig.value, locale.value, startDate, endDate, mode as any)) {
        return offsetPanelDate(generateConfig.value, pickerMode.value, endDate, -1)
      }

      if (pickerMode.value === 'year' && startDate && endDate) {
        const srcYear = Math.floor(generateConfig.value.getYear(startDate) / 10)
        const tgtYear = Math.floor(generateConfig.value.getYear(endDate) / 10)
        if (srcYear !== tgtYear) {
          return offsetPanelDate(generateConfig.value, pickerMode.value, endDate, -1)
        }
      }
    }

    return endDate
  }

  const prevActiveIndexRef = ref<number | null>(null)

  watch(
    () => [open.value, mergedActiveIndex.value, calendarValue.value?.[mergedActiveIndex.value]],
    () => {
      if (!open.value) {
        return
      }

      if (defaultPickerValue.value?.[mergedActiveIndex.value]) {
        return
      }

      let nextPickerValue: DateType | null = isTimePicker.value ? null : generateConfig.value.getNow()

      if (
        prevActiveIndexRef.value !== null
        && prevActiveIndexRef.value !== mergedActiveIndex.value
      ) {
        nextPickerValue = [getStartPickerValue(true), getEndPickerValue(true)][mergedActiveIndex.value ^ 1]
      }
      else if (calendarValue.value?.[mergedActiveIndex.value]) {
        nextPickerValue = mergedActiveIndex.value === 0
          ? calendarValue.value[0]
          : getEndDatePickerValue(calendarValue.value[0] as any, calendarValue.value[1] as any)
      }
      else if (calendarValue.value?.[mergedActiveIndex.value ^ 1]) {
        nextPickerValue = calendarValue.value[mergedActiveIndex.value ^ 1] as any
      }

      if (!nextPickerValue) {
        return
      }

      if (minDate?.value && generateConfig.value.isAfter(minDate.value, nextPickerValue)) {
        nextPickerValue = minDate.value
      }

      const offsetPickerValue = multiplePanel.value
        ? offsetPanelDate(generateConfig.value, pickerMode.value, nextPickerValue, 1)
        : nextPickerValue
      if (maxDate?.value && generateConfig.value.isAfter(offsetPickerValue, maxDate.value)) {
        nextPickerValue = multiplePanel.value
          ? offsetPanelDate(generateConfig.value, pickerMode.value, maxDate.value, -1)
          : maxDate.value
      }

      setCurrentPickerValue(nextPickerValue, 'reset')
    },
    { flush: 'post' },
  )

  watch(
    () => [open.value, mergedActiveIndex.value],
    () => {
      if (open.value) {
        prevActiveIndexRef.value = mergedActiveIndex.value
      }
      else {
        prevActiveIndexRef.value = null
      }
    },
    { flush: 'post' },
  )

  watch(
    () => [open.value, mergedActiveIndex.value, defaultPickerValue.value?.[mergedActiveIndex.value]],
    () => {
      if (open.value && defaultPickerValue.value?.[mergedActiveIndex.value]) {
        setCurrentPickerValue(defaultPickerValue.value[mergedActiveIndex.value] as any, 'reset')
      }
    },
    { flush: 'post' },
  )

  return [currentPickerValue, setCurrentPickerValue]
}
