import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    prefixCls: String,
  },
  inheritAttrs: false,
  setup(props, { attrs, slots }) {
    return () => {
      const { prefixCls } = props
      return (
        <div
          class={`${prefixCls}-palette`}
          style={{
            position: 'relative',
            ...attrs.style as CSSProperties,
          }}
        >
          {slots.default?.()}
        </div>
      )
    }
  },
})
