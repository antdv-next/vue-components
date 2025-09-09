import type { CSSProperties, PropType, SlotsType, VNode } from 'vue'
import type { MenuMode } from '../interface'
import { Trigger } from '@v-c/trigger'
import raf from '@v-c/util/dist/raf'
import classNames from 'classnames'
import { defineComponent, ref, watch } from 'vue'

import { useInjectMenu } from '../context/MenuContext'
import { placements, placementsRtl } from '../placements'
import { getMotion } from '../utils/motionUtil'

const popupPlacementMap = {
  'horizontal': 'bottomLeft',
  'vertical': 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop',
}

export interface PopupTriggerProps {
  prefixCls: string
  mode: MenuMode
  visible: boolean
  popup: VNode
  popupStyle?: CSSProperties
  popupClassName?: string
  popupOffset?: number[]
  disabled: boolean
  onVisibleChange: (visible: boolean) => void
}

export default defineComponent({
  name: 'PopupTrigger',
  props: {
    prefixCls: String,
    mode: String as PropType<MenuMode>,
    visible: Boolean,
    // popup: React.ReactNode;
    popupClassName: String,
    popupOffset: Array as PropType<number[]>,
    disabled: Boolean,
    onVisibleChange: Function as PropType<(visible: boolean) => void>,
    popup: String,
    popupStyle: Object as PropType<CSSProperties>,
  },
  slots: Object as SlotsType<{
    popup: () => VNode
    default: () => VNode
  }>,
  emits: ['visibleChange', 'mouseEnter', 'mouseLeave', 'keyDown', 'click', 'focus'],
  setup(props, { slots }) {
    const {
      getPopupContainer,
      rtl,
      subMenuOpenDelay,
      subMenuCloseDelay,
      builtinPlacements,
      triggerSubMenuAction,
      forceSubMenuRender,
      rootClassName,

      // Motion
      motion,
      defaultMotions,
    } = useInjectMenu()

    const innerVisible = ref(false)

    const placement = rtl
      ? { ...placementsRtl, ...builtinPlacements }
      : { ...placements, ...builtinPlacements }

    const popupPlacement = popupPlacementMap[props.mode]

    const targetMotion = getMotion(props.mode, motion, defaultMotions)
    const targetMotionRef = ref(targetMotion)

    if (props.mode !== 'inline') {
      /**
       * PopupTrigger is only used for vertical and horizontal types.
       * When collapsed is unfolded, the inline animation will destroy the vertical animation.
       */
      targetMotionRef.value = targetMotion
    }

    const mergedMotion = {
      ...targetMotionRef.value,
      leavedClassName: `${props.prefixCls}-hidden`,
      removeOnLeave: false,
      motionAppear: true,
    }

    // Delay to change visible
    const visibleRef = ref<number>()
    watch(() => props.visible, (newVisible, _o, onCleanup) => {
      visibleRef.value = raf(() => {
        innerVisible.value = newVisible
      })

      onCleanup(() => {
        raf.cancel(visibleRef.value)
      })
    })

    return () => {
      const {
        prefixCls,
        popup = slots.popup?.(),
        popupStyle,
        popupClassName,
        popupOffset,
        disabled,
        mode,
        onVisibleChange,
      } = props

      return (
        <Trigger
          prefixCls={prefixCls}
          popupClassName={classNames(
            `${prefixCls}-popup`,
            {
              [`${prefixCls}-rtl`]: rtl,
            },
            popupClassName,
            rootClassName,
          )}
          stretch={mode === 'horizontal' ? 'minWidth' : null}
          getPopupContainer={getPopupContainer}
          builtinPlacements={placement}
          popupPlacement={popupPlacement}
          popupVisible={innerVisible.value}
          popupStyle={popupStyle}
          popupAlign={popupOffset && { offset: popupOffset }}
          action={disabled ? [] : [triggerSubMenuAction]}
          mouseEnterDelay={subMenuOpenDelay}
          mouseLeaveDelay={subMenuCloseDelay}
          onPopupVisibleChange={onVisibleChange}
          forceRender={forceSubMenuRender}
          popupMotion={mergedMotion}
          fresh
          v-slots={{
            default: () => slots.default?.(),
            popup: () => popup,
          }}
        >
        </Trigger>
      )
    }
  },
})
