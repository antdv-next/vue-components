// Affix is a simple wrapper which should not read context or logical props
import { filterEmpty } from '@v-c/util/dist/props-util'
import { defineComponent } from 'vue'

const Affix = defineComponent(
  (_, { attrs, slots }) => {
    return () => {
      const children = filterEmpty(slots?.default?.() ?? [])
      if (children.length < 1) {
        return null
      }
      return <div {...attrs}>{children}</div>
    }
  },
  {
    name: 'Affix',
    inheritAttrs: false,
  },
)

export default Affix
