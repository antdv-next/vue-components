import { cloneVNode, isVNode } from 'vue'
import { toArray } from '@v-c/util/dist/Children/toArray'

export function parseChildren(children: any, keyPath: string[]) {
  return toArray(children).map((child, index) => {
    if (isVNode(child)) {
      const props = child.props || {}
      let eventKey = props.eventKey ?? child.key
      const emptyKey = eventKey === null || eventKey === undefined

      if (emptyKey) {
        eventKey = `tmp_key-${[...keyPath, index].join('-')}`
      }

      const cloneProps: Record<string, any> = {
        key: eventKey,
        eventKey,
      }

      if (process.env.NODE_ENV !== 'production' && emptyKey) {
        cloneProps.warnKey = true
      }

      return cloneVNode(child, cloneProps)
    }

    return child
  })
}
