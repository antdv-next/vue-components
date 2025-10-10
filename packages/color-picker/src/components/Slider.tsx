import type { PropType } from 'vue'
import type { HsbaColorType, TransformOffset } from '../interface'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import { classNames } from '@v-c/util'
import { computed, defineComponent, ref } from 'vue'

import { Color } from '../color'
import useColorDrag from '../hooks/useColorDrag'
import { calcOffset, calculateColor } from '../util'
import Gradient from './Gradient'
import Handler from './Handler'
import Palette from './Palette'
import Transform from './Transform'

export interface BaseSliderProps {
  prefixCls: string
  colors: { percent: number, color: string }[]
  min: number
  max: number
  value: number
  disabled: boolean
  onChange: (value: number) => void
  onChangeComplete: (value: number) => void
  type: HsbaColorType
  color: Color
}

export default defineComponent({
  name: 'Slider',
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    colors: {
      type: Array as PropType<{ percent: number, color: string }[]>,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    onChange: Function,
    onChangeComplete: Function,
    type: {
      type: String as PropType<HsbaColorType>,
      required: true,
    },
    color: {
      type: Object as PropType<Color>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const sliderRef = ref()
    const transformRef = ref()
    const colorRef = ref<Color>(props.color)

    const getValue = (c: Color) => {
      return props.type === 'hue' ? c.getHue() : c.a * 100
    }

    const onDragChange = useEvent((offsetValue: TransformOffset) => {
      const calcColor = calculateColor({
        offset: offsetValue,
        targetRef: transformRef,
        containerRef: sliderRef,
        color: props.color,
        type: props.type,
      })

      colorRef.value = calcColor
      emit('change', getValue(calcColor))
    })

    const [offset, dragStartHandle] = useColorDrag({
      color: props.color,
      targetRef: transformRef,
      containerRef: sliderRef,
      calculate: () => calcOffset(props.color, props.type),
      onDragChange,
      onDragChangeComplete() {
        emit('changeComplete', getValue(colorRef.value as Color))
      },
      direction: 'x',
      disabledDrag: props.disabled,
    })

    const handleColor = computed(() => {
      if (props.type === 'hue') {
        const hsb = props.color.toHsb()
        hsb.s = 1
        hsb.b = 1
        hsb.a = 1

        const lightColor = new Color(hsb)
        return lightColor
      }

      return props.color
    })

    // ========================== Render ==========================
    return () => {
      const {
        prefixCls,
        colors,
        type,
      } = props

      // ========================= Gradient =========================
      const gradientList = colors.map(info => `${info.color} ${info.percent}%`)
      return (
        <div
          ref={sliderRef}
          class={classNames(
            `${prefixCls}-slider`,
            `${prefixCls}-slider-${type}`,
          )}
          onMousedown={dragStartHandle}
          onTouchstart={dragStartHandle}
        >
          <Palette prefixCls={prefixCls}>
            <Transform x={offset.value.x} y={offset.value.y} ref={transformRef}>
              <Handler
                size="small"
                color={handleColor.value.toHexString()}
                prefixCls={prefixCls}
              />
            </Transform>
            <Gradient colors={gradientList} type={type} prefixCls={prefixCls} />
          </Palette>
        </div>
      )
    }
  },
})
