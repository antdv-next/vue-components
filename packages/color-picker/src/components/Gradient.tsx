import type { FunctionalComponent } from 'vue'
import type { HsbaColorType } from '../interface'
import { Color } from '../color'
import { generateColor } from '../util'

const Gradient: FunctionalComponent<{
  colors: (Color | string)[]
  direction?: string
  type?: HsbaColorType
  prefixCls?: string
}> = (props, { slots }) => {
  const { colors, direction = 'to right', type, prefixCls } = props
  const gradientColors = colors
    .map((color, idx) => {
      let result = generateColor(color)
      if (type === 'alpha' && idx === colors.length - 1) {
        result = new Color(result.setA(1))
      }
      return result.toRgbString()
    })
    .join(',')

  return (
    <div
      class={`${prefixCls}-gradient`}
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(${direction}, ${gradientColors})`,
      }}
    >
      {slots.default?.()}
    </div>
  )
}

Gradient.inheritAttrs = false

export default Gradient
