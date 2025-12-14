import type { Ref } from 'vue'
import type { DispatchZoomChangeFunc, TransformType, UpdateTransformFunc } from './useImageTransform.ts'
import { shallowRef, watchEffect } from 'vue'
import getFixScaleEleTransPosition from '../getFixScaleEleTransPosition.ts'

interface Point {
  x: number
  y: number
}

interface TouchPointInfoType {
  point1: Point
  point2: Point
  eventType: string
}

function getDistance(a: Point, b: Point) {
  const x = a.x - b.x
  const y = a.y - b.y
  return Math.hypot(x, y)
}

function getCenter(oldPoint1: Point, oldPoint2: Point, newPoint1: Point, newPoint2: Point) {
  // Calculate the distance each point has moved
  const distance1 = getDistance(oldPoint1, newPoint1)
  const distance2 = getDistance(oldPoint2, newPoint2)

  // If both distances are 0, return the original points
  if (distance1 === 0 && distance2 === 0) {
    return [oldPoint1.x, oldPoint1.y]
  }

  // Calculate the ratio of the distances
  const ratio = distance1 / (distance1 + distance2)

  // Calculate the new center point based on the ratio
  const x = oldPoint1.x + ratio * (oldPoint2.x - oldPoint1.x)
  const y = oldPoint1.y + ratio * (oldPoint2.y - oldPoint1.y)

  return [x, y]
}

export default function useTouchEvent(
  imgRef: Ref<HTMLImageElement>,
  movable: Ref<boolean>,
  open: Ref<boolean>,
  minScale: Ref<number>,
  transform: Ref<TransformType>,
  updateTransform: UpdateTransformFunc,
  dispatchZoomChange: DispatchZoomChangeFunc,
) {
  const isTouching = shallowRef(false)
  const touchPointInfo = shallowRef<TouchPointInfoType>({
    point1: { x: 0, y: 0 },
    point2: { x: 0, y: 0 },
    eventType: 'none',
  })

  const updateTouchPointInfo = (values: Partial<TouchPointInfoType>) => {
    touchPointInfo.value = {
      ...touchPointInfo.value,
      ...values,
    }
  }

  const onTouchStart = (event: TouchEvent) => {
    if (!movable.value) {
      return
    }
    event.stopPropagation()
    isTouching.value = true

    const { touches = [] as any } = event as any
    const { x, y } = transform.value

    if (touches.length > 1) {
      // touch zoom
      updateTouchPointInfo({
        point1: { x: touches[0].clientX, y: touches[0].clientY },
        point2: { x: touches[1].clientX, y: touches[1].clientY },
        eventType: 'touchZoom',
      })
    }
    else {
      // touch move
      updateTouchPointInfo({
        point1: {
          x: touches[0].clientX - x,
          y: touches[0].clientY - y,
        },
        eventType: 'move',
      })
    }
  }

  const onTouchMove = (event: TouchEvent) => {
    const { touches = [] as any } = event as any
    const { point1, point2, eventType } = touchPointInfo.value

    if (touches.length > 1 && eventType === 'touchZoom') {
      // touch zoom
      const newPoint1 = {
        x: touches[0].clientX,
        y: touches[0].clientY,
      }
      const newPoint2 = {
        x: touches[1].clientX,
        y: touches[1].clientY,
      }
      const [centerX, centerY] = getCenter(point1, point2, newPoint1, newPoint2)
      const ratio = getDistance(newPoint1, newPoint2) / getDistance(point1, point2)

      dispatchZoomChange(ratio, 'touchZoom', centerX, centerY, true)
      updateTouchPointInfo({
        point1: newPoint1,
        point2: newPoint2,
        eventType: 'touchZoom',
      })
    }
    else if (eventType === 'move') {
      // touch move
      updateTransform(
        {
          x: touches[0].clientX - point1.x,
          y: touches[0].clientY - point1.y,
        },
        'move',
      )
      updateTouchPointInfo({ eventType: 'move' })
    }
  }

  const onTouchEnd = () => {
    if (!open.value || !imgRef.value) {
      return
    }

    if (isTouching.value) {
      isTouching.value = false
    }

    updateTouchPointInfo({ eventType: 'none' })

    const { rotate, scale } = transform.value

    if (minScale.value > scale) {
      /** When the scaling ratio is less than the minimum scaling ratio, reset the scaling ratio */
      return updateTransform({ x: 0, y: 0, scale: minScale.value }, 'touchZoom')
    }

    const width = imgRef.value.offsetWidth * scale
    const height = imgRef.value.offsetHeight * scale
    const { left, top } = imgRef.value.getBoundingClientRect() ?? {}
    const isRotate = rotate % 180 !== 0

    const fixState = getFixScaleEleTransPosition(
      isRotate ? height : width,
      isRotate ? width : height,
      left,
      top,
    )

    if (fixState) {
      updateTransform({ ...fixState }, 'dragRebound')
    }
  }

  watchEffect((onCleanup) => {
    const preventDefault = (e: TouchEvent) => {
      e.preventDefault()
    }

    if (open.value && movable.value) {
      window.addEventListener('touchmove', preventDefault, {
        passive: false,
      })
    }

    onCleanup(() => {
      window.removeEventListener('touchmove', preventDefault)
    })
  })

  return {
    isTouching,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
