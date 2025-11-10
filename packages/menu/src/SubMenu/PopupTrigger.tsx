import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { MenuMode } from '../interface'
import Trigger from '@v-c/trigger'
import { clsx } from '@v-c/util'
import raf from '@v-c/util/dist/raf'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useMenuContext } from '../context/MenuContext'
import placements, { placementsRtl } from '../placements'
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
  popup: VueNode
  popupStyle?: CSSProperties
  popupClassName?: string
  popupOffset?: number[]
  disabled: boolean
  onVisibleChange: (visible: boolean) => void
}

const PopupTrigger = defineComponent<PopupTriggerProps>(
  (props, { slots }) => {
    const menuContext = useMenuContext()
    const innerVisible = shallowRef(props.visible ?? false)
    const placement = computed(() => {
      const rtl = menuContext?.value?.rtl
      const builtinPlacements = menuContext?.value?.builtinPlacements
      return rtl ? { ...placementsRtl, ...builtinPlacements } : { ...placements, ...builtinPlacements }
    })

    const triggerMode = computed<MenuMode>(() => props.mode)
    const popupPlacement = computed(() => {
      return (popupPlacementMap as any)[triggerMode.value]
    })
    const defaultMotions = computed(() => menuContext?.value?.defaultMotions)
    const motion = computed(() => menuContext?.value?.motion)

    const targetMotion = computed(() => {
      return { ...getMotion(triggerMode.value, motion.value, defaultMotions.value) }
    })

    const targetMotionRef = shallowRef(targetMotion.value)
    watch(
      triggerMode,
      (mode) => {
        if (mode !== 'inline') {
          /**
           * PopupTrigger is only used for vertical and horizontal types.
           * When collapsed is unfolded, the inline animation will destroy the vertical animation.
           */
          targetMotionRef.value = targetMotion.value as any
        }
      },
      {
        immediate: true,
      },
    )
    watch(
      [motion, defaultMotions],
      () => {
        if (triggerMode.value !== 'inline') {
          targetMotionRef.value = targetMotion.value as any
        }
      },
    )

    const mergedMotion = computed(() => {
      return {
        ...targetMotionRef.value,
        appear: true,
      }
    })

    // Delay to change visible
    const visibleRef = shallowRef<number>()
    watch(
      () => props.visible,
      (visible, _, onCleanup) => {
        visibleRef.value = raf(() => {
          innerVisible.value = visible
        })
        onCleanup(() => {
          if (visibleRef.value !== undefined) {
            raf.cancel(visibleRef.value)
          }
        })
      },
    )

    return () => {
      const {
        popupClassName,
        popup,
        popupStyle,
        popupOffset,
        disabled,
        onVisibleChange,
        prefixCls,
      } = props
      const {
        rtl,
        rootClass,
        mode,
        getPopupContainer,
        triggerSubMenuAction,
        subMenuCloseDelay,
        subMenuOpenDelay,
        forceSubMenuRender,

      } = menuContext?.value ?? {}
      return (
        <Trigger
          prefixCls={prefixCls}
          popupClassName={clsx(
            `${prefixCls}-popup`,
            { [`${prefixCls}-rtl`]: rtl },
            popupClassName,
            rootClass,
          )}
          stretch={mode === 'horizontal' ? 'minWidth' : undefined}
          getPopupContainer={getPopupContainer}
          builtinPlacements={placement.value}
          popupPlacement={popupPlacement.value}
          popupVisible={innerVisible.value}
          popup={popup}
          popupStyle={popupStyle}
          popupAlign={popupOffset && { offset: popupOffset }}
          action={disabled ? [] : [triggerSubMenuAction!]}
          mouseEnterDelay={subMenuOpenDelay}
          mouseLeaveDelay={subMenuCloseDelay}
          onOpenChange={onVisibleChange}
          forceRender={forceSubMenuRender}
          popupMotion={mergedMotion.value}
          fresh
        >
          {slots?.default?.()}
        </Trigger>
      )
    }
  },
)

export default PopupTrigger
