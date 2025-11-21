import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'

type TouchEventHandler = (e: TouchEvent) => void
type WheelEventHandler = (e: WheelEvent) => void

const MIN_SWIPE_DISTANCE = 0.1
const STOP_SWIPE_DISTANCE = 0.01
const REFRESH_INTERVAL = 20
const SPEED_OFF_MULTIPLE = 0.995 ** REFRESH_INTERVAL

export default function useTouchMove(
  elRef: Ref<HTMLDivElement | null>,
  onOffset: (offsetX: number, offsetY: number) => boolean,
) {
  const touchPosition = ref<{ x: number, y: number } | null>(null)
  const lastTimestamp = ref(0)
  const lastTimeDiff = ref(0)
  const lastOffset = ref<{ x: number, y: number } | null>(null)
  const motionRef = ref<number>()
  const lastWheelDirectionRef = ref<'x' | 'y'>()

  function onTouchStart(e: TouchEvent) {
    const { screenX, screenY } = e.touches[0]
    touchPosition.value = { x: screenX, y: screenY }
    if (motionRef.value != null)
      window.clearInterval(motionRef.value)
  }

  function onTouchMove(e: TouchEvent) {
    if (!touchPosition.value)
      return
    const { screenX, screenY } = e.touches[0]
    const prev = touchPosition.value
    touchPosition.value = { x: screenX, y: screenY }
    const offsetX = screenX - prev.x
    const offsetY = screenY - prev.y
    onOffset(offsetX, offsetY)
    const now = Date.now()
    lastTimeDiff.value = now - lastTimestamp.value
    lastTimestamp.value = now
    lastOffset.value = { x: offsetX, y: offsetY }
  }

  function onTouchEnd() {
    if (!touchPosition.value)
      return
    touchPosition.value = null
    const lo = lastOffset.value
    lastOffset.value = null
    if (lo) {
      const distanceX = lo.x / (lastTimeDiff.value || 1)
      const distanceY = lo.y / (lastTimeDiff.value || 1)
      const absX = Math.abs(distanceX)
      const absY = Math.abs(distanceY)
      if (Math.max(absX, absY) < MIN_SWIPE_DISTANCE)
        return
      let currentX = distanceX
      let currentY = distanceY
      motionRef.value = window.setInterval(() => {
        if (Math.abs(currentX) < STOP_SWIPE_DISTANCE && Math.abs(currentY) < STOP_SWIPE_DISTANCE) {
          if (motionRef.value != null)
            window.clearInterval(motionRef.value)
          return
        }
        currentX *= SPEED_OFF_MULTIPLE
        currentY *= SPEED_OFF_MULTIPLE
        onOffset(currentX * REFRESH_INTERVAL, currentY * REFRESH_INTERVAL)
      }, REFRESH_INTERVAL)
    }
  }

  function onWheel(e: WheelEvent) {
    const { deltaX, deltaY } = e
    let mixed = 0
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    if (absX === absY) {
      mixed = lastWheelDirectionRef.value === 'x' ? deltaX : deltaY
    }
    else if (absX > absY) {
      mixed = deltaX
      lastWheelDirectionRef.value = 'x'
    }
    else {
      mixed = deltaY
      lastWheelDirectionRef.value = 'y'
    }
    if (onOffset(-mixed, -mixed)) {
      e.preventDefault()
    }
  }

  const touchEventsRef = ref<{
    onTouchStart: TouchEventHandler
    onTouchMove: TouchEventHandler
    onTouchEnd: TouchEventHandler
    onWheel: WheelEventHandler
  }>()
  touchEventsRef.value = { onTouchStart, onTouchMove, onTouchEnd, onWheel }

  onMounted(() => {
    function onProxyTouchStart(e: TouchEvent) {
      touchEventsRef.value?.onTouchStart(e)
    }
    function onProxyTouchMove(e: TouchEvent) {
      touchEventsRef.value?.onTouchMove(e)
    }
    function onProxyTouchEnd(e: TouchEvent) {
      touchEventsRef.value?.onTouchEnd(e)
    }
    function onProxyWheel(e: WheelEvent) {
      touchEventsRef.value?.onWheel(e)
    }

    document.addEventListener('touchmove', onProxyTouchMove, { passive: false } as any)
    document.addEventListener('touchend', onProxyTouchEnd, { passive: true } as any)

    const el = elRef.value
    if (el) {
      el.addEventListener('touchstart', onProxyTouchStart, { passive: true } as any)
      el.addEventListener('wheel', onProxyWheel, { passive: false } as any)
    }

    onUnmounted(() => {
      document.removeEventListener('touchmove', onProxyTouchMove as any)
      document.removeEventListener('touchend', onProxyTouchEnd as any)
      if (el) {
        el.removeEventListener('touchstart', onProxyTouchStart as any)
        el.removeEventListener('wheel', onProxyWheel as any)
      }
      if (motionRef.value != null)
        window.clearInterval(motionRef.value)
    })
  })
}
