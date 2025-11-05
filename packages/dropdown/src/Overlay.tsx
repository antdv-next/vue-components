import type { DropdownProps } from './Dropdown.tsx'
import { createVNode, defineComponent, shallowRef } from 'vue'

export type OverlayProps = Pick<
  DropdownProps,
    'overlay' | 'arrow' | 'prefixCls'
>

const Overlay = defineComponent<OverlayProps>(
  (props) => {
    const overlayRef = shallowRef()
    const setRef = (el: any) => {
      overlayRef.value = el
    }
    return () => {
      const { overlay, arrow, prefixCls } = props
      const overlayNode = typeof overlay === 'function' ? (overlay as any)?.() : overlay
      return (
        <>
          {arrow && <div class={`${prefixCls}-arrow`} />}
          {
            createVNode(
              overlayNode,
              {
                ref: setRef,
              },
            )
          }
        </>
      )
    }
  },
)

export default Overlay
