import type { CSSProperties } from 'vue'
import type { DataDrivenOptionProps, Direction, Placement } from './Mentions'
import { defineComponent, shallowRef } from 'vue'

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
    return () => {
      const {
        prefixCls,
        options,
        visible,
        transitionName,
        getPopupContainer,
        popupClassName,
        popupStyle,
        direction,
        placement,
      } = props

      const dropdownPrefix = `${prefixCls}-dropdown`

      return null
    }
  },
  {
    name: 'KeywordTrigger',
    inheritAttrs: false,
  },
)
