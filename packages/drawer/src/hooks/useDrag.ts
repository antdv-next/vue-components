import type { CSSProperties, Ref } from 'vue'
import type { Placement } from '../Drawer'
import { clsx } from '@v-c/util'
import { computed, shallowRef, watch } from 'vue'

export interface UseDragOptions {
  prefixCls: Ref<string>
  direction: Ref<Placement>
  className: Ref<string | undefined>
  style: Ref<CSSProperties | undefined>
  maxSize: Ref<number | undefined>
  containerRef: Ref<HTMLElement | undefined>
  currentSize: Ref<number | string | undefined>
  onResize?: (size: number) => void
  onResizeEnd?: (size: number) => void
  onResizeStart?: (size: number) => void
}

export default function useDrag(options: UseDragOptions) {
  const {
    prefixCls,
    direction,
    className,
    style,
    maxSize,
    containerRef,
    currentSize,
    onResize,
    onResizeEnd,
    onResizeStart,
  } = options

  const isDragging = shallowRef(false)
  const startPos = shallowRef(0)
  const startSize = shallowRef(0)

  const isHorizontal = computed(() => direction.value === 'left' || direction.value === 'right')

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true

    if (isHorizontal.value) {
      startPos.value = e?.clientX
    }
    else {
      startPos.value = e?.clientY
    }

    // Use provided currentSize, or fallback to container size
    let _startSize: number
    if (typeof currentSize.value === 'number') {
      _startSize = currentSize.value
    }
    else if (containerRef.value) {
      const rect = containerRef.value?.getBoundingClientRect?.()
      _startSize = isHorizontal.value ? rect?.width : rect?.height
    }

    startSize.value = _startSize!

    onResizeStart?.(_startSize!)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) {
      return
    }

    const currentPos = isDragging.value ? e.clientX : e.clientY
    let delta = currentPos - startPos.value

    // Adjust delta direction based on placement
    if (direction.value === 'right' || direction.value === 'bottom') {
      delta = -delta
    }

    let newSize = startSize.value + delta
    // Apply min/max size limits
    if (newSize < 0) {
      newSize = 0
    }

    // Only apply maxSize if it's a valid positive number
    if (maxSize.value && newSize > maxSize.value) {
      newSize = maxSize.value
    }
    onResize?.(newSize)
  }

  const handleMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false
      // Get the final size after resize

      if (containerRef.value) {
        const rect = containerRef.value?.getBoundingClientRect?.()
        const finalSize = isHorizontal.value ? rect?.width : rect?.height
        onResizeEnd?.(finalSize!)
      }
    }
  }

  watch(
    [isDragging],
    (_n, _o, onCleanup) => {
      if (isDragging.value) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        onCleanup(() => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        })
      }
    },
    {
      flush: 'post',
    },
  )

  const dragElementClassName = computed(() => clsx(
    `${prefixCls.value}-dragger`,
    `${prefixCls.value}-dragger-${direction.value}`,
    {
      [`${prefixCls.value}-dragger-dragging`]: isDragging.value,
      [`${prefixCls.value}-dragger-horizontal`]: isHorizontal.value,
      [`${prefixCls.value}-dragger-vertical`]: !isHorizontal.value,
    },
    className.value,
  ))

  return {
    dragElementProps: computed(() => {
      return {
        class: dragElementClassName.value,
        style: style.value,
        onMousedown: handleMouseDown,
      }
    }),
    isDragging,
  }
}
