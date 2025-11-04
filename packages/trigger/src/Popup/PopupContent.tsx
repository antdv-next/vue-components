import { defineComponent, shallowRef } from 'vue'

export interface PopupContextProps {
  cache?: boolean
}

const PopupContent = defineComponent<PopupContextProps>(
  (props, { slots }) => {
    const cachedChildren = shallowRef<ReturnType<NonNullable<typeof slots.default>> | undefined>()
    return () => {
      const children = slots?.default?.()

      if (!props.cache) {
        cachedChildren.value = children
        return children
      }

      if (!cachedChildren.value) {
        cachedChildren.value = children
      }
      return cachedChildren.value
    }
  },
  {
    name: 'PopupContext',
  },
)
export default PopupContent
