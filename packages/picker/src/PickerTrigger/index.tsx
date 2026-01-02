import type { AlignType, BuildInPlacements } from '@v-c/trigger'
import type { CSSProperties } from 'vue'
import Trigger from '@v-c/trigger'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { usePickerContext } from '../PickerInput/context'
import { getRealPlacement } from '../utils/uiUtil'

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
}

export interface PickerTriggerProps {
  popupElement?: any
  popupStyle?: CSSProperties
  transitionName?: string
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  popupAlign?: AlignType
  range?: boolean
  popupClassName?: string
  placement?: string
  builtinPlacements?: BuildInPlacements
  direction?: 'ltr' | 'rtl'
  visible?: boolean
  onClose?: () => void
}

const PickerTrigger = defineComponent<PickerTriggerProps>((props, { slots }) => {
  const ctx = usePickerContext()
  const dropdownPrefixCls = computed(() => `${ctx.value.prefixCls}-dropdown`)

  const realPlacement = computed(() => getRealPlacement(props.placement, props.direction === 'rtl'))

  return () => (
    <Trigger
      showAction={[]}
      hideAction={['click']}
      popupPlacement={realPlacement.value}
      builtinPlacements={props.builtinPlacements || BUILT_IN_PLACEMENTS}
      prefixCls={dropdownPrefixCls.value}
      popupMotion={props.transitionName ? ({ motionName: props.transitionName } as any) : undefined}
      popup={props.popupElement}
      popupAlign={props.popupAlign}
      popupVisible={props.visible}
      popupClassName={clsx(props.popupClassName, {
        [`${dropdownPrefixCls.value}-range`]: props.range,
        [`${dropdownPrefixCls.value}-rtl`]: props.direction === 'rtl',
      })}
      popupStyle={props.popupStyle}
      stretch="minWidth"
      getPopupContainer={props.getPopupContainer}
      onPopupVisibleChange={(nextVisible: boolean) => {
        if (!nextVisible) {
          props.onClose?.()
        }
      }}
    >
      {slots.default?.()}
    </Trigger>
  )
}, {
  name: 'PickerTrigger',
  inheritAttrs: false,
})

export default PickerTrigger
