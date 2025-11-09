import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type { AlignType, ArrowPos } from '../interface.ts'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { defineComponent, nextTick, shallowRef, Transition, watch, watchEffect } from 'vue'
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
    const cachedOffsetStyleRef = shallowRef(offsetStyle.value)
    watchEffect(() => {
    // Update cached offset style when ready is true
      if (ready.value) {
        cachedOffsetStyleRef.value = offsetStyle.value
      }
    })
    watch(
      open,
      async (nextVisible) => {
        await nextTick()
        if (nextVisible) {
          motionVisible.value = true
        }
      },
    )
    return () => {
      const { popupSize, motion, prefixCls, uniqueContainerClassName, arrowPos, uniqueContainerStyle } = props
      // Apply popup size if available
      const sizeStyle: CSSProperties = {}
      if (popupSize) {
        sizeStyle.width = `${popupSize.width}px`
        sizeStyle.height = `${popupSize.height}px`
      }
      const baseTransitionProps = getTransitionProps(motion?.name, motion) as any
      const mergedTransitionProps = {
        ...baseTransitionProps,
        onBeforeEnter: (element: Element) => {
          motionVisible.value = true
          baseTransitionProps.onBeforeEnter?.(element)
        },
        onAfterEnter: (element: Element) => {
          motionVisible.value = true
          baseTransitionProps.onAfterEnter?.(element)
        },
        onAfterLeave: (element: Element) => {
          motionVisible.value = false
          baseTransitionProps.onAfterLeave?.(element)
        },
      }
      const containerCls = `${prefixCls}-unique-container`

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
                // [`${containerCls}-hidden`]: !motionVisible.value,
              },
            ]}
            style={[
              {
                '--arrow-x': `${arrowPos?.x || 0}px`,
                '--arrow-y': `${arrowPos?.y || 0}px`,
              },
              cachedOffsetStyleRef.value,
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
