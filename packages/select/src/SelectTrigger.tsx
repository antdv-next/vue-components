import type { AlignType, BuildInPlacements } from '@v-c/trigger'
import type { CSSProperties } from 'vue'
import type { Placement, RenderDOMFunc } from './interface.ts'
import Trigger from '@v-c/trigger'
import { clsx } from '@v-c/util'
import { computed, defineComponent, shallowRef } from 'vue'

function getBuiltInPlacements(popupMatchSelectWidth: number | boolean): Record<string, AlignType> {
  // Enable horizontal overflow auto-adjustment when a custom dropdown width is provided
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

export interface SelectTriggerProps {
  prefixCls: string
  disabled: boolean
  visible: boolean
  popupElement: any

  animation?: string
  transitionName?: string
  placement?: Placement
  builtinPlacements?: BuildInPlacements
  popupStyle: CSSProperties
  popupClassName: string
  direction: string
  popupMatchSelectWidth?: boolean | number
  popupRender?: (menu: any) => any
  getPopupContainer?: RenderDOMFunc
  popupAlign: AlignType
  empty: boolean

  onPopupVisibleChange?: (visible: boolean) => void

  onPopupMouseEnter: () => void
  onPopupMouseDown: (event: MouseEvent) => void
}

const defaults = {
  direction: 'ltr',
} as any

const SelectTrigger = defineComponent<
  SelectTriggerProps
>(
  (props = defaults, { slots, attrs, expose }) => {
    const mergedBuiltinPlacements = computed(() => {
      return props?.builtinPlacements || getBuiltInPlacements(props.popupMatchSelectWidth!)
    })

    // =================== Popup Width ===================
    const isNumberPopupWidth = computed(() => typeof props.popupMatchSelectWidth === 'number')

    const stretch = computed(() => {
      if (isNumberPopupWidth.value) {
        return null
      }
      return props.popupMatchSelectWidth === false ? 'minWidth' : 'width'
    })

    // ======================= Ref =======================
    const triggerPopupRef = shallowRef()
    expose({
      getPopupElement: () => triggerPopupRef.value?.popupElement,
    })
    return () => {
      const {
        prefixCls,
        popupElement,
        popupRender,
        animation,
        transitionName,
        popupStyle,
        popupMatchSelectWidth,
        onPopupVisibleChange,
        placement,
        direction = 'ltr',
        builtinPlacements,
        onPopupMouseEnter,
        onPopupMouseDown,
        popupAlign,
        visible,
        getPopupContainer,
        popupClassName,
        empty,
        ...restProps
      } = props
      let popupNode: any = popupElement
      if (popupRender) {
        popupNode = popupRender(popupElement)
      }
      const popupPrefixCls = `${prefixCls}-dropdown`

      // ===================== Motion ======================
      const mergedTransitionName = animation ? `${popupPrefixCls}-${animation}` : transitionName

      const mergedPopupStyle = popupStyle
      if (isNumberPopupWidth.value) {
        mergedPopupStyle.width = `${popupMatchSelectWidth}px`
      }

      return (
        <Trigger
          {...attrs}
          {...restProps}
          showAction={onPopupVisibleChange ? ['click'] : []}
          hideAction={onPopupVisibleChange ? ['click'] : []}
          popupPlacement={placement || (direction === 'rtl' ? 'bottomRight' : 'bottomLeft')}
          builtinPlacements={mergedBuiltinPlacements.value}
          prefixCls={popupPrefixCls}
          popup={<div onMousedown={onPopupMouseDown} onMouseenter={onPopupMouseEnter}>{popupNode}</div>}
          ref={triggerPopupRef as any}
          stretch={stretch.value!}
          popupMotion={{
            name: mergedTransitionName,
          }}
          popupAlign={popupAlign}
          popupVisible={visible}
          getPopupContainer={getPopupContainer}
          popupClassName={clsx(popupClassName, {
            [`${popupPrefixCls}-empty`]: empty,
          })}
          popupStyle={mergedPopupStyle}
          onPopupVisibleChange={onPopupVisibleChange}
        >
          {slots?.default?.()}
        </Trigger>
      )
    }
  },
  {
    name: 'SelectTrigger',
    inheritAttrs: false,
  },
)

export default SelectTrigger
