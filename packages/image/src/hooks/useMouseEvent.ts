import type { Ref } from 'vue'
import type {
  DispatchZoomChangeFunc,
  TransformType,
  UpdateTransformFunc,
} from './useImageTransform'
import { warning } from '@v-c/util/dist/warning'
import { ref, watchEffect } from 'vue'
import getFixScaleEleTransPosition from '../getFixScaleEleTransPosition'
import { BASE_SCALE_RATIO, WHEEL_MAX_SCALE_RATIO } from '../previewConfig'

export default function useMouseEvent(
  imgRef: Ref<{ imgEl: HTMLImageElement }>,
  movable: boolean,
  open: boolean,
  scaleStep: number,
  transform: TransformType,
  updateTransform: UpdateTransformFunc,
  dispatchZoomChange: DispatchZoomChangeFunc,
) {
  const { rotate, scale, x, y } = transform

  const isMoving = ref(false)
  const startPositionInfo = ref({
    diffX: 0,
    diffY: 0,
    transformX: 0,
    transformY: 0,
  })

  const onMouseDown = (event: MouseEvent) => {
    // Only allow main button
    if (!movable || event.button !== 0)
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
    if (open && isMoving.value) {
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
    if (open && isMoving.value) {
      isMoving.value = false

      /** No need to restore the position when the picture is not moved, So as not to interfere with the click */
      const { transformX, transformY } = startPositionInfo.value
      const hasChangedPosition = x !== transformX && y !== transformY
      if (!hasChangedPosition)
        return

      const width = imgRef.value.imgEl.offsetWidth * scale
      const height = imgRef.value.imgEl.offsetHeight * scale
      const { left, top } = imgRef.value.imgEl.getBoundingClientRect()
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
    if (!open || event.deltaY === 0)
      return
    // Scale ratio depends on the deltaY size
    const scaleRatio = Math.abs(event.deltaY / 100)
    // Limit the maximum scale ratio
    const mergedScaleRatio = Math.min(scaleRatio, WHEEL_MAX_SCALE_RATIO)
    // Scale the ratio each time
    let ratio = BASE_SCALE_RATIO + mergedScaleRatio * scaleStep
    if (event.deltaY > 0) {
      ratio = BASE_SCALE_RATIO / ratio
    }
    dispatchZoomChange(ratio, 'wheel', event.clientX, event.clientY)
  }

  watchEffect((onCleanup) => {
    if (movable) {
      window.addEventListener('mouseup', onMouseUp, false)
      window.addEventListener('mousemove', onMouseMove, false)

      try {
        // Resolve if in iframe lost event
        /* istanbul ignore next */
        if (window.top && window.top !== window.self) {
          window.top.addEventListener('mouseup', onMouseUp, false)
          window.top.addEventListener('mousemove', onMouseMove, false)
        }
      }
      catch (error) {
        /* istanbul ignore next */
        warning(false, `[vc-image] ${error}`)
      }
    }

    onCleanup(() => {
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      // /* istanbul ignore next */
      window.top?.removeEventListener('mouseup', onMouseUp)
      // /* istanbul ignore next */
      window.top?.removeEventListener('mousemove', onMouseMove)
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
