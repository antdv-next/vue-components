import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'

function smoothScrollOffset(offset: number) {
  return Math.floor(offset ** 0.5)
}

export function getPageXY(
  e: MouseEvent | TouchEvent,
  horizontal: boolean,
): number {
  const obj = 'touches' in e ? e.touches[0] : e
  return obj[horizontal ? 'pageX' : 'pageY'] - window[horizontal ? 'scrollX' : 'scrollY']
}

export default function useScrollDrag(
  inVirtual: Ref<boolean>,
  componentRef: Ref<HTMLElement | null | undefined>,
  onScrollOffset: (offset: number) => void,
) {
  let cachedElement: HTMLElement | null = null
  let cachedDocument: Document | null = null
  let mouseDownLock = false
  let rafId: number | null = null
  let offset = 0

  const stopScroll = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const continueScroll = () => {
    stopScroll()

    rafId = requestAnimationFrame(() => {
      onScrollOffset(offset)
      continueScroll()
    })
  }

  const clearDragState = () => {
    mouseDownLock = false
    stopScroll()
  }

  const onMouseDown = (e: MouseEvent) => {
    // Skip if element set draggable
    if ((e.target as HTMLElement).draggable || e.button !== 0) {
      return
    }
    // Skip if nest List has handled this event
    const event = e as MouseEvent & {
      _virtualHandled?: boolean
    }
    if (!event._virtualHandled) {
      event._virtualHandled = true
      mouseDownLock = true
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (mouseDownLock && cachedElement) {
      const mouseY = getPageXY(e, false)
      const { top, bottom } = cachedElement.getBoundingClientRect()

      if (mouseY <= top) {
        const diff = top - mouseY
        offset = -smoothScrollOffset(diff)
        continueScroll()
      }
      else if (mouseY >= bottom) {
        const diff = mouseY - bottom
        offset = smoothScrollOffset(diff)
        continueScroll()
      }
      else {
        stopScroll()
      }
    }
  }

  const teardown = () => {
    if (cachedElement) {
      cachedElement.removeEventListener('mousedown', onMouseDown)
      cachedElement = null
    }

    if (cachedDocument) {
      cachedDocument.removeEventListener('mouseup', clearDragState)
      cachedDocument.removeEventListener('mousemove', onMouseMove)
      cachedDocument.removeEventListener('dragend', clearDragState)
      cachedDocument = null
    }

    clearDragState()
  }

  onUnmounted(teardown)

  watch(
    [inVirtual, componentRef],
    ([enabled, ele], _prev, onCleanup) => {
      if (enabled && ele) {
        cachedElement = ele
        cachedDocument = ele.ownerDocument

        cachedElement.addEventListener('mousedown', onMouseDown)
        cachedDocument.addEventListener('mouseup', clearDragState)
        cachedDocument.addEventListener('mousemove', onMouseMove)
        cachedDocument.addEventListener('dragend', clearDragState)

        onCleanup(() => {
          teardown()
        })
      }
      else {
        teardown()
      }
    },
    { immediate: true },
  )
}
