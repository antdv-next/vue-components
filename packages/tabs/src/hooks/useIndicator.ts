import type { ComputedRef, CSSProperties, Ref } from 'vue'
import type { IndicatorConfig } from '../interface'
import type { TabOffset } from './useOffsets'
import raf from '@v-c/util/dist/raf'
import { nextTick, onUnmounted, ref, watch } from 'vue'

interface UseIndicatorOptions {
  activeTabOffset: ComputedRef<TabOffset> | Ref<TabOffset>
  horizontal: ComputedRef<boolean> | Ref<boolean>
  rtl: ComputedRef<boolean> | Ref<boolean>
  indicator?: ComputedRef<IndicatorConfig | undefined> | Ref<IndicatorConfig | undefined>
}

function useIndicator(options: UseIndicatorOptions) {
  const { activeTabOffset, horizontal, rtl, indicator } = options
  const inkStyle = ref<CSSProperties>()
  const inkBarRafRef = ref<number>()

  const getLength = (origin: number) => {
    const size = indicator?.value?.size
    if (typeof size === 'function')
      return size(origin)
    if (typeof size === 'number')
      return size
    return origin
  }

  function cleanInkBarRaf() {
    if (!inkBarRafRef.value)
      return
    raf.cancel(inkBarRafRef.value)
  }

  watch(
    [
      () => activeTabOffset.value,
      () => horizontal.value,
      () => rtl.value,
      () => indicator?.value,
    ],
    async (_n, _o) => {
      await nextTick()
      const align = indicator?.value?.align || 'center'
      const newInkStyle: CSSProperties = {}

      if (activeTabOffset.value) {
        if (horizontal.value) {
          newInkStyle.width = `${getLength(activeTabOffset.value.width)}px`
          const key = rtl.value ? 'right' : 'left'
          if (align === 'start') {
            ;(newInkStyle)[key] = `${(activeTabOffset.value)[key]}px`
          }
          if (align === 'center') {
            ;(newInkStyle)[key] = `${(activeTabOffset.value)[key] + activeTabOffset.value.width / 2}px`
            newInkStyle.transform = rtl.value ? 'translateX(50%)' : 'translateX(-50%)'
          }
          if (align === 'end') {
            ;(newInkStyle)[key] = `${(activeTabOffset.value)[key] + activeTabOffset.value.width}px`
            newInkStyle.transform = 'translateX(-100%)'
          }
        }
        else {
          newInkStyle.height = `${getLength(activeTabOffset.value.height)}px`
          if (align === 'start') {
            newInkStyle.top = `${activeTabOffset.value.top}px`
          }
          if (align === 'center') {
            newInkStyle.top = `${activeTabOffset.value.top + activeTabOffset.value.height / 2}px`
            newInkStyle.transform = 'translateY(-50%)'
          }
          if (align === 'end') {
            newInkStyle.top = `${activeTabOffset.value.top + activeTabOffset.value.height}px`
            newInkStyle.transform = 'translateY(-100%)'
          }
        }
      }

      cleanInkBarRaf()
      inkBarRafRef.value = raf(() => {
        const isEqual
          = inkStyle.value
            && newInkStyle
            && Object.keys(newInkStyle).every((key) => {
              const newValue = newInkStyle[key as keyof CSSProperties]
              const oldValue = inkStyle.value?.[key as keyof CSSProperties]
              return typeof newValue === 'number' && typeof oldValue === 'number'
                ? Math.round(newValue) === Math.round(oldValue)
                : newValue === oldValue
            })
        if (!isEqual) {
          inkStyle.value = newInkStyle
        }
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    cleanInkBarRaf()
  })

  return inkStyle
}

export default useIndicator
