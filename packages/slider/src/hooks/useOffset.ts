import type { Ref } from 'vue'
import type { InternalMarkObj } from '../Marks'
import type { IsHandleDisabled } from './useDisabled'

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

/**
 * Get the effective moving range for a handle, treating disabled handles as
 * fixed anchors and applying `pushable` as the gap that enabled handles must
 * keep away from those anchors. Mirrors rc-slider#1069.
 */
export function getDisabledBoundaryValues(
  values: number[],
  valueIndex: number,
  min: number,
  max: number,
  pushable: false | number | null,
  isHandleDisabled: IsHandleDisabled,
): [number, number] {
  const pushGap = typeof pushable === 'number' ? pushable : 0
  let minBound = min
  let maxBound = max

  for (let i = valueIndex - 1; i >= 0; i -= 1) {
    if (isHandleDisabled(i)) {
      minBound = values[i] + pushGap
      break
    }
  }

  for (let i = valueIndex + 1; i < values.length; i += 1) {
    if (isHandleDisabled(i)) {
      maxBound = values[i] - pushGap
      break
    }
  }

  return [minBound, maxBound]
}

/**
 * Find the nearest enabled handle that can accept the target value. A handle
 * is only considered when the target value falls inside its disabled-anchor
 * boundaries, so clicking outside an enabled segment becomes a no-op.
 */
export function getClosestEnabledHandleIndex(
  values: number[],
  targetValue: number,
  min: number,
  max: number,
  pushable: false | number | null,
  isHandleDisabled: IsHandleDisabled,
): number {
  let closestIndex = -1
  let closestDist = max - min

  values.forEach((value, index) => {
    if (isHandleDisabled(index))
      return

    const [minBound, maxBound] = getDisabledBoundaryValues(
      values,
      index,
      min,
      max,
      pushable,
      isHandleDisabled,
    )

    if (minBound <= targetValue && targetValue <= maxBound) {
      const dist = Math.abs(targetValue - value)
      if (dist <= closestDist) {
        closestDist = dist
        closestIndex = index
      }
    }
  })

  return closestIndex
}

export default function useOffset(
  min: Ref<number>,
  max: Ref<number>,
  step: Ref<number | null>,
  markList: Ref<InternalMarkObj[]>,
  allowCross: Ref<boolean>,
  pushable: Ref<false | number | null>,
  isHandleDisabled: IsHandleDisabled,
): [FormatValue, OffsetValues] {
  const formatRangeValue: FormatRangeValue = val => Math.max(min.value, Math.min(max.value, val))

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

    // rc-slider#1069: disabled handles act as fixed anchors; enabled handles
    // cannot cross them and must keep `pushable` gap away.
    const [minBound, maxBound] = getDisabledBoundaryValues(
      nextValues,
      valueIndex,
      min.value,
      max.value,
      pushable.value,
      isHandleDisabled,
    )

    const nextValue = offsetValue(nextValues, offset, valueIndex, mode)
    nextValues[valueIndex] = nextValue

    if (minBound <= maxBound)
      nextValues[valueIndex] = Math.max(minBound, Math.min(maxBound, nextValues[valueIndex]))
    else
      nextValues[valueIndex] = originValue

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
      // End values — stop pushing once we hit a disabled anchor; the anchor
      // cannot move, and handles past it stay where they are.
      for (let i = valueIndex + 1; i < nextValues.length; i += 1) {
        if (isHandleDisabled(i))
          break
        let changed = true
        while (needPush(nextValues[i] - nextValues[i - 1]) && changed) {
          ({ value: nextValues[i], changed } = offsetChangedValue(nextValues, 1, i))
        }
        const [, itemMaxBound] = getDisabledBoundaryValues(
          nextValues,
          i,
          min.value,
          max.value,
          pushable.value,
          isHandleDisabled,
        )
        nextValues[i] = Math.min(nextValues[i], itemMaxBound)
      }

      // Start values
      for (let i = valueIndex; i > 0; i -= 1) {
        if (isHandleDisabled(i - 1))
          break
        let changed = true
        while (needPush(nextValues[i] - nextValues[i - 1]) && changed) {
          ({ value: nextValues[i - 1], changed } = offsetChangedValue(nextValues, -1, i - 1))
        }
        const [itemMinBound] = getDisabledBoundaryValues(
          nextValues,
          i - 1,
          min.value,
          max.value,
          pushable.value,
          isHandleDisabled,
        )
        nextValues[i - 1] = Math.max(nextValues[i - 1], itemMinBound)
      }

      // >>>>> Revert back to safe push range
      // End to Start
      for (let i = nextValues.length - 1; i > 0; i -= 1) {
        if (isHandleDisabled(i) || isHandleDisabled(i - 1))
          continue
        let changed = true
        while (needPush(nextValues[i] - nextValues[i - 1]) && changed) {
          ({ value: nextValues[i - 1], changed } = offsetChangedValue(nextValues, -1, i - 1))
        }
        const [itemMinBound] = getDisabledBoundaryValues(
          nextValues,
          i - 1,
          min.value,
          max.value,
          pushable.value,
          isHandleDisabled,
        )
        nextValues[i - 1] = Math.max(nextValues[i - 1], itemMinBound)
      }

      // Start to End
      for (let i = 0; i < nextValues.length - 1; i += 1) {
        if (isHandleDisabled(i) || isHandleDisabled(i + 1))
          continue
        let changed = true
        while (needPush(nextValues[i + 1] - nextValues[i]) && changed) {
          ({ value: nextValues[i + 1], changed } = offsetChangedValue(nextValues, 1, i + 1))
        }
        const [, itemMaxBound] = getDisabledBoundaryValues(
          nextValues,
          i + 1,
          min.value,
          max.value,
          pushable.value,
          isHandleDisabled,
        )
        nextValues[i + 1] = Math.min(nextValues[i + 1], itemMaxBound)
      }
    }

    return {
      value: nextValues[valueIndex],
      values: nextValues,
    }
  }

  return [formatValue, offsetValues]
}
