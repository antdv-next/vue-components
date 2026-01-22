import type { Ref } from 'vue'
import type { TourStepInfo } from '../interface.ts'
import canUseDom from '@v-c/util/dist/Dom/canUseDom'
import { resolveToElement } from '@v-c/util/dist/vnode'
import { computed, nextTick, onMounted, shallowRef, watch } from 'vue'
import { isInViewPort } from '../util.ts'

export interface Gap {
  offset?: number | [number, number]
  radius?: number
}

export interface PosInfo {
  left: number
  top: number
  height: number
  width: number
  radius: number
}
function isValidNumber(val: unknown): boolean {
  return typeof val === 'number' && !Number.isNaN(val)
}

export default function useTarget(
  target: Ref<TourStepInfo['target']>,
  open: Ref<boolean>,
  gap?: Ref<Gap | undefined>,
  scrollIntoViewOptions?: Ref<boolean | ScrollIntoViewOptions>,
  inlineMode?: Ref<boolean>,
  placeholderRef?: Ref<HTMLDivElement | null>,
) {
  // ========================= Target =========================
  // We trade `undefined` as not get target by function yet.
  // `null` as empty target.
  const targetElement = shallowRef<HTMLElement | null>(null)
  const syncTargetElement = () => {
    const nextElement = typeof target.value === 'function' ? (target.value as any)() : target.value
    targetElement.value = resolveToElement(nextElement || null)
  }

  watch(
    target,
    () => {
      if (!canUseDom()) {
        return
      }
      syncTargetElement()
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  // ========================= Align ==========================
  const posInfo = shallowRef<PosInfo | null>(null)
  const updatePos = () => {
    if (targetElement.value) {
      if (!inlineMode?.value && !isInViewPort(targetElement.value) && open.value) {
        targetElement.value?.scrollIntoView(scrollIntoViewOptions!.value!)
      }

      const {
        left,
        top,
        width,
        height,
      } = targetElement.value.getBoundingClientRect()
      const nextPosInfo: PosInfo = { left, top, width, height, radius: 0 }

      // If `inlineMode` we need cut off parent offset
      if (inlineMode?.value) {
        const parentRect = placeholderRef?.value?.parentElement?.getBoundingClientRect?.()
        if (parentRect) {
          nextPosInfo.left -= parentRect.left
          nextPosInfo.top -= parentRect.top
        }
      }

      const origin = posInfo.value
      if (JSON.stringify(origin) !== JSON.stringify(nextPosInfo)) {
        posInfo.value = nextPosInfo
      }
    }
    else {
      // Not exist target which means we just show in center
      posInfo.value = null
    }
  }
  onMounted(() => {
    syncTargetElement()
    updatePos()
  })
  const getGapOffset = (index: number) =>
    (Array.isArray(gap?.value?.offset) ? gap?.value?.offset[index] : gap?.value?.offset) ?? 6

  watch(
    [targetElement, open],
    async (_n, _o, onCleanup) => {
      if (!canUseDom()) {
        return
      }
      await nextTick()
      updatePos()
      // update when window resize
      window.addEventListener('resize', updatePos)
      // update when `document.body.style.overflow` is set to visible
      // by default, it will be set to hidden
      window.addEventListener('scroll', updatePos)
      onCleanup(() => {
        window.removeEventListener('resize', updatePos)
        window.removeEventListener('scroll', updatePos)
      })
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  // ======================== PosInfo =========================
  const mergedPosInfo = computed(() => {
    if (!posInfo.value) {
      return posInfo.value
    }
    const gapOffsetX = getGapOffset(0)
    const gapOffsetY = getGapOffset(1)
    const gapRadius = isValidNumber(gap?.value?.radius) ? gap?.value?.radius : 2

    return {
      left: posInfo.value.left - gapOffsetX,
      top: posInfo.value.top - gapOffsetY,
      width: posInfo.value.width + gapOffsetX * 2,
      height: posInfo.value.height + gapOffsetY * 2,
      radius: gapRadius,
    }
  })
  return [mergedPosInfo, targetElement] as const
}
