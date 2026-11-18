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
  setup(props, { attrs }) {
    return () => {
      const {
        color,
        prefixCls,
        innerClassName,
        innerStyle,
      } = props

      const { className, style, restAttrs } = getAttrStyleAndClass(attrs)
      const colorBlockCls = `${prefixCls}-color-block`
      // Render a native button when clickable so it is focusable and keyboard operable.
      const interactive = !!restAttrs.onClick
      const Tag = interactive ? 'button' : 'div'
      const InnerTag = interactive ? 'span' : 'div'

      // ============================ Render ============================
      return (
        <Tag
          type={interactive ? 'button' : undefined}
          aria-label={interactive ? color : undefined}
          {...restAttrs}
          class={clsx(colorBlockCls, className)}
          style={style}
        >
          <InnerTag
            class={clsx(`${colorBlockCls}-inner`, innerClassName)}
            style={{
              background: color,
              ...innerStyle,
            }}
          />
        </Tag>
      )
    }
  },
})
