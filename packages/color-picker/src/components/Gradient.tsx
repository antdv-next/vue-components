import type { PropType } from 'vue'
import type { HsbaColorType } from '../interface'
import { defineComponent } from 'vue'
import { Color } from '../color'
import { generateColor } from '../util'

export default defineComponent({
  props: {
    colors: {
      type: Array as PropType<(Color | string)[]>,
      required: true,
    },
    direction: String,
    type: {
      type: String as PropType<HsbaColorType>,
    },
    prefixCls: String,
  },
  inheritAttrs: false,
  setup(props, { slots }) {
    return () => {
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
  },
})
