import { toArray } from '@v-c/util/dist/Children/toArray'
import { isVNode } from 'vue'

export function parseChildren(children: any | undefined, keyPath: string[]) {
  return toArray(children).map((child, index) => {
    if (isVNode(child)) {
      const key = child.key
      let eventKey = (child.props as any)?.eventKey ?? key
      const emptyKey = eventKey === null || eventKey === undefined
      if (emptyKey) {
        eventKey = `tmp_key-${[...keyPath, index].join('-')}`
      }
      const cloneProps = { key: eventKey, eventKey } as any

      if (process.env.NODE_ENV !== 'production' && emptyKey) {
        cloneProps.warnKey = true
      }

      return {
        ...child,
        props: {
          ...child.props,
          ...cloneProps,
        },
      }
    }
    return child
  })
}
