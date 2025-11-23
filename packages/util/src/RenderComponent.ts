import { createVNode, defineComponent, isVNode } from 'vue'
import { filterEmpty } from './props-util'

function checkIsBaseType(value: any) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true
  }
  return typeof value === 'undefined' || value === null
}
export default defineComponent<{
  render?: any
}>(
  (props, { attrs }) => {
    return () => {
      const render = props.render
      if (render && typeof render === 'function') {
        const _render = (render as any)?.()
        if (Array.isArray(_render)) {
          const arr = filterEmpty(_render)
          return arr.map((v) => {
            if (isVNode(v)) {
              return createVNode(v, {
                ...attrs,
              })
            }
            else {
              return v
            }
          })
        }
        return _render
      }
      else if (Array.isArray(render)) {
        const arr = filterEmpty(render)
        return arr.map((v) => {
          if (isVNode(v)) {
            return createVNode(v, {
              ...attrs,
            })
          }
          return v
        })
      }
      else if (checkIsBaseType(render)) {
        return render
      }

      if (isVNode(render)) {
        return createVNode(render, {
          ...attrs,
        })
      }
      console.log(render, 'render')
      return render
    }
  },
  {
    inheritAttrs: false,
    name: 'RenderComponent',
    props: ['render'],
  },
)
