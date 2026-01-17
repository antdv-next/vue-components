import type { CSSProperties, Ref } from 'vue'
import type { AlignType } from '../interface.ts'
import { computed } from 'vue'

export default function useOffsetStyle(
  isMobile: Ref<boolean>,
  ready: Ref<boolean>,
  open: Ref<boolean>,
  align: Ref<AlignType | undefined>,
  offsetR: Ref<number>,
  offsetB: Ref<number>,
  offsetX: Ref<number>,
  offsetY: Ref<number>,
) {
  // >>>>> Offset
  const AUTO = 'auto' as const
  return computed(() => {
    const offsetStyle: CSSProperties = isMobile.value
      ? {}
      : {
          left: '-1000vw',
          top: '-1000vh',
          right: AUTO,
          bottom: AUTO,
        }
    console.log(ready.value, open.value)
    // Set align style
    if (!isMobile.value && (ready.value || !open.value)) {
      const { points } = align.value ?? {}
      const dynamicInset = align.value?.dynamicInset || (align.value as any)?._experimental?.dynamicInset
      const alignRight = dynamicInset && points?.[0]?.[1] === 'r'
      const alignBottom = dynamicInset && points?.[0]?.[0] === 'b'

      if (alignRight) {
        offsetStyle.right = `${offsetR.value}px`
        offsetStyle.left = AUTO
      }
      else {
        offsetStyle.left = `${offsetX.value}px`
        offsetStyle.right = AUTO
      }

      if (alignBottom) {
        offsetStyle.bottom = `${offsetB.value}px`
        offsetStyle.top = AUTO
      }
      else {
        offsetStyle.top = `${offsetY.value}px`
        offsetStyle.bottom = AUTO
      }
    }

    return offsetStyle
  })
}
