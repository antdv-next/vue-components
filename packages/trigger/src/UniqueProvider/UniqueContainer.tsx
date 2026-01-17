import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type { AlignType, ArrowPos } from '../interface.ts'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, shallowRef, Transition, watchEffect } from 'vue'
import useOffsetStyle from '../hooks/useOffsetStyle'

export interface UniqueContainerProps {
  prefixCls: string // ${prefixCls}-unique-container
  isMobile: boolean
  ready: boolean
  open: boolean
  align: AlignType
  offsetR: number
  offsetB: number
  offsetX: number
  offsetY: number
  arrowPos?: ArrowPos
  popupSize?: { width: number, height: number }
  motion?: CSSMotionProps
  uniqueContainerClassName?: string
  uniqueContainerStyle?: CSSProperties
}

const UniqueContainer = defineComponent<UniqueContainerProps>(
  (props) => {
    // motionVisible tracks the actual visibility state after animation completes
    // Similar to React CSSMotion's onVisibleChanged callback
    const motionVisible = shallowRef(false)

    const {
      open,
      isMobile,
      align,
      ready,
      offsetR,
      offsetB,
      offsetX,
      offsetY,
    } = toPropsRefs(
      props,
      'open',
      'isMobile',
      'align',
      'ready',
      'offsetR',
      'offsetB',
      'offsetX',
      'offsetY',
    )

    // ========================= Styles =========================
    const offsetStyle = useOffsetStyle(
      isMobile,
      ready,
      open,
      align,
      offsetR,
      offsetB,
      offsetX,
      offsetY,
    )

    // Cache for offsetStyle when ready is true
    // Initialize with hidden position to prevent "fly in" on first render
    const cachedOffsetStyleRef = shallowRef<CSSProperties>(offsetStyle.value)

    watchEffect(() => {
      // Update cached offset style when ready is true
      if (ready.value) {
        cachedOffsetStyleRef.value = offsetStyle.value
      }
    })

    // Compute the actual style to use
    // When not ready and opening, use hidden position to prevent flash
    const mergedOffsetStyle = computed(() => {
      // If we have cached style (from previous ready state or current ready), use it
      if (cachedOffsetStyleRef.value && Object.keys(cachedOffsetStyleRef.value).length > 0) {
        return cachedOffsetStyleRef.value
      }
      // Fallback to current offsetStyle (which has hidden position when not ready)
      return offsetStyle.value
    })

    return () => {
      const { popupSize, motion, prefixCls, uniqueContainerClassName, arrowPos, uniqueContainerStyle } = props
      // Apply popup size if available
      const sizeStyle: CSSProperties = {}
      if (popupSize) {
        sizeStyle.width = `${popupSize.width}px`
        sizeStyle.height = `${popupSize.height}px`
      }

      const baseTransitionProps = getTransitionProps(motion?.name, motion) as any
      const containerCls = `${prefixCls}-unique-container`

      const mergedTransitionProps = {
        ...baseTransitionProps,
        onBeforeEnter: (element: Element) => {
          baseTransitionProps.onBeforeEnter?.(element)
        },
        onAfterEnter: (element: Element) => {
          // Mark as visible after enter animation completes
          motionVisible.value = true
          baseTransitionProps.onAfterEnter?.(element)
        },
        onBeforeLeave: (element: Element) => {
          baseTransitionProps.onBeforeLeave?.(element)
        },
        onAfterLeave: (element: Element) => {
          // Mark as hidden after leave animation completes
          // This is equivalent to React's leavedClassName behavior
          motionVisible.value = false
          baseTransitionProps.onAfterLeave?.(element)
        },
      }

      return (
        <Transition
          {...mergedTransitionProps}
        >
          <div
            v-show={open.value}
            class={[
              containerCls,
              uniqueContainerClassName,
              {
                [`${containerCls}-visible`]: motionVisible.value,
                // hidden class acts like React CSSMotion's leavedClassName
                // It's applied when animation has completed and element should be hidden
                [`${containerCls}-hidden`]: !motionVisible.value && !open.value,
              },
            ]}
            style={[
              {
                '--arrow-x': `${arrowPos?.x || 0}px`,
                '--arrow-y': `${arrowPos?.y || 0}px`,
              },
              mergedOffsetStyle.value,
              sizeStyle,
              uniqueContainerStyle,
            ]}
          />
        </Transition>
      )
    }
  },
)

export default UniqueContainer
