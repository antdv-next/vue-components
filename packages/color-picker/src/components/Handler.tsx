import type { PropType } from 'vue'
import classNames from 'classnames'
import { defineComponent } from 'vue'

type HandlerSize = 'default' | 'small'

export default defineComponent({
  props: {
    size: String as PropType<HandlerSize>,
    color: String,
    prefixCls: String,
  },
  inheritAttrs: false,
  setup(props) {
    return () => {
      const { size = 'default', color, prefixCls } = props

      return (
        <div
          class={classNames(`${prefixCls}-handler`, {
            [`${prefixCls}-handler-sm`]: size === 'small',
          })}
          style={{
            backgroundColor: color,
          }}
        />
      )
    }
  },
})
