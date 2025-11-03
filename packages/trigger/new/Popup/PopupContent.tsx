import { defineComponent } from 'vue'

export interface PopupContextProps {
  cache?: boolean
}

const PopupContent = defineComponent<PopupContextProps>(
  (props, { slots }) => {
    return () => {
      if (props.cache) {
        return slots?.default?.()
      }
      return slots?.default?.()
    }
  },
  {
    name: 'PopupContext',
  },
)
export default PopupContent
