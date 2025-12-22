import type { CSSProperties } from 'vue'
import type { DataDrivenOptionProps, Direction, Placement } from './Mentions'
import Trigger from '@v-c/trigger'
import { computed, defineComponent, shallowRef } from 'vue'
import DropdownMenu from './DropdownMenu'

const BUILT_IN_PLACEMENTS = {
  bottomRight: {
    points: ['tl', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomLeft: {
    points: ['tr', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['bl', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['br', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
}

interface KeywordTriggerProps {
  loading?: boolean
  options: DataDrivenOptionProps[]
  prefixCls?: string
  placement?: Placement
  direction?: Direction
  visible?: boolean
  transitionName?: string
  getPopupContainer?: () => HTMLElement
  popupClassName?: string
  popupStyle?: CSSProperties
}

const KeywordTrigger = defineComponent<KeywordTriggerProps>(
  (props, { slots }) => {
    const opened = shallowRef(false)
    const dropdownPlacement = computed(() => {
      if (props.direction === 'rtl') {
        return props.placement === 'top' ? 'topLeft' : 'bottomLeft'
      }
      return props.placement === 'top' ? 'topRight' : 'bottomRight'
    })
    return () => {
      const {
        prefixCls,
        options,
        visible,
        transitionName,
        getPopupContainer,
        popupClassName,
        popupStyle,
      } = props

      const dropdownPrefix = `${prefixCls}-dropdown`

      const dropdownElement = (
        <DropdownMenu
          prefixCls={dropdownPrefix}
          options={options}
          opened={opened.value}
        />
      )

      return (
        <Trigger
          prefixCls={dropdownPrefix}
          popupVisible={visible}
          popup={dropdownElement}
          popupPlacement={dropdownPlacement.value}
          popupMotion={{ name: transitionName }}
          builtinPlacements={BUILT_IN_PLACEMENTS}
          getPopupContainer={getPopupContainer}
          popupClassName={popupClassName}
          popupStyle={popupStyle}
          afterOpenChange={(nextOpen) => {
            opened.value = nextOpen
          }}
        >
          {slots?.default?.()}
        </Trigger>
      )
    }
  },
  {
    name: 'KeywordTrigger',
    inheritAttrs: false,
  },
)

export default KeywordTrigger
