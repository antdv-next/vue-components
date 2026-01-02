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

const PickerTrigger = defineComponent<PickerTriggerProps>((rawProps, { attrs, slots }) => {
  const props = computed(() => ({
    ...rawProps,
    ...attrs,
  }))
  const ctx = usePickerContext()
  const dropdownPrefixCls = computed(() => `${ctx.value.prefixCls}-dropdown`)

  const realPlacement = computed(() => getRealPlacement(props.value.placement, props.value.direction === 'rtl'))

  return () => (
    <Trigger
      showAction={[]}
      hideAction={['click']}
      popupPlacement={realPlacement.value}
      builtinPlacements={props.value.builtinPlacements || BUILT_IN_PLACEMENTS}
      prefixCls={dropdownPrefixCls.value}
      popupMotion={{ motionName: props.value.transitionName }}
      popup={props.value.popupElement}
      popupAlign={props.value.popupAlign}
      popupVisible={props.value.visible}
      popupClassName={clsx(props.value.popupClassName, {
        [`${dropdownPrefixCls.value}-range`]: props.value.range,
        [`${dropdownPrefixCls.value}-rtl`]: props.value.direction === 'rtl',
      })}
      popupStyle={props.value.popupStyle}
      stretch="minWidth"
      getPopupContainer={props.value.getPopupContainer}
      onPopupVisibleChange={(nextVisible: boolean) => {
        if (!nextVisible) {
          props.value.onClose?.()
        }
      }}
    >
      {slots.default?.()}
    </Trigger>
  )
})

PickerTrigger.name = 'PickerTrigger'
PickerTrigger.inheritAttrs = false

export default PickerTrigger
