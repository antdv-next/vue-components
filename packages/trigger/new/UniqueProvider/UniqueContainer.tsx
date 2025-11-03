import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type { AlignType, ArrowPos } from '../interface.ts'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { defineComponent, shallowRef, Transition, watchEffect } from 'vue'
import useOffsetStyle from '../hooks/useOffsetStyle.ts'

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
    return () => {
      const { popupSize, motion, prefixCls, uniqueContainerClassName, arrowPos, uniqueContainerStyle } = props
      // Apply popup size if available
      const sizeStyle: CSSProperties = {}
      if (popupSize) {
        sizeStyle.width = `${popupSize.width}px`
        sizeStyle.height = `${popupSize.height}px`
      }
      const transitionProps = getTransitionProps(motion?.name, motion)
      const containerCls = `${prefixCls}-unique-container`

      return (
        <Transition
          onAfterLeave={
            () => {
              motionVisible.value = false
            }
          }
          {...transitionProps}
        >
          <div
            v-show={open.value}
            class={[
              containerCls,
              uniqueContainerClassName,
              {
                [`${containerCls}-visible`]: motionVisible.value,
                [`${containerCls}-hidden`]: !motionVisible.value,
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
