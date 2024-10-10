import { cloneVNode, defineComponent } from 'vue'
import { toArray } from '@v-c/util/Children/toArray'

export interface ItemProps {
  setRef: (el: HTMLElement) => void
}

export default defineComponent<ItemProps>({
  setup(props, { slots }) {
    return () => {
      const children = toArray(slots?.default?.())
      if (children.length !== 1)
        console.warn('VirtualList.Item only accept 1 child.')
      return cloneVNode(children[0], {
        ref: (el) => {
          props?.setRef?.(el as HTMLElement)
        },
      })
    }
  },
})
