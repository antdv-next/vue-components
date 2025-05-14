import type {
  ActionType,
  AlignType,
  BuildInPlacements,
} from '@v-c/trigger'
import type { ExtractPropTypes, PropType, SlotsType } from 'vue'
import { Trigger } from '@v-c/trigger'
import { cloneElement } from '@v-c/util/dist/vnode.ts'
import classNames from 'classnames'
import { defineComponent, ref, watch } from 'vue'
import useAccessibility from './hooks/useAccessibility'
import Overlay from './Overlay'
import Placements from './placements'

function dropdownProps() {
  return {
    arrow: { type: Boolean, default: false },
    prefixCls: { type: String, default: 'vc-dropdown' },
    transitionName: String,
    animation: String,
    align: Object as PropType<AlignType>,
    placement: { type: String as PropType<keyof typeof Placements>, default: 'bottomLeft' },
    placements: { type: Object as PropType<BuildInPlacements>, default: () => Placements },
    getPopupContainer: Function as PropType<(node?: HTMLElement) => HTMLElement>,
    showAction: Array as PropType<ActionType[]>,
    hideAction: Array as PropType<ActionType[]>,
    overlayClassName: String,
    overlayStyle: Object,
    visible: Boolean,
    trigger: { type: [String, Array] as PropType<ActionType | ActionType[]>, default: () => ['hover'] },
    autoFocus: Boolean,
    overlay: [Function, Object],
    onVisibleChange: Function,
    onOverlayClick: Function,
    openClassName: String,
    alignPoint: Boolean,
  }
}

export type DropdownProps = Partial<ExtractPropTypes<ReturnType<typeof dropdownProps>>>

export default defineComponent({
  name: 'Dropdown',
  props: dropdownProps(),
  slots: Object as SlotsType<{
    default: any
    overlay: any
  }>,
  emits: ['visibleChange', 'overlayClick'],
  setup(props, { slots, expose, emit }) {
    const triggerVisible = ref()
    const mergedVisible = ref()
    watch(() => props.visible, (newVisible) => {
      console.log('watch-visible', newVisible)
      if (newVisible === undefined) {
        mergedVisible.value = triggerVisible.value
      }
      else {
        mergedVisible.value = newVisible
      }
    }, { immediate: true })

    const triggerRef = ref(null)
    const overlayRef = ref(null)
    const childRef = ref(null)

    expose({
      triggerRef,
    })

    const handleVisibleChange = (newVisible: boolean) => {
      console.log('visible-change', newVisible)
      triggerVisible.value = newVisible
      emit('visibleChange', newVisible)
    }

    useAccessibility({
      visible: mergedVisible.value,
      triggerRef: childRef,
      onVisibleChange: handleVisibleChange,
      autoFocus: props.autoFocus,
      overlayRef,
    })

    const onClick = (e: Event) => {
      triggerVisible.value = false
      emit('overlayClick', e)
    }

    const getMenuElement = () => (
      <Overlay
        ref={overlayRef}
        overlay={props.overlay || slots.overlay?.()}
        prefixCls={props.prefixCls}
        arrow={props.arrow}
      />
    )

    const getMinOverlayWidthMatchTrigger = () => {
      if ('minOverlayWidthMatchTrigger' in props) {
        return props.minOverlayWidthMatchTrigger
      }
      return !props.alignPoint
    }

    const getOpenClassName = () => {
      if (props.openClassName !== undefined) {
        return props.openClassName
      }
      return `${props.prefixCls}-open`
    }

    const renderChildren = () => {
      const children = slots.default?.()
      if (!children)
        return null

      const child = children[0]
      if (!child)
        return null

      return cloneElement(child, {
        class: classNames(
          child.props?.class,
          mergedVisible.value && getOpenClassName(),
        ),
        ref: childRef,
      })
    }

    return () => {
      const {
        arrow = false,
        prefixCls = 'vc-dropdown',
        transitionName,
        animation,
        align,
        placement = 'bottomLeft',
        placements = Placements,
        getPopupContainer,
        showAction,
        hideAction,
        overlayClassName,
        overlayStyle,
        visible,
        trigger = ['hover'],
        autoFocus,
        overlay,
        onVisibleChange,
        ...otherProps
      } = props
      const mergedMotionName = animation ? `${prefixCls}-${animation}` : transitionName
      let triggerHideAction = hideAction
      if (!triggerHideAction && trigger.includes('contextMenu')) {
        triggerHideAction = ['click']
      }
      return (
        <Trigger
          builtinPlacements={placements}
          {...otherProps}
          prefixCls={prefixCls}
          ref={triggerRef}
          popupClassName={classNames(overlayClassName, {
            [`${prefixCls}-show-arrow`]: arrow,
          })}
          popupStyle={overlayStyle}
          action={trigger}
          showAction={showAction}
          hideAction={triggerHideAction}
          popupPlacement={placement}
          popupAlign={align}
          popupMotion={{ name: mergedMotionName }}
          popupVisible={mergedVisible.value}
          stretch={getMinOverlayWidthMatchTrigger() ? 'minWidth' : undefined}
          onPopupVisibleChange={handleVisibleChange}
          onPopupClick={onClick}
          getPopupContainer={getPopupContainer}
          v-slots={{ default: renderChildren, popup: getMenuElement }}
        />
      )
    }
  },
})
