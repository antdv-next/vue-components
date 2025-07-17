import type { Ref } from 'vue'
import type { Color } from '../color'
import type { TransformOffset } from '../interface'
import { onWatcherCleanup, ref, shallowRef, watch } from 'vue'

type EventType =
  | MouseEvent
  | TouchEvent

type EventHandle = (e: EventType) => void

interface useColorDragProps {
  color: Color
  containerRef: Ref<HTMLDivElement>
  targetRef: Ref<{ transformDomRef: HTMLDivElement }>
  direction?: 'x' | 'y'
  onDragChange?: (offset: TransformOffset) => void
  onDragChangeComplete?: () => void
  calculate?: () => TransformOffset
  /** Disabled drag */
  disabledDrag?: boolean
}

function getPosition(e: EventType) {
  const obj = 'touches' in e ? e.touches[0] : e
  const scrollXOffset = document.documentElement.scrollLeft
    || document.body.scrollLeft
    || window.pageXOffset
  const scrollYOffset = document.documentElement.scrollTop
    || document.body.scrollTop
    || window.pageYOffset
  return { pageX: obj.pageX - scrollXOffset, pageY: obj.pageY - scrollYOffset }
}

function useColorDrag(
  props: useColorDragProps,
): [Ref<TransformOffset>, EventHandle] {
  const {
    targetRef,
    containerRef,
    direction,
    onDragChange,
    onDragChangeComplete,
    calculate,
    disabledDrag,
  } = props

  const offsetValue = ref({ x: 0, y: 0 })
  const mouseMoveRef = shallowRef<EventHandle>(() => {})
  const mouseUpRef = shallowRef<EventHandle>(() => {})

  const removeEventListener = () => {
    document.removeEventListener('mousemove', mouseMoveRef.value)
    document.removeEventListener('mouseup', mouseUpRef.value)
    document.removeEventListener('touchmove', mouseMoveRef.value)
    document.removeEventListener('touchend', mouseUpRef.value)
    mouseMoveRef.value = () => {}
    mouseUpRef.value = () => {}
  }
  // Always get position from `color`
  watch(() => props.color, () => {
    offsetValue.value = calculate!()
    onWatcherCleanup(() => removeEventListener())
  }, {
    immediate: true,
  })

  const updateOffset: EventHandle = (e) => {
    if (!containerRef.value || !targetRef.value) {
      return false
    }
    const { pageX, pageY } = getPosition(e)
    const {
      x: rectX,
      y: rectY,
      width,
      height,
    } = containerRef.value.getBoundingClientRect()
    const { width: targetWidth, height: targetHeight }
      = targetRef.value.transformDomRef.getBoundingClientRect()

    // const centerOffsetX = targetWidth / 2
    // const centerOffsetY = targetHeight / 2

    const percentX = ((pageX - rectX) / width) * 100
    const percentY = ((pageY - rectY) / height) * 100

    // const offsetX = Math.max(0, Math.min(pageX - rectX, width)) - centerOffsetX
    // const offsetY = Math.max(0, Math.min(pageY - rectY, height)) - centerOffsetY

    const offsetX = Math.max(0, Math.min(percentX, 100))
    const offsetY = Math.max(0, Math.min(percentY, 100))

    const calcOffset = {
      x: offsetX,
      y: direction === 'x' ? offsetValue.value.y : offsetY,
    }

    // Exclusion of boundary cases
    if (
      (targetWidth === 0 && targetHeight === 0)
      || targetWidth !== targetHeight
    ) {
      return false
    }

    offsetValue.value = calcOffset
    onDragChange?.(calcOffset)
  }

  const onDragMove: EventHandle = (e) => {
    e.preventDefault()
    updateOffset(e)
  }

  const onDragStop: EventHandle = (e) => {
    e.preventDefault()
    removeEventListener()
    onDragChangeComplete?.()
  }

  const onDragStart: EventHandle = (e) => {
    // https://github.com/ant-design/ant-design/issues/43529
    // document.removeEventListener('mousemove', mouseMoveRef.value)
    // document.removeEventListener('mouseup', mouseUpRef.value)

    removeEventListener()

    if (disabledDrag) {
      return
    }
    updateOffset(e)
    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragStop)
    document.addEventListener('touchmove', onDragMove)
    document.addEventListener('touchend', onDragStop)
    mouseMoveRef.value = onDragMove
    mouseUpRef.value = onDragStop
  }

  return [offsetValue, onDragStart]
}

export default useColorDrag
