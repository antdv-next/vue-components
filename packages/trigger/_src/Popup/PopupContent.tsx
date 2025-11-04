import { defineComponent } from 'vue'

function PopupContentProps() {
  return {
    catch: Boolean,
  }
}

const PopupContent = defineComponent({
  name: 'PopupContent',
  props: { ...PopupContentProps() },
  setup(_, { slots }) {
    return () => {
      return (
        <>
          {slots.default?.()}
        </>
      )
    }
  },
})

export default PopupContent
