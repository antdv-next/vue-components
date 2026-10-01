import type { InternalMode, Locale, SharedPickerProps } from '../interface'

export function leftPad(
  str: string | number,
  length: number,
  fill: string = '0',
) {
  let current = String(str)
  while (current.length < length) {
    current = `${fill}${current}`
  }
  return current
}

/**
 * Convert `value` to array. Will provide `[]` if is null or undefined.
 */
export function toArray<T>(val: T | T[]): T[] {
  if (val === null || val === undefined) {
    return []
  }

  return Array.isArray(val) ? val : [val]
}

export function fillIndex<T extends any[]>(
  ori: T,
  index: number,
  value: T[number],
): T {
  const clone = [...ori] as T
  clone[index] = value

  return clone
}

/** Pick props from the key list. Will filter empty value */
export function pickProps<T extends object>(
  props: T,
  keys?: (keyof T)[] | readonly (keyof T)[],
) {
  const clone = {} as T

  // `props` is usually a reactive proxy: read each key exactly once, since
  // every read goes through the proxy `get` trap and dependency tracking.
  if (keys) {
    for (const key of keys) {
      const value = props[key]
      if (value !== undefined) {
        clone[key] = value
      }
    }
  }
  else {
    for (const key in props) {
      const value = props[key]
      if (value !== undefined) {
        clone[key] = value
      }
    }
  }

  return clone
}

export function getRowFormat(
  picker: InternalMode,
  locale: Locale,
  format?: SharedPickerProps['format'] | null,
) {
  if (format) {
    return format
  }

  switch (picker) {
    // All from the `locale.fieldXXXFormat` first
    case 'time':
      return locale.fieldTimeFormat
    case 'datetime':
      return locale.fieldDateTimeFormat
    case 'month':
      return locale.fieldMonthFormat
    case 'year':
      return locale.fieldYearFormat
    case 'quarter':
      return locale.fieldQuarterFormat
    case 'week':
      return locale.fieldWeekFormat

    default:
      return locale.fieldDateFormat
  }
}

export function getFromDate<DateType>(
  calendarValues: DateType[],
  triggeredFields: number[],
  activeIndex: number,
) {
  const firstValuedIndex = triggeredFields.find(
    index => calendarValues[index],
  )

  return activeIndex !== firstValuedIndex
    ? calendarValues[firstValuedIndex!]
    : undefined
}
