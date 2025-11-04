import type { ActionType, AlignType, ArrowType, TriggerProps, TriggerRef } from '@v-c/trigger'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import { Trigger } from '@v-c/trigger'
import { clsx } from '@v-c/util'
import useId from '@v-c/util/dist/hooks/useId'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, createVNode, defineComponent, ref } from 'vue'
import placements from './placements'
import Popup from './Popup'

export type SemanticName = 'root' | 'arrow' | 'container' | 'uniqueContainer'

export interface TooltipProps
  extends Pick<
    TriggerProps,
    | 'onPopupAlign'
    | 'builtinPlacements'
    | 'fresh'
    | 'mouseLeaveDelay'
    | 'mouseEnterDelay'
    | 'prefixCls'
    | 'forceRender'
    | 'popupVisible'
  > {
  // Style
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>

  /** Config popup motion */
  motion?: TriggerProps['popupMotion']

  // Rest
  trigger?: ActionType | ActionType[]
  defaultVisible?: boolean
  visible?: boolean
  placement?: string

  onVisibleChange?: (visible: boolean) => void
  afterVisibleChange?: (visible: boolean) => void
  overlay: (() => VueNode) | VueNode

  getTooltipContainer?: (node: HTMLElement) => HTMLElement
  destroyOnHidden?: boolean
  align?: AlignType
  showArrow?: boolean | ArrowType
  arrowContent?: VueNode
  id?: string

  zIndex?: number

  /**
   * Configures Tooltip to reuse the background for transition usage.
   * This is an experimental API and may not be stable.
   */
  unique?: TriggerProps['unique']
}

export interface TooltipRef extends TriggerRef {}

const defaults = {
  mouseEnterDelay: 0,
  mouseLeaveDelay: 0.1,
  prefixCls: 'vc-tooltip',
  trigger: ['hover'],
  placement: 'right',
  align: {},
  showArrow: true,
} as any
const Tooltip = defineComponent<TooltipProps>(
  (props = defaults, { slots, expose }) => {
    const mergedId = useId(props.id)
    const triggerRef = ref<TriggerRef>()

    // ========================= Arrow ==========================
    // Process arrow configuration
    const mergedArrow = computed(() => {
      const showArrow = props.showArrow
      const classNames = props.classNames
      const styles = props.styles || {}
      const arrowContent = props.arrowContent
      if (!showArrow) {
        return false
      }
      // Convert true to object for unified processing
      const arrowConfig = showArrow === true ? {} : showArrow
      // Apply semantic styles with unified logic
      return {
        ...arrowConfig,
        className: clsx(arrowConfig.className, classNames?.arrow),
        style: { ...arrowConfig.style, ...styles?.arrow },
        content: arrowConfig.content ?? arrowContent,
      }
    })
    expose({
      nativeElement: computed(() => triggerRef.value?.nativeElement),
      popupElement: computed(() => triggerRef.value?.popupElement),
      forceAlign: () => {
        triggerRef.value?.forceAlign()
      },
    })
    return () => {
      const {
        trigger = ['hover'],
        mouseEnterDelay = 0,
        mouseLeaveDelay = 0.1,
        prefixCls = 'rc-tooltip',
        onVisibleChange,
        afterVisibleChange,
        motion,
        placement = 'right',
        align = {},
        destroyOnHidden = false,
        defaultVisible,
        getTooltipContainer,
        arrowContent,
        overlay,
        id,
        showArrow = true,
        classNames,
        styles,
        ...restProps
      } = props
      const children = filterEmpty(slots?.default?.())

      const getChildren = () => {
        const child = children?.[0]
        const originalProps = child?.props || {}
        const childProps = {
          ...originalProps,
          'aria-describedby': overlay ? mergedId : null,
        }
        return createVNode(child, childProps)
      }
      const extraProps: Partial<TooltipProps & TriggerProps> = { ...restProps }
      if ('visible' in props) {
        extraProps.popupVisible = props.visible
      }

      // ========================= Render =========================
      return (
        <Trigger
          popupClassName={classNames?.root}
          prefixCls={prefixCls}
          popup={(
            <Popup
              key="content"
              prefixCls={prefixCls}
              id={mergedId}
              classNames={classNames}
              styles={styles}
            >
              {typeof overlay === 'function' ? (overlay as any)?.() : overlay}
            </Popup>
          )}
          action={trigger}
          builtinPlacements={placements}
          popupPlacement={placement}
          ref={triggerRef}
          popupAlign={align}
          getPopupContainer={getTooltipContainer}
          onOpenChange={onVisibleChange}
          afterOpenChange={afterVisibleChange}
          popupMotion={motion}
          defaultPopupVisible={defaultVisible}
          autoDestroy={destroyOnHidden}
          mouseLeaveDelay={mouseLeaveDelay}
          popupStyle={styles?.root}
          mouseEnterDelay={mouseEnterDelay}
          arrow={mergedArrow.value!}
          uniqueContainerClassName={classNames?.uniqueContainer}
          uniqueContainerStyle={styles?.uniqueContainer}
          {...extraProps}
        >
          {getChildren()}
        </Trigger>
      )
    }
  },
)

export default Tooltip
