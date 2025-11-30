import type { AlignType, BuildInPlacements } from '@v-c/trigger'
import type { Placement, RenderDOMFunc } from './BaseSelect'
import { Trigger } from '@v-c/trigger'
import { clsx } from '@v-c/util'
import { computed, defineComponent, shallowRef } from 'vue'

function getBuiltInPlacements(popupMatchSelectWidth: number | boolean): Record<string, AlignType> {
  const adjustX = popupMatchSelectWidth === true ? 0 : 1
  return {
    bottomLeft: {
      points: ['tl', 'bl'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    bottomRight: {
      points: ['tr', 'br'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    topLeft: {
      points: ['bl', 'tl'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    topRight: {
      points: ['br', 'tr'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
  }
}

export interface RefTriggerProps {
  getPopupElement: () => HTMLDivElement
}

export interface SelectTriggerProps {
  prefixCls: string
  disabled: boolean
  visible: boolean
  popupElement: any
  animation?: string
  transitionName?: string
  placement?: Placement
  builtinPlacements?: BuildInPlacements
  popupStyle?: any
  popupClassName?: string
  direction?: string
  popupMatchSelectWidth?: boolean | number
  popupRender?: (menu: any) => any
  getPopupContainer?: RenderDOMFunc
  popupAlign?: AlignType
  empty?: boolean
  onPopupVisibleChange?: (visible: boolean) => void
  onPopupMouseEnter?: () => void
  onPopupMouseDown?: (event: MouseEvent) => void
}

const SelectTrigger = defineComponent<SelectTriggerProps>((props, { slots, expose }) => {
  const triggerPopupRef = shallowRef<any>()
  const popupMatchWidth = computed(() =>
    props.popupMatchSelectWidth === undefined ? true : props.popupMatchSelectWidth,
  )

  expose({
    getPopupElement: () => triggerPopupRef.value?.popupElement,
  })

  const popupPrefixCls = computed(() => `${props.prefixCls}-dropdown`)

  const mergedBuiltinPlacements = computed(
    () => props.builtinPlacements || getBuiltInPlacements(popupMatchWidth.value!),
  )

  const mergedTransitionName = computed(() =>
    props.animation ? `${popupPrefixCls.value}-${props.animation}` : props.transitionName,
  )

  const isNumberPopupWidth = computed(() => typeof popupMatchWidth.value === 'number')

  const stretch = computed(() => {
    if (isNumberPopupWidth.value) {
      return null
    }
    return popupMatchWidth.value === false ? 'minWidth' : 'width'
  })

  const mergedPopupStyle = computed(() => {
    if (isNumberPopupWidth.value) {
      return {
        ...(props.popupStyle || {}),
        width: popupMatchWidth.value as number,
      }
    }
    return props.popupStyle
  })

  return () => {
    const popupNode = props.popupRender ? props.popupRender(props.popupElement) : props.popupElement
    return (
      <Trigger
        showAction={props.onPopupVisibleChange ? ['click'] : []}
        hideAction={props.onPopupVisibleChange ? ['click'] : []}
        popupPlacement={props.placement || (props.direction === 'rtl' ? 'bottomRight' : 'bottomLeft')}
        builtinPlacements={mergedBuiltinPlacements.value}
        prefixCls={popupPrefixCls.value}
        popupMotion={{ name: mergedTransitionName.value }}
        popup={(
          <div onMouseenter={props.onPopupMouseEnter} onMousedown={props.onPopupMouseDown}>
            {popupNode}
          </div>
        )}
        ref={triggerPopupRef as any}
        stretch={stretch.value as any}
        popupAlign={props.popupAlign}
        popupVisible={props.visible}
        getPopupContainer={props.getPopupContainer}
        popupClassName={clsx(props.popupClassName, {
          [`${popupPrefixCls.value}-empty`]: props.empty,
        })}
        popupStyle={mergedPopupStyle.value}
        onOpenChange={props.onPopupVisibleChange}
      >
        {slots.default?.()}
      </Trigger>
    )
  }
})

export default SelectTrigger
