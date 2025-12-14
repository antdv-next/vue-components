import type { Ref } from 'vue'
import type { DispatchZoomChangeFunc, TransformType, UpdateTransformFunc } from './useImageTransform.ts'
import { warning } from '@v-c/util'
import { shallowRef, watch } from 'vue'
import getFixScaleEleTransPosition from '../getFixScaleEleTransPosition.ts'
import { BASE_SCALE_RATIO, WHEEL_MAX_SCALE_RATIO } from '../previewConfig.ts'

export default function useMouseEvent(
  imgRef: Ref<HTMLImageElement>,
  movable: Ref<boolean>,
  open: Ref<boolean>,
  scaleStep: Ref<number>,
  transform: Ref<TransformType>,
  updateTransform: UpdateTransformFunc,
  dispatchZoomChange: DispatchZoomChangeFunc,
) {
  const isMoving = shallowRef(false)

  const startPositionInfo = shallowRef({
    diffX: 0,
    diffY: 0,
    transformX: 0,
    transformY: 0,
  })

  const onMouseDown = (event: MouseEvent) => {
    const { x, y } = transform.value
    // Only allow main button
    if (!movable.value || event.button !== 0)
      return
    event.preventDefault()
    event.stopPropagation()
    startPositionInfo.value = {
      diffX: event.pageX - x,
      diffY: event.pageY - y,
      transformX: x,
      transformY: y,
    }
    isMoving.value = true
  }

  const onMouseMove = (event: MouseEvent) => {
    if (open.value && isMoving.value) {
      updateTransform(
        {
          x: event.pageX - startPositionInfo.value.diffX,
          y: event.pageY - startPositionInfo.value.diffY,
        },
        'move',
      )
    }
  }

  const onMouseUp = () => {
    if (open.value && isMoving.value) {
      const { x, y, scale, rotate } = transform.value
      isMoving.value = false
      /** No need to restore the position when the picture is not moved, So as not to interfere with the click */
      const { transformX, transformY } = startPositionInfo.value
      const hasChangedPosition = x !== transformX && y !== transformY
      if (!hasChangedPosition)
        return

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
  }

  const onWheel = (event: WheelEvent) => {
    if (!open.value || event.deltaX === 0) {
      return
    }
    // Scale ratio depends on the deltaY size
    const scaleRatio = Math.abs(event.deltaY / 100)
    // Limit the maximum scale ratio
    const mergedScaleRatio = Math.min(scaleRatio, WHEEL_MAX_SCALE_RATIO)
    // Scale the ratio each time
    let ratio = BASE_SCALE_RATIO + mergedScaleRatio * scaleStep.value
    if (event.deltaY > 0) {
      ratio = BASE_SCALE_RATIO / ratio
    }
    dispatchZoomChange(ratio, 'wheel', event.clientX, event.clientY)
  }

  watch([open, isMoving, transform, movable], (_n, _o, onCleanup) => {
    if (movable.value) {
      window.addEventListener('mouseup', onMouseUp, false)
      window.addEventListener('mousemove', onMouseMove, false)
      try {
        // Resolve if in iframe lost event
        /* istanbul ignore next */
        if (window.top !== window.self) {
          window?.top?.addEventListener('mouseup', onMouseUp, false)
          window?.top?.addEventListener('mousemove', onMouseMove, false)
        }
      }
      catch (e) {
        warning(false, `[vc-image] ${e}`)
      }
    }
    onCleanup(() => {
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)

      /* istanbul ignore next */
      try {
        window.top?.removeEventListener('mouseup', onMouseUp)
        window.top?.removeEventListener('mousemove', onMouseMove)
      }
      catch (error) {
        // Do nothing
      }
    })
  })

  return {
    isMoving,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
  }
}
