import type { Ref } from 'vue'
import { onUnmounted, ref, watch } from 'vue'

const SMOOTH_PTG = 14 / 15

export default function useMobileTouchMove(
  inVirtual: Ref<boolean>,
  listRef: Ref<HTMLDivElement | null | undefined>,
  callback: (
    isHorizontal: boolean,
    offset: number,
    smoothOffset: boolean,
    e?: TouchEvent,
  ) => boolean,
) {
  const touchedRef = ref(false)
  const touchXRef = ref(0)
  const touchYRef = ref(0)

  let elementRef: HTMLElement | null = null
  let touchStartElement: HTMLDivElement | null = null

  // Smooth scroll
  let intervalId: ReturnType<typeof setInterval> | null = null

  let cleanUpEvents: () => void

  const onTouchMove = (e: TouchEvent) => {
    if (touchedRef.value) {
      const currentX = Math.ceil(e.touches[0].pageX)
      const currentY = Math.ceil(e.touches[0].pageY)
      let offsetX = touchXRef.value - currentX
      let offsetY = touchYRef.value - currentY
      const isHorizontal = Math.abs(offsetX) > Math.abs(offsetY)
      if (isHorizontal) {
        touchXRef.value = currentX
      }
      else {
        touchYRef.value = currentY
      }

      const scrollHandled = callback(isHorizontal, isHorizontal ? offsetX : offsetY, false, e)
      if (scrollHandled) {
        e.preventDefault()
      }

      // Smooth interval
      if (intervalId)
        clearInterval(intervalId)

      if (scrollHandled) {
        intervalId = setInterval(() => {
          if (isHorizontal) {
            offsetX *= SMOOTH_PTG
          }
          else {
            offsetY *= SMOOTH_PTG
          }
          const offset = Math.floor(isHorizontal ? offsetX : offsetY)
          if (!callback(isHorizontal, offset, true) || Math.abs(offset) <= 0.1) {
            if (intervalId)
              clearInterval(intervalId)
          }
        }, 16)
      }
    }
  }

  const onTouchEnd = () => {
    touchedRef.value = false

    cleanUpEvents()
  }

  const onTouchStart = (e: TouchEvent) => {
    cleanUpEvents()

    if (e.touches.length === 1 && !touchedRef.value) {
      touchedRef.value = true
      touchXRef.value = Math.ceil(e.touches[0].pageX)
      touchYRef.value = Math.ceil(e.touches[0].pageY)

      elementRef = e.target as HTMLElement
      elementRef.addEventListener('touchmove', onTouchMove, { passive: false })
      elementRef.addEventListener('touchend', onTouchEnd, { passive: true } as any)
    }
  }

  cleanUpEvents = () => {
    if (elementRef) {
      elementRef.removeEventListener('touchmove', onTouchMove)
      elementRef.removeEventListener('touchend', onTouchEnd)
      elementRef = null
    }
  }

  const removeTouchStartListener = () => {
    if (touchStartElement) {
      touchStartElement.removeEventListener('touchstart', onTouchStart)
      touchStartElement = null
    }
  }

  const teardown = () => {
    removeTouchStartListener()
    cleanUpEvents()
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onUnmounted(teardown)

  watch(
    [inVirtual, listRef],
    ([enabled, ele], _prev, onCleanup) => {
      if (enabled && ele) {
        touchStartElement = ele
        ele.addEventListener('touchstart', onTouchStart, { passive: true } as any)

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
