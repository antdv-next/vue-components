import type { ComputedRef, Ref } from 'vue'
import type { Locale, SharedTimeProps } from '../interface'
import { computed } from 'vue'
import defaultLocale from '../locale/en_US'

export function fillTimeFormat(
  showHour: boolean | undefined,
  showMinute: boolean | undefined,
  showSecond: boolean | undefined,
  showMillisecond: boolean | undefined,
  showMeridiem: boolean | undefined,
) {
  let timeFormat = ''

  // Base HH:mm:ss
  const cells = []

  if (showHour) {
    cells.push(showMeridiem ? 'hh' : 'HH')
  }
  if (showMinute) {
    cells.push('mm')
  }
  if (showSecond) {
    cells.push('ss')
  }

  timeFormat = cells.join(':')

  // Millisecond
  if (showMillisecond) {
    timeFormat += '.SSS'
  }

  // Meridiem
  if (showMeridiem) {
    timeFormat += ' A'
  }

  return timeFormat
}

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
function fillLocale(
  locale: Locale | undefined,
  showHour: boolean | undefined,
  showMinute: boolean | undefined,
  showSecond: boolean | undefined,
  showMillisecond: boolean | undefined,
  use12Hours: boolean | undefined,
): Locale {
  const mergedLocale = (locale || defaultLocale || {}) as Locale
  // Not fill `monthFormat` since `locale.shortMonths` handle this
  // Not fill `cellMeridiemFormat` since AM & PM by default
  const {
    // Input Field
    fieldDateTimeFormat,
    fieldDateFormat,
    fieldTimeFormat,
    fieldMonthFormat,
    fieldYearFormat,
    fieldWeekFormat,
    fieldQuarterFormat,

    // Header Format
    yearFormat,
    // monthFormat,

    // Cell format
    cellYearFormat,
    cellQuarterFormat,
    dayFormat,
    cellDateFormat,

    // cellMeridiemFormat,
  } = mergedLocale

  const timeFormat = fillTimeFormat(showHour, showMinute, showSecond, showMillisecond, use12Hours)

  return {
    ...mergedLocale,

    fieldDateTimeFormat: fieldDateTimeFormat || `YYYY-MM-DD ${timeFormat}`,
    fieldDateFormat: fieldDateFormat || 'YYYY-MM-DD',
    fieldTimeFormat: fieldTimeFormat || timeFormat,
    fieldMonthFormat: fieldMonthFormat || 'YYYY-MM',
    fieldYearFormat: fieldYearFormat || 'YYYY',
    fieldWeekFormat: fieldWeekFormat || 'gggg-wo',
    fieldQuarterFormat: fieldQuarterFormat || 'YYYY-[Q]Q',

    yearFormat: yearFormat || 'YYYY',

    cellYearFormat: cellYearFormat || 'YYYY',
    cellQuarterFormat: cellQuarterFormat || '[Q]Q',
    cellDateFormat: cellDateFormat || dayFormat || 'D',
  }
}

/**
 * Fill locale format as start up
 */

type ShowProps<DateType extends object> = Pick<
  SharedTimeProps<DateType>,
    'showHour' | 'showMinute' | 'showSecond' | 'showMillisecond' | 'use12Hours'
>
export default function useLocale<DateType extends object>(
  locale: ComputedRef<Locale | undefined>,
  showProps: ComputedRef<ShowProps<DateType>> | Ref<ShowProps<DateType>>,
): ComputedRef<Locale> {
  return computed<Locale>(() => {
    const {
      showHour,
      showMinute,
      showSecond,
      showMillisecond,
      use12Hours,
    } = showProps.value || {}
    return fillLocale(locale.value, showHour, showMinute, showSecond, showMillisecond, use12Hours)
  })
}
