import type { CSSProperties, PropType } from 'vue'
import { computed, defineComponent, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

export interface ScrollBarProps {
  prefixCls: string
  scrollOffset: number
  scrollRange: number
  rtl: boolean
  onScroll: (scrollOffset: number, horizontal?: boolean) => void
  onStartMove: () => void
  onStopMove: () => void
  horizontal?: boolean
  style?: CSSProperties
  thumbStyle?: CSSProperties
  spinSize: number
  containerSize: number
  showScrollBar?: boolean | 'optional'
}

export interface ScrollBarRef {
  delayHidden: () => void
}

function getPageXY(
  e: MouseEvent | TouchEvent,
  horizontal: boolean,
): number {
  const obj = 'touches' in e ? e.touches[0] : e
  return obj[horizontal ? 'pageX' : 'pageY'] - window[horizontal ? 'scrollX' : 'scrollY']
}

export default defineComponent({
  name: 'ScrollBar',
  props: {
    prefixCls: { type: String, required: true },
    scrollOffset: { type: Number, required: true },
    scrollRange: { type: Number, required: true },
    rtl: { type: Boolean, default: false },
    onScroll: { type: Function as PropType<(scrollOffset: number, horizontal?: boolean) => void>, required: true },
    onStartMove: { type: Function as PropType<() => void>, required: true },
    onStopMove: { type: Function as PropType<() => void>, required: true },
    horizontal: { type: Boolean, default: false },
    style: Object as PropType<CSSProperties>,
    thumbStyle: Object as PropType<CSSProperties>,
    spinSize: { type: Number, required: true },
    containerSize: { type: Number, required: true },
    showScrollBar: { type: [Boolean, String] as PropType<boolean | 'optional'> },
  },
  setup(props, { expose }) {
    const dragging = ref(false)
    const pageXY = ref<number | null>(null)
    const startTop = ref<number | null>(null)

    const isLTR = computed(() => !props.rtl)

    // Refs
    const scrollbarRef = shallowRef<HTMLDivElement>()
    const thumbRef = shallowRef<HTMLDivElement>()

    // Visible
    // When showScrollBar is 'optional', start as visible (true)
    // When showScrollBar is true/false, use that value
    const visible = ref(props.showScrollBar === 'optional' ? true : props.showScrollBar)
    let visibleTimeout: ReturnType<typeof setTimeout> | null = null

    const delayHidden = () => {
      // Don't auto-hide if showScrollBar is explicitly true or false
      if (props.showScrollBar === true || props.showScrollBar === false)
        return
      if (visibleTimeout)
        clearTimeout(visibleTimeout)
      visible.value = true
      visibleTimeout = setTimeout(() => {
        visible.value = false
      }, 3000)
    }

    // Range
    const enableScrollRange = computed(() => props.scrollRange - props.containerSize || 0)
    const enableOffsetRange = computed(() => props.containerSize - props.spinSize || 0)

    // Top position
    const top = computed(() => {
      if (props.scrollOffset === 0 || enableScrollRange.value === 0) {
        return 0
      }
      const ptg = props.scrollOffset / enableScrollRange.value
      return ptg * enableOffsetRange.value
    })

    // State ref for event handlers
    const stateRef = shallowRef({
      top: top.value,
      dragging: dragging.value,
      pageY: pageXY.value,
      startTop: startTop.value,
    })

    watch([top, dragging, pageXY, startTop], () => {
      stateRef.value = {
        top: top.value,
        dragging: dragging.value,
        pageY: pageXY.value,
        startTop: startTop.value,
      }
    })

    const onContainerMouseDown = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
    }

    const onThumbMouseDown = (e: MouseEvent | TouchEvent) => {
      dragging.value = true
      pageXY.value = getPageXY(e, props.horizontal || false)
      startTop.value = stateRef.value.top

      props.onStartMove()
      e.stopPropagation()
      e.preventDefault()
    }

    // Effect: Add passive:false event listeners
    onMounted(() => {
      const onScrollbarTouchStart = (e: TouchEvent) => {
        e.preventDefault()
      }

      const scrollbarEle = scrollbarRef.value
      const thumbEle = thumbRef.value

      if (scrollbarEle && thumbEle) {
        scrollbarEle.addEventListener('touchstart', onScrollbarTouchStart, { passive: false })
        thumbEle.addEventListener('touchstart', onThumbMouseDown as any, { passive: false })

        onUnmounted(() => {
          scrollbarEle.removeEventListener('touchstart', onScrollbarTouchStart)
          thumbEle.removeEventListener('touchstart', onThumbMouseDown as any)
        })
      }
    })

    // Effect: Handle dragging
    watch(dragging, (isDragging) => {
      if (isDragging) {
        let moveRafId: number | null = null

        const onMouseMove = (e: MouseEvent | TouchEvent) => {
          const {
            dragging: stateDragging,
            pageY: statePageY,
            startTop: stateStartTop,
          } = stateRef.value

          if (moveRafId)
            cancelAnimationFrame(moveRafId)

          const rect = scrollbarRef.value!.getBoundingClientRect()
          const scale = props.containerSize / (props.horizontal ? rect.width : rect.height)

          if (stateDragging) {
            const offset = (getPageXY(e, props.horizontal || false) - (statePageY || 0)) * scale
            let newTop = stateStartTop || 0

            if (!isLTR.value && props.horizontal) {
              newTop -= offset
            }
            else {
              newTop += offset
            }

            const tmpEnableScrollRange = enableScrollRange.value
            const tmpEnableOffsetRange = enableOffsetRange.value

            const ptg: number = tmpEnableOffsetRange ? newTop / tmpEnableOffsetRange : 0

            let newScrollTop = Math.ceil(ptg * tmpEnableScrollRange)
            newScrollTop = Math.max(newScrollTop, 0)
            newScrollTop = Math.min(newScrollTop, tmpEnableScrollRange)

            moveRafId = requestAnimationFrame(() => {
              props.onScroll(newScrollTop, props.horizontal)
            })
          }
        }

        const onMouseUp = () => {
          dragging.value = false
          props.onStopMove()
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true } as any)
        window.addEventListener('touchmove', onMouseMove, { passive: true } as any)
        window.addEventListener('mouseup', onMouseUp, { passive: true } as any)
        window.addEventListener('touchend', onMouseUp, { passive: true } as any)

        onUnmounted(() => {
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('touchmove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
          window.removeEventListener('touchend', onMouseUp)

          if (moveRafId)
            cancelAnimationFrame(moveRafId)
        })
      }
    })

    // Effect: Delay hidden on scroll offset change
    watch(() => props.scrollOffset, () => {
      delayHidden()
    })

    onUnmounted(() => {
      if (visibleTimeout)
        clearTimeout(visibleTimeout)
    })

    // Imperative handle
    expose({
      delayHidden,
    })

    return () => {
      const scrollbarPrefixCls = `${props.prefixCls}-scrollbar`

      const containerStyle: CSSProperties = {
        position: 'absolute',
        visibility: visible.value ? undefined : 'hidden',
      }

      const thumbStyle: CSSProperties = {
        position: 'absolute',
        borderRadius: '99px',
        background: 'var(--vc-virtual-list-scrollbar-bg, rgba(0, 0, 0, 0.5))',
        cursor: 'pointer',
        userSelect: 'none',
      }

      if (props.horizontal) {
        Object.assign(containerStyle, {
          height: '8px',
          left: 0,
          right: 0,
          bottom: 0,
        })

        Object.assign(thumbStyle, {
          height: '100%',
          width: `${props.spinSize}px`,
          [isLTR.value ? 'left' : 'right']: `${top.value}px`,
        })
      }
      else {
        Object.assign(containerStyle, {
          width: '8px',
          top: 0,
          bottom: 0,
          [isLTR.value ? 'right' : 'left']: 0,
        })

        Object.assign(thumbStyle, {
          width: '100%',
          height: `${props.spinSize}px`,
          top: `${top.value}px`,
        })
      }

      return (
        <div
          ref={scrollbarRef}
          class={[
            scrollbarPrefixCls,
            {
              [`${scrollbarPrefixCls}-horizontal`]: props.horizontal,
              [`${scrollbarPrefixCls}-vertical`]: !props.horizontal,
              [`${scrollbarPrefixCls}-visible`]: visible.value,
            },
          ]}
          style={{ ...containerStyle, ...props.style }}
          onMousedown={onContainerMouseDown}
          onMousemove={delayHidden}
        >
          <div
            ref={thumbRef}
            class={[
              `${scrollbarPrefixCls}-thumb`,
              {
                [`${scrollbarPrefixCls}-thumb-moving`]: dragging.value,
              },
            ]}
            style={{ ...thumbStyle, ...props.thumbStyle }}
            onMousedown={onThumbMouseDown}
          />
        </div>
      )
    }
  },
})
