import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { Direction, OnStartMove } from '../interface'
import type { OffsetValues } from './useOffset'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import { computed, inject, onUnmounted, ref, watch } from 'vue'
import { defaultUnstableContextValue, UnstableContextKey } from '../context'

/** Drag to delete offset. It's a user experience number for dragging out */
const REMOVE_DIST = 130

function getPosition(e: MouseEvent | TouchEvent) {
  const obj = 'targetTouches' in e ? e.targetTouches[0] : e

  return { pageX: obj.pageX, pageY: obj.pageY }
}

function useDrag(
  containerRef: Ref<HTMLDivElement>,
  direction: ShallowRef<Direction> | ComputedRef<Direction>,
  rawValues: Ref<number[]>,
  min: ShallowRef<number> | ComputedRef<number>,
  max: ShallowRef<number> | ComputedRef<number>,
  formatValue: Ref<(value: number) => number> | ComputedRef<(value: number) => number>,
  triggerChange: (values: number[]) => void,
  finishChange: (draggingDelete: boolean) => void,
  offsetValues: Ref<OffsetValues> | ComputedRef<OffsetValues>,
  editable: ShallowRef<boolean> | ComputedRef<boolean>,
  minCount: ShallowRef<number> | ComputedRef<number>,
): [
    draggingIndex: Ref<number>,
    draggingValue: Ref<number>,
    draggingDelete: Ref<boolean>,
    returnValues: Ref<number[]>,
    onStartMove: OnStartMove,
] {
  const draggingValue = ref<number | null>(null)
  const draggingIndex = ref<number>(-1)
  const draggingDelete = ref<boolean>(false)
  const cacheValues = ref<number[]>(rawValues.value)
  const originValues = ref<number[]>(rawValues.value)

  const mouseMoveEventRef = ref<((event: MouseEvent | TouchEvent) => void) | null>(null)
  const mouseUpEventRef = ref<((event: MouseEvent | TouchEvent) => void) | null>(null)
  const touchEventTargetRef = ref<EventTarget | null>(null)

  const unstableContext = inject(UnstableContextKey, defaultUnstableContextValue)
  const { onDragStart, onDragChange } = unstableContext

  watch(
    rawValues,
    (val) => {
      if (draggingIndex.value === -1) {
        cacheValues.value = [...val]
        originValues.value = [...val]
      }
    },
    { immediate: true },
  )

  // Clean up event
  onUnmounted(() => {
    document.removeEventListener('mousemove', mouseMoveEventRef.value!)
    document.removeEventListener('mouseup', mouseUpEventRef.value!)
    if (touchEventTargetRef.value) {
      touchEventTargetRef.value.removeEventListener('touchmove', mouseMoveEventRef.value as any)
      touchEventTargetRef.value.removeEventListener('touchend', mouseUpEventRef.value as any)
    }
  })

  const flushValues = (nextValues: number[], nextValue?: number, deleteMark?: boolean) => {
    // Perf: Only update state when value changed
    if (nextValue !== undefined) {
      draggingValue.value = nextValue
    }
    cacheValues.value = nextValues

    let changeValues = nextValues
    if (deleteMark) {
      changeValues = nextValues.filter((_, i) => i !== draggingIndex.value)
    }
    triggerChange(changeValues)

    if (onDragChange) {
      onDragChange({
        rawValues: nextValues,
        deleteIndex: deleteMark ? draggingIndex.value : -1,
        draggingIndex: draggingIndex.value,
        draggingValue: nextValue!,
      })
    }
  }

  const updateCacheValue = useEvent(
    (valueIndex: number, offsetPercent: number, deleteMark: boolean) => {
      if (valueIndex === -1) {
        // >>>> Dragging on the track
        const startValue = originValues.value[0]
        const endValue = originValues.value[originValues.value.length - 1]
        const maxStartOffset = min.value - startValue
        const maxEndOffset = max.value - endValue

        // Get valid offset
        let offset = offsetPercent * (max.value - min.value)
        offset = Math.max(offset, maxStartOffset)
        offset = Math.min(offset, maxEndOffset)

        // Use first value to revert back of valid offset (like steps marks)
        const formatStartValue = formatValue.value(startValue + offset)
        offset = formatStartValue - startValue
        const cloneCacheValues = originValues.value.map<number>(val => val + offset)
        flushValues(cloneCacheValues)
      }
      else {
        // >>>> Dragging on the handle
        const offsetDist = (max.value - min.value) * offsetPercent

        // Always start with the valueIndex origin value
        const cloneValues = [...cacheValues.value]
        cloneValues[valueIndex] = originValues.value[valueIndex]

        const next = offsetValues.value(cloneValues, offsetDist, valueIndex, 'dist')

        flushValues(next.values, next.value, deleteMark)
      }
    },
  )

  const onStartMove: OnStartMove = (e, valueIndex, startValues?: number[]) => {
    e.stopPropagation()
    // 如果是点击 track 触发的，需要传入变化后的初始值，而不能直接用 rawValues
    const initialValues = startValues || rawValues.value
    const originValue = initialValues[valueIndex]

    draggingIndex.value = valueIndex
    draggingValue.value = originValue
    originValues.value = initialValues
    cacheValues.value = initialValues
    draggingDelete.value = false

    const { pageX: startX, pageY: startY } = getPosition(e)

    // We declare it here since closure can't get outer latest value
    let deleteMark = false

    // Internal trigger event
    if (onDragStart) {
      onDragStart({
        rawValues: initialValues,
        draggingIndex: valueIndex,
        draggingValue: originValue,
      })
    }

    // Moving
    const onMouseMove = (event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      const { pageX: moveX, pageY: moveY } = getPosition(event)
      const offsetX = moveX - startX
      const offsetY = moveY - startY

      const { width, height } = containerRef.value.getBoundingClientRect()

      let offSetPercent: number
      let removeDist: number

      switch (direction.value) {
        case 'btt':
          offSetPercent = -offsetY / height
          removeDist = offsetX
          break

        case 'ttb':
          offSetPercent = offsetY / height
          removeDist = offsetX
          break

        case 'rtl':
          offSetPercent = -offsetX / width
          removeDist = offsetY
          break

        default:
          offSetPercent = offsetX / width
          removeDist = offsetY
      }

      // Check if need mark remove
      deleteMark = editable.value
        ? Math.abs(removeDist) > REMOVE_DIST && minCount.value < cacheValues.value.length
        : false
      draggingDelete.value = deleteMark

      updateCacheValue(valueIndex, offSetPercent, deleteMark)
    }

    // End
    const onMouseUp = (event: MouseEvent | TouchEvent) => {
      event.preventDefault()

      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)
      if (touchEventTargetRef.value) {
        touchEventTargetRef.value.removeEventListener('touchmove', mouseMoveEventRef.value as any)
        touchEventTargetRef.value.removeEventListener('touchend', mouseUpEventRef.value as any)
      }
      mouseMoveEventRef.value = null
      mouseUpEventRef.value = null
      touchEventTargetRef.value = null

      finishChange(deleteMark)

      draggingIndex.value = -1
      draggingDelete.value = false
    }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)
    ;(e as any).currentTarget.addEventListener('touchend', onMouseUp)
    ;(e as any).currentTarget.addEventListener('touchmove', onMouseMove)
    mouseMoveEventRef.value = onMouseMove
    mouseUpEventRef.value = onMouseUp
    touchEventTargetRef.value = e.currentTarget
  }

  // Only return cache value when it mapping with rawValues
  const returnValues = computed(() => {
    const sourceValues = [...rawValues.value].sort((a, b) => a - b)
    const targetValues = [...cacheValues.value].sort((a, b) => a - b)

    const counts: Record<number, number> = {}
    targetValues.forEach((val) => {
      counts[val] = (counts[val] || 0) + 1
    })
    sourceValues.forEach((val) => {
      counts[val] = (counts[val] || 0) - 1
    })

    const maxDiffCount = editable.value ? 1 : 0
    const diffCount: number = Object.values(counts).reduce(
      (prev, next) => prev + Math.abs(next),
      0,
    )

    return diffCount <= maxDiffCount ? cacheValues.value : rawValues.value
  })

  return [draggingIndex, draggingValue as any, draggingDelete, returnValues, onStartMove] as const
}

export default useDrag
