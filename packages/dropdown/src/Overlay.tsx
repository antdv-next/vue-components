import type { DropdownProps } from './Dropdown.tsx'
import { resolveToElement } from '@v-c/util/dist/vnode'
import { createVNode, defineComponent, shallowRef } from 'vue'

export type OverlayProps = Pick<
  DropdownProps,
    'overlay' | 'arrow' | 'prefixCls'
>

const Overlay = defineComponent<OverlayProps>(
  (props, { expose }) => {
    const overlayRef = shallowRef()
    const setRef = (el: any) => {
      overlayRef.value = el
    }

    // Stand in for the overlay node's ref (rc-dropdown forwards its ref to the
    // overlay): prefer the node's own `focus` (e.g. Menu), otherwise use its DOM.
    expose({
      focus: (options?: FocusOptions) => {
        const node = overlayRef.value
        if (typeof node?.focus === 'function') {
          node.focus(options)
        }
        else {
          resolveToElement(node)?.focus(options)
        }
      },
      querySelector: (selector: string) =>
        resolveToElement(overlayRef.value)?.querySelector(selector) ?? null,
    })
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
