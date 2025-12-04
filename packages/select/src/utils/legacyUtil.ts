import type { VNode } from 'vue'
import { isVNode } from 'vue'

function convertNodeToOption(node: VNode) {
  const {
    key,
    props: { children, value, ...restProps },
  } = node as any
  return {
    key,
    value: value !== undefined ? value : key,
    children,
    ...restProps,
  }
}

export function convertChildrenToData(
  nodes: VNode[],
  optionOnly: boolean = false,
): any[] {
  return nodes.map(
    (node, index) => {
      if (!isVNode(node) || !node.type) {
        return null
      }
      const isSelectOptGroup = false
      const {
        props,
        key,
      } = node as any
      if (optionOnly || !isSelectOptGroup) {
        return convertNodeToOption(node)
      }
      const { children, ...restProps } = (props || {}) as any
      if (!children || Array.isArray(children) === false) {
        return null
      }
      return {
        key: `__RC_SELECT_GRP__${key === null ? index : key}__`,
        label: key,
        ...restProps,
        children: convertChildrenToData(children),
      }
    },
  )
}
