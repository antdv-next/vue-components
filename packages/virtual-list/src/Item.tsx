import { filterEmpty } from '@v-c/util/dist/props-util'
import { cloneVNode, defineComponent, type PropType, shallowRef } from 'vue'

export interface ItemProps {
  setRef: (element: HTMLElement | null) => void
}

export default defineComponent({
  name: 'Item',
  props: {
    setRef: {
      type: Function as PropType<(element: HTMLElement | null) => void>,
      required: true,
    },
  },
  setup(props, { slots }) {
    // Store the ref callback to avoid recreating it on each render
    const currentElement = shallowRef<HTMLElement | null>(null)
    const refFunc = (node: any) => {
      if (currentElement.value !== node) {
        currentElement.value = node
        props.setRef(node)
      }
    }

    return () => {
      const child = filterEmpty(slots.default?.() ?? [])[0]
      if (!child)
        return null

      return cloneVNode(child, { ref: refFunc })
    }
  },
})
