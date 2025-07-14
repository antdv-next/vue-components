import type { FunctionalComponent } from 'vue'
import type { HsbaColorType, TransformOffset } from '../interface'
import useEvent from '@v-c/util/dist/hooks/useEvent.ts'
import classNames from 'classnames'
import { computed, ref } from 'vue'

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

const Slider: FunctionalComponent<BaseSliderProps> = (props, { emit }) => {
  const {
    prefixCls,
    colors,
    disabled,
    color,
    type,
  } = props

  const sliderRef = ref()
  const transformRef = ref()
  const colorRef = ref<Color>(color)

  const getValue = (c: Color) => {
    return type === 'hue' ? c.getHue() : c.a * 100
  }

  const onDragChange = useEvent((offsetValue: TransformOffset) => {
    const calcColor = calculateColor({
      offset: offsetValue,
      targetRef: transformRef,
      containerRef: sliderRef,
      color,
      type,
    })

    colorRef.value = calcColor
    emit('change', getValue(calcColor))
  })

  const [offset, dragStartHandle] = useColorDrag({
    color,
    targetRef: transformRef,
    containerRef: sliderRef,
    calculate: () => calcOffset(color, type),
    onDragChange,
    onDragChangeComplete() {
      emit('changeComplete', getValue(colorRef.value as Color))
    },
    direction: 'x',
    disabledDrag: disabled,
  })

  const handleColor = computed(() => {
    if (type === 'hue') {
      const hsb = color.toHsb()
      hsb.s = 1
      hsb.b = 1
      hsb.a = 1

      const lightColor = new Color(hsb)
      return lightColor
    }

    return color
  })
  console.log('slider', color, handleColor.value)

  // ========================= Gradient =========================
  const gradientList = colors.map(info => `${info.color} ${info.percent}%`)

  // ========================== Render ==========================
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

Slider.inheritAttrs = false

export default Slider
