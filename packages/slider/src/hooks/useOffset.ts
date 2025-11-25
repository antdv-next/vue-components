import type { Ref } from 'vue'
import type { InternalMarkObj } from '../Marks'

/** Format the value in the range of [min, max] */
type FormatRangeValue = (value: number) => number

/** Format value align with step */
type FormatStepValue = (value: number) => number | null

/** Format value align with step & marks */
type FormatValue = (value: number) => number

type OffsetMode = 'unit' | 'dist'

type OffsetValue = (
  values: number[],
  offset: number | 'min' | 'max',
  valueIndex: number,
  mode?: OffsetMode,
) => number

export type OffsetValues = (
  values: number[],
  offset: number | 'min' | 'max',
  valueIndex: number,
  mode?: OffsetMode,
) => {
  value: number
  values: number[]
}

export default function useOffset(
  min: Ref<number>,
  max: Ref<number>,
  step: Ref<number | null>,
  markList: Ref<InternalMarkObj[]>,
  allowCross: Ref<boolean>,
  pushable: Ref<false | number | null>,
): [FormatValue, OffsetValues] {
  const formatRangeValue: FormatRangeValue = (val) => Math.max(min.value, Math.min(max.value, val))

  const formatStepValue: FormatStepValue = (val) => {
    if (step.value !== null) {
      const stepValue = min.value
        + Math.round((formatRangeValue(val) - min.value) / step.value!) * step.value!

      // Cut number in case to be like 0.30000000000000004
      const getDecimal = (num: number) => (String(num).split('.')[1] || '').length
      const maxDecimal = Math.max(
        getDecimal(step.value!),
        getDecimal(max.value),
        getDecimal(min.value),
      )
      const fixedValue = Number(stepValue.toFixed(maxDecimal))

      return min.value <= fixedValue && fixedValue <= max.value ? fixedValue : null
    }
    return null
  }

  const formatValue: FormatValue = (val) => {
    const formatNextValue = formatRangeValue(val)

    // List align values
    const alignValues = markList.value.map<number>(mark => mark && mark.value)
    if (step.value !== null) {
      const stepValue = formatStepValue(val)
      if (stepValue !== null) {
        alignValues.push(stepValue)
      }
    }

    // min & max
    alignValues.push(min.value, max.value)

    // Align with marks
    let closeValue = alignValues[0]
    let closeDist = max.value - min.value

    alignValues.forEach((alignValue) => {
      const dist = Math.abs(formatNextValue - alignValue)
      if (dist <= closeDist) {
        closeValue = alignValue
        closeDist = dist
      }
    })

    return closeValue
  }

  // ========================== Offset ==========================
  // Single Value
  const offsetValue: OffsetValue = (values, offset, valueIndex, mode = 'unit') => {
    if (typeof offset === 'number') {
      let nextValue: number
      const originValue = values[valueIndex]

      // Only used for `dist` mode
      const targetDistValue = originValue + offset

      // Compare next step value & mark value which is best match
      let potentialValues: number[] = []
      markList.value.forEach((mark) => {
        potentialValues.push(mark.value)
      })

      // Min & Max
      potentialValues.push(min.value, max.value)

      // In case origin value is align with mark but not with step
      const originStepValue = formatStepValue(originValue)
      if (originStepValue !== null) {
        potentialValues.push(originStepValue)
      }

      // Put offset step value also
      const sign = offset > 0 ? 1 : -1

      if (mode === 'unit') {
        if (step.value !== null) {
          const allStepValues = formatStepValue(originValue + sign * step.value!)
          if (allStepValues !== null) {
            potentialValues.push(allStepValues)
          }
        }
      }
      else if (step.value !== null) {
        const targetStepValue = formatStepValue(targetDistValue)
        if (targetStepValue !== null) {
          potentialValues.push(targetStepValue)
        }
      }

      // Find close one
      potentialValues = potentialValues
        .filter(val => val !== null)
        // Remove reverse value
        .filter(val => (offset < 0 ? val <= originValue : val >= originValue))

      if (mode === 'unit') {
        // `unit` mode can not contain itself
        potentialValues = potentialValues.filter(val => val !== originValue)
      }

      const compareValue = mode === 'unit' ? originValue : targetDistValue

      nextValue = potentialValues[0]
      let valueDist = Math.abs(nextValue - compareValue)

      potentialValues.forEach((potentialValue) => {
        const dist = Math.abs(potentialValue - compareValue)
        if (dist < valueDist) {
          nextValue = potentialValue
          valueDist = dist
        }
      })

      // Out of range will back to range
      if (nextValue === undefined) {
        return offset < 0 ? min.value : max.value
      }

      // `dist` mode
      if (mode === 'dist') {
        return nextValue
      }

      // `unit` mode may need another round
      if (Math.abs(offset) > 1) {
        const cloneValues = [...values]
        cloneValues[valueIndex] = nextValue

        return offsetValue(cloneValues, offset - sign, valueIndex, mode)
      }

      return nextValue
    }
    if (offset === 'min') {
      return min.value
    }
    if (offset === 'max') {
      return max.value
    }

    return values[valueIndex]
  }

  /** Same as `offsetValue` but return `changed` mark to tell value changed */
  const offsetChangedValue = (
    values: number[],
    offset: number,
    valueIndex: number,
    mode: OffsetMode = 'unit',
  ) => {
    const originValue = values[valueIndex]
    const nextValue = offsetValue(values, offset, valueIndex, mode)
    return {
      value: nextValue,
      changed: nextValue !== originValue,
    }
  }

  const needPush = (dist: number) => {
    return (pushable.value === null && dist === 0)
      || (typeof pushable.value === 'number' && dist < pushable.value)
  }

  // Values
  const offsetValues: OffsetValues = (values, offset, valueIndex, mode = 'unit') => {
    const nextValues = values.map<number>(formatValue)
    const originValue = nextValues[valueIndex]
    const nextValue = offsetValue(nextValues, offset, valueIndex, mode)
    nextValues[valueIndex] = nextValue

    if (!allowCross.value) {
      // >>>>> Allow Cross
      const pushNum = pushable.value || 0

      // ============ AllowCross ===============
      if (valueIndex > 0 && nextValues[valueIndex - 1] !== originValue) {
        nextValues[valueIndex] = Math.max(
          nextValues[valueIndex],
          nextValues[valueIndex - 1] + pushNum,
        )
      }

      if (valueIndex < nextValues.length - 1 && nextValues[valueIndex + 1] !== originValue) {
        nextValues[valueIndex] = Math.min(
          nextValues[valueIndex],
          nextValues[valueIndex + 1] - pushNum,
        )
      }
    }
    else if (typeof pushable.value === 'number' || pushable.value === null) {
      // >>>>> Pushable
      // =============== Push ==================

      // >>>>>> Basic push
      // End values
      for (let i = valueIndex + 1; i < nextValues.length; i += 1) {
        let changed = true
        while (needPush(nextValues[i] - nextValues[i - 1]) && changed) {
          ({ value: nextValues[i], changed } = offsetChangedValue(nextValues, 1, i))
        }
      }

      // Start values
      for (let i = valueIndex; i > 0; i -= 1) {
        let changed = true
        while (needPush(nextValues[i] - nextValues[i - 1]) && changed) {
          ({ value: nextValues[i - 1], changed } = offsetChangedValue(nextValues, -1, i - 1))
        }
      }

      // >>>>> Revert back to safe push range
      // End to Start
      for (let i = nextValues.length - 1; i > 0; i -= 1) {
        let changed = true
        while (needPush(nextValues[i] - nextValues[i - 1]) && changed) {
          ({ value: nextValues[i - 1], changed } = offsetChangedValue(nextValues, -1, i - 1))
        }
      }

      // Start to End
      for (let i = 0; i < nextValues.length - 1; i += 1) {
        let changed = true
        while (needPush(nextValues[i + 1] - nextValues[i]) && changed) {
          ({ value: nextValues[i + 1], changed } = offsetChangedValue(nextValues, 1, i + 1))
        }
      }
    }

    return {
      value: nextValues[valueIndex],
      values: nextValues,
    }
  }

  return [formatValue, offsetValues]
}
