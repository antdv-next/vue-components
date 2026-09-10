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
import warning from '@v-c/util/dist/warning'
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
  onOpenChange?: (open: boolean) => void
  /** @deprecated Use `onOpenChange` instead */
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
  open?: boolean
  /** @deprecated Use `open` instead */
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
    const triggerOpen = shallowRef<boolean>()
    // `open` is the preferred API; `visible` is kept for backward compatibility.
    const mergedOpen = computed(() => {
      return props?.open ?? props?.visible ?? triggerOpen.value
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
    const handleOpenChange = (open: boolean) => {
      triggerOpen.value = open
      props.onOpenChange?.(open)
      props.onVisibleChange?.(open)
    }

    useAccessibility({
      open: mergedOpen as any,
      triggerRef: childRef,
      onOpenChange: handleOpenChange,
      autoFocus: autoFocus as any,
      overlayRef,
    })

    const onClick = (e: any) => {
      const { onOverlayClick } = props
      triggerOpen.value = false

      if (onOverlayClick) {
        onOverlayClick(e)
      }
    }
    return () => {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          props.visible === undefined,
          '`visible` is deprecated. Please use `open` instead.',
        )
        warning(
          props.onVisibleChange === undefined,
          '`onVisibleChange` is deprecated. Please use `onOpenChange` instead.',
        )
      }

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
        // Pulled out so it is not forwarded to Trigger: Trigger's own `disabled`
        // suppresses the popup entirely, which is not what a disabled Dropdown
        // means.
        disabled: _disabled,
        // Consumed here; must not reach Trigger (which has its own `onOpenChange`).
        open: _open,
        visible: _visible,
        onOpenChange: _onOpenChange,
        onVisibleChange: _onVisibleChange,
        ...otherProps
      } = props as typeof props & { disabled?: boolean }

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
          mergedOpen.value && getOpenClassName(),
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
          popupVisible={mergedOpen.value}
          stretch={getMinOverlayWidthMatchTrigger() ? 'minWidth' : ''}
          popup={getMenuElementOrLambda()}
          onOpenChange={handleOpenChange}
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
