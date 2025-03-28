import type { ActionType, AlignType, ArrowType, TriggerProps } from '@v-c/trigger'
import type { CSSProperties, ExtractPropTypes, PropType, SlotsType } from 'vue'
import { Trigger } from '@v-c/trigger'
import useId from '@v-c/util/dist/hooks/useId'
import { cloneElement } from '@v-c/util/dist/vnode'
import classNames from 'classnames'
import { defineComponent, ref } from 'vue'
import { placements } from './placements'
import Popup from './Popup'

function tooltipProps() {
  return {
    trigger: { type: [String, Array] as PropType<ActionType | ActionType[]> },
    defaultVisible: { type: Boolean },
    visible: { type: Boolean },
    placement: { type: String as PropType<'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'>, default: 'right' },
    motion: { type: Object as PropType<TriggerProps['popupMotion']> },
    onVisibleChange: { type: Function as PropType<(visible: boolean) => void> },
    afterVisibleChange: { type: Function as PropType<(visible: boolean) => void> },
    overlay: { type: String },
    overlayStyle: { type: Object },
    overlayClassName: { type: String },
    getTooltipContainer: { type: Function as PropType<(node?: HTMLElement) => HTMLElement> },
    destroyTooltipOnHide: { type: Boolean, default: false },
    align: { type: Object as PropType<AlignType>, default: () => ({}) },
    showArrow: { type: [Boolean, Object] as PropType<boolean | ArrowType>, default: true as boolean | ArrowType },
    id: String,
    overlayInnerStyle: Object,
    zIndex: Number,
    mouseEnterDelay: { type: Number, default: 0 },
    mouseLeaveDelay: { type: Number, default: 0.1 },
    prefixCls: { type: String, default: 'vc-tooltip' },
  }
}

export type TooltipProps = Partial<ExtractPropTypes<ReturnType<typeof tooltipProps>>>

export default defineComponent({
  name: 'Tooltip',
  props: tooltipProps(),
  slots: Object as SlotsType<{
    overlay: () => any
    default: () => any
  }>,
  setup(props, { attrs, slots, expose }) {
    const triggerRef = ref<any>(null)
    const mergedId = useId(props.id)

    expose({
      getPopupDomNode: () => triggerRef.value?.getPopupDomNode?.(),
      forcePopupAlign: () => triggerRef.value?.forcePopupAlign?.(),
    })

    return () => {
      const {
        overlayClassName,
        trigger = ['hover'],
        mouseEnterDelay = 0,
        mouseLeaveDelay = 0.1,
        overlayStyle,
        prefixCls = 'vc-tooltip',
        onVisibleChange,
        afterVisibleChange,
        motion,
        placement = 'right',
        align = {},
        destroyTooltipOnHide = false,
        defaultVisible,
        getTooltipContainer,
        overlayInnerStyle,
        overlay,
        id,
        showArrow = true,
        ...restProps
      } = props

      // 合并额外的属性
      const extraProps: Partial<TooltipProps & Omit<TriggerProps, 'onPopupClick'>> = { ...restProps }
      if ('visible' in props) {
        extraProps.popupVisible = props.visible
      }

      const getPopupElement = () => (
        <Popup
          key="content"
          prefixCls={prefixCls}
          id={mergedId}
          bodyClassName={attrs?.class as string}
          overlayInnerStyle={{ ...overlayInnerStyle, ...attrs?.style as CSSProperties }}
        >
          {overlay ?? slots.overlay?.()}
        </Popup>
      )
      const getChildren = () => {
        const child = slots.default?.()[0]
        const childProps = child?.props || {}

        const mergedChildProps = {
          ...childProps,
          'aria-describedby': overlay ? mergedId : null,
        }
        return child
          ? cloneElement(child, mergedChildProps)
          : null
      }

      return (
        <Trigger
          ref={triggerRef.value}
          popupClassName={classNames(overlayClassName, [attrs.class])}
          prefixCls={prefixCls}
          action={trigger}
          builtinPlacements={placements}
          popupPlacement={placement}
          popupAlign={align}
          getPopupContainer={getTooltipContainer}
          onPopupVisibleChange={onVisibleChange}
          onAfterPopupVisibleChange={afterVisibleChange}
          popupMotion={motion}
          defaultPopupVisible={defaultVisible}
          autoDestroy={destroyTooltipOnHide}
          mouseLeaveDelay={mouseLeaveDelay}
          popupStyle={{ ...overlayStyle, ...attrs.style as CSSProperties }}
          mouseEnterDelay={mouseEnterDelay}
          arrow={showArrow}
          {...extraProps}
          v-slots={{ default: getChildren, popup: getPopupElement }}
        />
      )
    }
  },
})
