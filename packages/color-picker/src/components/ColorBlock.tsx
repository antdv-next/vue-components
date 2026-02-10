import type { CSSProperties } from 'vue'
import { clsx } from '@v-c/util'
import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
import { defineComponent } from 'vue'

export interface ColorBlockProps {
  color: string
  prefixCls?: string
  /** Internal usage. Only used in antd ColorPicker semantic structure only */
  innerClassName?: string
  /** Internal usage. Only used in antd ColorPicker semantic structure only */
  innerStyle?: CSSProperties
}

export default defineComponent({
  props: ['color', 'prefixCls', 'innerClassName', 'innerStyle'],
  inheritAttrs: false,
  setup(props, { attrs, emit }) {
    const handleClickChange = (e: Event) => {
      emit('click', e)
    }

    return () => {
      const {
        color,
        prefixCls,
        innerClassName,
        innerStyle,
      } = props

      const { className, style } = getAttrStyleAndClass(attrs)
      const colorBlockCls = `${prefixCls}-color-block`

      return (
        <div
          class={clsx(colorBlockCls, className)}
          style={style}
          onClick={handleClickChange}
        >
          <div
            class={clsx(`${colorBlockCls}-inner`, innerClassName)}
            style={{
              background: color,
              ...innerStyle,
            }}
          />
        </div>
      )
    }
  },
})
