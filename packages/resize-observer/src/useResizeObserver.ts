import type { Ref } from 'vue'
import type { OnResize } from './index'
import { shallowRef, unref, watch } from 'vue'
import { observe, unobserve } from './utils/observerUtil'

export default function useResizeObserver(
  enabled: Ref<boolean | undefined>,
  getTarget: Ref<Element | undefined> | (() => HTMLElement),
  onDelayResize?: OnResize,
  onSyncResize?: OnResize,
) {
// ============================= Size =============================
  const sizeRef = shallowRef({
    width: -1,
    height: -1,
    offsetWidth: -1,
    offsetHeight: -1,
  })

  // ============================= Size =============================
  const onInternalResize = (target: HTMLElement) => {
    const { width, height } = target.getBoundingClientRect()
    const { offsetWidth, offsetHeight } = target

    /**
     * Resize observer trigger when content size changed.
     * In most case we just care about element size,
     * let's use `boundary` instead of `contentRect` here to avoid shaking.
     */
    const fixedWidth = Math.floor(width)
    const fixedHeight = Math.floor(height)

    if (
      sizeRef.value.width !== fixedWidth
      || sizeRef.value.height !== fixedHeight
      || sizeRef.value.offsetWidth !== offsetWidth
      || sizeRef.value.offsetHeight !== offsetHeight
    ) {
      const size = { width: fixedWidth, height: fixedHeight, offsetWidth, offsetHeight }
      sizeRef.value = size

      // IE is strange, right?
      const mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth
      const mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight

      const sizeInfo = {
        ...size,
        offsetWidth: mergedOffsetWidth,
        offsetHeight: mergedOffsetHeight,
      }

      // Call the callback immediately, let the caller decide whether to defer
      // onResize(sizeInfo, target);
      onSyncResize?.(sizeInfo, target)

      // defer the callback but not defer to next frame
      Promise.resolve().then(() => {
        onDelayResize?.(sizeInfo, target)
      })
    }
  }

  // Dynamic observe.
  // rc-resize-observer#226: when `getTarget` is a function that resolves to an
  // element which isn't ready yet (e.g. a portal target that mounts after the
  // parent renders), bump this counter so the watcher re-runs on the next
  // tick instead of silently never wiring up.
  const funcTargetIdRef = shallowRef(0)
  const isFuncTarget = typeof getTarget === 'function'

  watch(
    [enabled, isFuncTarget ? funcTargetIdRef : (getTarget as Ref<Element | undefined>)],
    (_, _o, onCleanup) => {
      const target = isFuncTarget ? (getTarget as () => HTMLElement)() : unref(getTarget as Ref<Element | undefined>)
      const isEnabled = unref(enabled)
      if (target && isEnabled) {
        observe(target, onInternalResize as any)
        onCleanup(() => {
          if (target) {
            unobserve(target, onInternalResize as any)
          }
        })
      }
      else if (isEnabled && isFuncTarget) {
        funcTargetIdRef.value += 1
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )
}
