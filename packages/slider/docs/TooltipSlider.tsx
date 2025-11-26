import type { PropType, VNode } from 'vue'
import type { SliderProps } from '../src'
import Tooltip from '@v-c/tooltip'
import raf from '@v-c/util/dist/raf'
import { defineComponent, ref, watch } from 'vue'
import Slider from '../src'
import './assets/bootstrap.less'

export const HandleTooltip = defineComponent({
  name: 'HandleTooltip',
  props: {
    value: { type: Number, required: true },
    visible: { type: Boolean, required: true },
    tipFormatter: { type: Function as PropType<(value: number) => string>, default: (val: number) => `${val} %` },
  },
  setup(props, { slots }) {
    const tooltipRef = ref()
    const rafRef = ref<number | null>(null)

    function cancelKeepAlign() {
      if (rafRef.value !== null) {
        raf.cancel(rafRef.value)
        rafRef.value = null
      }
    }

    function keepAlign() {
      cancelKeepAlign()
      rafRef.value = raf(() => {
        tooltipRef.value?.forceAlign()
      })
    }

    watch(
      [() => props.visible, () => props.value],
      ([visible], _prev, onCleanup) => {
        if (visible) {
          keepAlign()
        }
        else {
          cancelKeepAlign()
        }

        onCleanup(() => {
          cancelKeepAlign()
        })
      },
      { immediate: true },
    )
    return () => {
      return (
        <Tooltip
          placement="top"
          overlayInnerStyle={{ minHeight: 'auto' }}
          ref={tooltipRef}
          visible={props.visible}
          overlay={props.tipFormatter(props.value)}
          v-slots={{
            default: slots.default,
          }}
        />
      )
    }
  },
})

interface HandleTooltipProps {
  index: number
  prefixCls: string
  value: number
  dragging: boolean
  draggingDelete: boolean
  node: HTMLElement
}
export function HandleRender(props: HandleTooltipProps) {
  return (
    <HandleTooltip value={props.value} visible={props.dragging}>
      {props.node}
    </HandleTooltip>
  )
}

interface TooltipSliderProps extends SliderProps {
  tipFormatter?: (value: number) => VNode
  tipProps?: any
}

const TooltipSlider = defineComponent<TooltipSliderProps>({
  name: 'TooltipSlider',
  props: {
    tipFormatter: Function as PropType<(value: number) => string>,
    tipProps: Object,
  },
  setup(_, { attrs }) {
    return () => {
      return (
        <Slider
          {...attrs}
          handleRender={HandleRender}
        />
      )
    }
  },
})

export default TooltipSlider
