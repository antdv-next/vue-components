import type { ComputedRef, Ref } from 'vue'
import type { GenerateConfig } from '../generate'
import type { DisabledTimes, SharedTimeProps } from '../interface'
import { warning } from '@v-c/util'
import { computed } from 'vue'
import { leftPad } from '../utils/miscUtil'

// eslint-disable-next-line ts/consistent-type-definitions
export type Unit<ValueType = number | string> = {
  label: string | number
  value: ValueType
  disabled?: boolean
}

function emptyDisabled<T>(): T[] {
  return []
}

function generateUnits(
  start: number,
  end: number,
  step = 1,
  hideDisabledOptions = false,
  disabledUnits: number[] = [],
  pad = 2,
) {
  const units: Unit<number>[] = []
  const integerStep = step >= 1 ? step | 0 : 1
  for (let i = start; i <= end; i += integerStep) {
    const disabled = disabledUnits.includes(i)

    if (!disabled || !hideDisabledOptions) {
      units.push({
        label: leftPad(i, pad),
        value: i,
        disabled,
      })
    }
  }
  return units
}

/**
 * Parse time props to get util info
 */
export default function useTimeInfo<DateType extends object = any>(
  generateConfig: Ref<GenerateConfig<DateType>>,
  props?: Ref<SharedTimeProps<DateType> | undefined> | ComputedRef<SharedTimeProps<DateType> | undefined>,
  date?: Ref<DateType>,
) {
  const mergedDate = computed(() => date?.value || generateConfig.value.getNow())

  // ======================== Warnings ========================
  if (process.env.NODE_ENV !== 'production') {
    const p = props?.value || {}
    const isHourStepValid = 24 % (p.hourStep ?? 1) === 0
    const isMinuteStepValid = 60 % (p.minuteStep ?? 1) === 0
    const isSecondStepValid = 60 % (p.secondStep ?? 1) === 0

    warning(
      isHourStepValid,
      `\`hourStep\` ${(p.hourStep ?? 1)} is invalid. It should be a factor of 24.`,
    )
    warning(
      isMinuteStepValid,
      `\`minuteStep\` ${(p.minuteStep ?? 1)} is invalid. It should be a factor of 60.`,
    )
    warning(
      isSecondStepValid,
      `\`secondStep\` ${(p.secondStep ?? 1)} is invalid. It should be a factor of 60.`,
    )
  }

  // ======================== Disabled ========================
  const getDisabledTimes = (targetDate: DateType) => {
    const p = props?.value || {}
    const disabledConfig = p.disabledTime?.(targetDate) || {}

    return [
      disabledConfig.disabledHours || p.disabledHours || emptyDisabled,
      disabledConfig.disabledMinutes || p.disabledMinutes || emptyDisabled,
      disabledConfig.disabledSeconds || p.disabledSeconds || emptyDisabled,
      disabledConfig.disabledMilliseconds || emptyDisabled,
    ] as const
  }

  // ========================= Column =========================
  const getAllUnits = (
    getDisabledHours: DisabledTimes['disabledHours'],
    getDisabledMinutes: DisabledTimes['disabledMinutes'],
    getDisabledSeconds: DisabledTimes['disabledSeconds'],
    getDisabledMilliseconds: DisabledTimes['disabledMilliseconds'],
  ) => {
    const p = props?.value || {}
    const hours = generateUnits(
      0,
      23,
      p.hourStep ?? 1,
      !!p.hideDisabledOptions,
      getDisabledHours?.(),
    )

    const rowHourUnits = p.use12Hours
      ? hours.map(unit => ({
          ...unit,
          label: leftPad((unit.value as number) % 12 || 12, 2),
        }))
      : hours

    const getMinuteUnits = (nextHour: number) =>
      generateUnits(
        0,
        59,
        p.minuteStep ?? 1,
        !!p.hideDisabledOptions,
        getDisabledMinutes?.(nextHour),
      )

    const getSecondUnits = (nextHour: number, nextMinute: number) =>
      generateUnits(
        0,
        59,
        p.secondStep ?? 1,
        !!p.hideDisabledOptions,
        getDisabledSeconds?.(nextHour, nextMinute),
      )

    const getMillisecondUnits = (
      nextHour: number,
      nextMinute: number,
      nextSecond: number,
    ) =>
      generateUnits(
        0,
        999,
        p.millisecondStep ?? 100,
        !!p.hideDisabledOptions,
        getDisabledMilliseconds?.(nextHour, nextMinute, nextSecond),
        3,
      )

    return [
      rowHourUnits,
      getMinuteUnits,
      getSecondUnits,
      getMillisecondUnits,
    ] as const
  }

  const defaultUnits = computed(() => {
    const [
      mergedDisabledHours,
      mergedDisabledMinutes,
      mergedDisabledSeconds,
      mergedDisabledMilliseconds,
    ] = getDisabledTimes(mergedDate.value)

    return getAllUnits(
      mergedDisabledHours,
      mergedDisabledMinutes,
      mergedDisabledSeconds,
      mergedDisabledMilliseconds,
    )
  })

  const rowHourUnits = computed(() => defaultUnits.value[0])
  const minuteUnitsGetter = (nextHour: number) => defaultUnits.value[1](nextHour)
  const secondUnitsGetter = (nextHour: number, nextMinute: number) =>
    defaultUnits.value[2](nextHour, nextMinute)
  const millisecondUnitsGetter = (
    nextHour: number,
    nextMinute: number,
    nextSecond: number,
  ) => defaultUnits.value[3](nextHour, nextMinute, nextSecond)

  // ======================== Validate ========================
  /**
   * Get validate time with `disabledTime`, `certainDate` to specific the date need to check
   */
  const getValidTime = (nextTime: DateType, certainDate?: DateType) => {
    let getCheckHourUnits = () => rowHourUnits.value
    let getCheckMinuteUnits = minuteUnitsGetter
    let getCheckSecondUnits = secondUnitsGetter
    let getCheckMillisecondUnits = millisecondUnitsGetter

    if (certainDate) {
      const [
        targetDisabledHours,
        targetDisabledMinutes,
        targetDisabledSeconds,
        targetDisabledMilliseconds,
      ] = getDisabledTimes(certainDate)

      const [
        targetRowHourUnits,
        targetGetMinuteUnits,
        targetGetSecondUnits,
        targetGetMillisecondUnits,
      ] = getAllUnits(
        targetDisabledHours,
        targetDisabledMinutes,
        targetDisabledSeconds,
        targetDisabledMilliseconds,
      )

      getCheckHourUnits = () => targetRowHourUnits
      getCheckMinuteUnits = targetGetMinuteUnits
      getCheckSecondUnits = targetGetSecondUnits
      getCheckMillisecondUnits = targetGetMillisecondUnits
    }

    const validateDate = findValidateTime(
      nextTime,
      getCheckHourUnits,
      getCheckMinuteUnits,
      getCheckSecondUnits,
      getCheckMillisecondUnits,
      generateConfig.value,
    )

    return validateDate
  }

  return [
    getValidTime,
    rowHourUnits,
    minuteUnitsGetter,
    secondUnitsGetter,
    millisecondUnitsGetter,
  ] as const
}

function findValidateTime<DateType extends object = any>(
  nextTime: DateType,
  getHourUnits: () => Unit<number>[],
  getMinuteUnits: (hour: number) => Unit<number>[],
  getSecondUnits: (hour: number, minute: number) => Unit<number>[],
  getMillisecondUnits: (hour: number, minute: number, second: number) => Unit<number>[],
  generateConfig: GenerateConfig<DateType>,
) {
  const curHour = generateConfig.getHour(nextTime)
  const hourUnits = getHourUnits()
  const validHour
    = hourUnits.find(u => u.value === curHour && !u.disabled)?.value
      ?? hourUnits.find(u => !u.disabled)?.value
      ?? curHour
  let ret = generateConfig.setHour(nextTime, validHour)

  const curMinute = generateConfig.getMinute(ret)
  const minuteUnits = getMinuteUnits(validHour)
  const validMinute
    = minuteUnits.find(u => u.value === curMinute && !u.disabled)?.value
      ?? minuteUnits.find(u => !u.disabled)?.value
      ?? curMinute
  ret = generateConfig.setMinute(ret, validMinute)

  const curSecond = generateConfig.getSecond(ret)
  const secondUnits = getSecondUnits(validHour, validMinute)
  const validSecond
    = secondUnits.find(u => u.value === curSecond && !u.disabled)?.value
      ?? secondUnits.find(u => !u.disabled)?.value
      ?? curSecond
  ret = generateConfig.setSecond(ret, validSecond)

  const curMs = generateConfig.getMillisecond(ret)
  const msUnits = getMillisecondUnits(validHour, validMinute, validSecond)
  const validMs
    = msUnits.find(u => u.value === curMs && !u.disabled)?.value
      ?? msUnits.find(u => !u.disabled)?.value
      ?? curMs
  ret = generateConfig.setMillisecond(ret, validMs)

  return ret
}
