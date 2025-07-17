import type { CSSProperties } from 'vue'
import classNames from 'classnames'
import { defineComponent } from 'vue'

export interface ColorBlockProps {
  color: string
  prefixCls?: string
}

export default defineComponent({
  props: ['color', 'prefixCls'],
  inheritAttrs: false,
  setup(props, { attrs, emit }) {
    const handleClickChange = (e: Event) => {
      emit('click', e)
    }

    return () => {
      const {
        color,
        prefixCls,
      } = props

      const colorBlockCls = `${prefixCls}-color-block`

      return (
        <div
          class={classNames(colorBlockCls, [attrs.class])}
          style={{ ...attrs.style as CSSProperties }}
          onClick={handleClickChange}
        >
          <div
            class={`${colorBlockCls}-inner`}
            style={{
              background: color,
            }}
          />
        </div>
      )
    }
  },
})
