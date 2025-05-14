import type { DropdownProps } from './Dropdown'
import { defineComponent } from 'vue'

export type OverlayProps = Pick<
  DropdownProps,
  'overlay' | 'arrow' | 'prefixCls'
>

export default defineComponent({
  name: 'Overlay',
  props: {
    overlay: [Function, Object],
    arrow: Boolean,
    prefixCls: String,
  },
  setup(props) {
    return () => {
      const { overlay, arrow, prefixCls } = props

      return (
        <>
          {arrow && <div class={`${prefixCls}-arrow`} />}
          {overlay}
        </>
      )
    }
  },
})
