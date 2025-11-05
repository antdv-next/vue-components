import { Trigger } from '@v-c/trigger'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import raf from '@v-c/util/dist/raf'
import { classNames } from '@v-c/util'
import { computed, defineComponent, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useMenuContext } from '../context/MenuContext'
import type { MenuMode } from '../interface'
import { placements, placementsRtl } from '../placements'
import { getMotion } from '../utils/motionUtil'

const popupPlacementMap: Record<string, string> = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  inline: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop',
}

export interface PopupTriggerProps {
  prefixCls: string
  mode: MenuMode
  visible: boolean
  popup: any
  popupStyle?: Record<string, any>
  popupClassName?: string
  popupOffset?: number[]
  disabled: boolean
  onVisibleChange: (visible: boolean) => void
}

const PopupTrigger = defineComponent<PopupTriggerProps>(
  (props, { slots }) => {
    const menu = useMenuContext()
    const innerVisible = shallowRef(false)
    const rafRef = shallowRef<number | null>(null)

    watch(
      () => props.visible,
      (visible) => {
        if (rafRef.value !== null) {
          raf.cancel(rafRef.value)
        }
        rafRef.value = raf(() => {
          innerVisible.value = visible
        })
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      if (rafRef.value !== null) {
        raf.cancel(rafRef.value)
      }
    })

    const builtinPlacements = computed(() => {
      const context = menu?.value
      if (!context) {
        return props.mode === 'horizontal' ? placements : placementsRtl
      }
      const base = context.rtl ? placementsRtl : placements
      return {
        ...base,
        ...context.builtinPlacements,
      }
    })

    const popupPlacement = computed(() => popupPlacementMap[props.mode] || 'rightTop')

    const mergedMotion = computed<CSSMotionProps | undefined>(() => {
      const context = menu?.value
      return getMotion(props.mode, context?.motion, context?.defaultMotions)
    })

    return () => {
      const context = menu?.value
      const child = slots.default?.()
      const popupNode = typeof props.popup === 'function' ? props.popup() : props.popup

      return (
        <Trigger
          prefixCls={props.prefixCls}
          popupClassName={classNames(
            `${props.prefixCls}-popup`,
            context?.rtl && `${props.prefixCls}-rtl`,
            props.popupClassName,
            context?.rootClassName,
          )}
          stretch={props.mode === 'horizontal' ? 'minWidth' : undefined}
          getPopupContainer={context?.getPopupContainer}
          builtinPlacements={builtinPlacements.value}
          popupPlacement={popupPlacement.value}
          popupVisible={innerVisible.value}
          popup={popupNode}
          popupStyle={props.popupStyle}
          popupAlign={props.popupOffset && { offset: props.popupOffset }}
          action={props.disabled ? [] : [context?.triggerSubMenuAction ?? 'hover']}
          mouseEnterDelay={context?.subMenuOpenDelay ?? 0.1}
          mouseLeaveDelay={context?.subMenuCloseDelay ?? 0.1}
          onOpenChange={props.onVisibleChange}
          forceRender={context?.forceSubMenuRender}
          popupMotion={mergedMotion.value}
          fresh
        >
          {Array.isArray(child) ? child[0] : child}
        </Trigger>
      )
    }
  },
)

export default PopupTrigger
