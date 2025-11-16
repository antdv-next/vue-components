import type { Ref } from 'vue'
import { ref } from 'vue'

export default function useOriginScroll(
  isScrollAtTop: Ref<boolean>,
  isScrollAtBottom: Ref<boolean>,
  isScrollAtLeft: Ref<boolean>,
  isScrollAtRight: Ref<boolean>,
) {
  // Do lock for a wheel when scrolling
  const lockRef = ref(false)
  let lockTimeout: ReturnType<typeof setTimeout> | null = null

  function lockScroll() {
    if (lockTimeout)
      clearTimeout(lockTimeout)

    lockRef.value = true

    lockTimeout = setTimeout(() => {
      lockRef.value = false
    }, 50)
  }

  return (isHorizontal: boolean, delta: number, smoothOffset = false) => {
    const originScroll = isHorizontal
      // Pass origin wheel when on the left
      ? (delta < 0 && isScrollAtLeft.value)
        // Pass origin wheel when on the right
      || (delta > 0 && isScrollAtRight.value)
      // Pass origin wheel when on the top
      : (delta < 0 && isScrollAtTop.value)
        // Pass origin wheel when on the bottom
        || (delta > 0 && isScrollAtBottom.value)

    if (smoothOffset && originScroll) {
      // No need lock anymore when it's smooth offset from touchMove interval
      if (lockTimeout)
        clearTimeout(lockTimeout)
      lockRef.value = false
    }
    else if (!originScroll || lockRef.value) {
      lockScroll()
    }

    return !lockRef.value && originScroll
  }
}
