import type {
  ActionType,
  AlignType,
  AnimationType,
  BuildInPlacements,
  TriggerProps,
} from '@v-c/trigger'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import { Trigger } from '@v-c/trigger'
import { clsx } from '@v-c/util'
import { filterEmpty, removeUndefined, toPropsRefs } from '@v-c/util/dist/props-util'
import { computed, createVNode, defineComponent, shallowRef } from 'vue'
import useAccessibility from './hooks/useAccessibility.ts'
import Overlay from './Overlay.tsx'
import Placements from './placements'

export interface DropdownProps
  extends Pick<
    TriggerProps,
    | 'getPopupContainer'
    | 'mouseEnterDelay'
    | 'mouseLeaveDelay'
    | 'onPopupAlign'
    | 'builtinPlacements'
    | 'autoDestroy'
  > {
  minOverlayWidthMatchTrigger?: boolean
  arrow?: boolean
  onVisibleChange?: (visible: boolean) => void
  onOverlayClick?: (e: Event) => void
  prefixCls?: string
  transitionName?: string
  overlayClassName?: string
  openClassName?: string
  animation?: AnimationType
  align?: AlignType
  overlayStyle?: CSSProperties
  placement?: keyof typeof Placements
  placements?: BuildInPlacements
  overlay?: (() => VueNode) | VueNode
  trigger?: ActionType | ActionType[]
  alignPoint?: boolean
  showAction?: ActionType[]
  hideAction?: ActionType[]
  visible?: boolean
  autoFocus?: boolean
}

const defaults = {
  prefixCls: 'vc-dropdown',
  arrow: false,
  placement: 'bottomLeft',
  placements: Placements,
  trigger: ['hover'],
} as any

const Dropdown = defineComponent<DropdownProps>(
  (props = defaults, { expose, slots }) => {
    const { autoFocus } = toPropsRefs(props, 'autoFocus')
    const triggerVisible = shallowRef<boolean >()
    const mergedVisible = computed(() => {
      return props?.visible ?? triggerVisible.value
    })
    const mergedMotionName = computed(() => {
      const { prefixCls, transitionName, animation } = props
      return animation ? `${prefixCls}-${animation}` : transitionName
    })
    const triggerRef = shallowRef()
    const overlayRef = shallowRef()
    const childRef = shallowRef()
    expose({
      triggerRef,
    })
    const handleVisibleChange = (visible: boolean) => {
      triggerVisible.value = visible
      props.onVisibleChange?.(visible)
    }

    useAccessibility({
      visible: mergedVisible as any,
      triggerRef: childRef,
      onVisibleChange: handleVisibleChange,
      autoFocus: autoFocus as any,
      overlayRef,
    })

    const onClick = (e: any) => {
      const { onOverlayClick } = props
      triggerVisible.value = false

      if (onOverlayClick) {
        onOverlayClick(e)
      }
    }
    return () => {
      const {
        overlay,
        prefixCls,
        arrow,
        hideAction,
        trigger,
        placement,
        placements,
        overlayClassName,
        getPopupContainer,
        showAction,
        overlayStyle,
        align,
        ...otherProps
      } = props

      const getMenuElement = () => (
        <Overlay
          ref={overlayRef}
          overlay={overlay as any}
          prefixCls={prefixCls}
          arrow={arrow}
        />
      )

      const getMenuElementOrLambda = () => {
        if (typeof overlay === 'function') {
          return getMenuElement
        }
        return getMenuElement()
      }

      const getMinOverlayWidthMatchTrigger = () => {
        const { minOverlayWidthMatchTrigger, alignPoint } = props
        if (minOverlayWidthMatchTrigger !== undefined) {
          return minOverlayWidthMatchTrigger
        }

        return !alignPoint
      }

      const getOpenClassName = () => {
        const { openClassName } = props
        if (openClassName !== undefined) {
          return openClassName
        }
        return `${prefixCls}-open`
      }

      const childArr = filterEmpty(slots?.default?.() ?? [])
      const children = childArr?.[0]
      const childrenNode = createVNode(children, {
        class: clsx(
          mergedVisible.value && getOpenClassName(),
        ),
        ref: childRef,
      })

      let triggerHideAction = hideAction
      if (!triggerHideAction && trigger?.includes('contextMenu')) {
        triggerHideAction = ['click']
      }
      return (
        <Trigger
          builtinPlacements={placements}
          {...removeUndefined(otherProps)}
          prefixCls={prefixCls}
          ref={triggerRef}
          popupClassName={clsx(overlayClassName, {
            [`${prefixCls}-show-arrow`]: arrow,
          })}
          popupStyle={overlayStyle}
          action={trigger}
          showAction={showAction}
          hideAction={triggerHideAction}
          popupPlacement={placement}
          popupAlign={align}
          popupMotion={{ name: mergedMotionName.value }}
          popupVisible={mergedVisible.value}
          stretch={getMinOverlayWidthMatchTrigger() ? 'minWidth' : ''}
          popup={getMenuElementOrLambda()}
          onOpenChange={handleVisibleChange}
          onPopupClick={onClick}
          getPopupContainer={getPopupContainer}
        >
          {childrenNode}
        </Trigger>
      )
    }
  },
)

export default Dropdown
