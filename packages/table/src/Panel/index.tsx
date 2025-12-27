import { defineComponent } from 'vue'

const Panel = defineComponent((_, { attrs, slots }) => {
  return () => {
    return <div {...attrs}>{slots?.default?.()}</div>
  }
})

export default Panel
