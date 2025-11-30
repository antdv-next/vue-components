import type { BaseOptionType, DefaultOptionType } from '../Select'
import { flattenChildren } from '@v-c/util/dist/props-util'
import { isVNode } from 'vue'

function getNodeChildren(node: any) {
  const { children } = node || {}
  if (typeof children === 'function') {
    return children()
  }
  if (children && typeof children === 'object' && 'default' in children) {
    return (children as any).default?.()
  }
  return children
}

function convertNodeToOption<OptionType extends BaseOptionType = DefaultOptionType>(
  node: any,
): OptionType {
  const { key, props = {} } = node || {}
  const { children, value, ...restProps } = props

  return {
    key,
    value: value !== undefined ? value : key,
    children: children ?? getNodeChildren(node),
    ...restProps,
  } as any
}

export function convertChildrenToData<OptionType extends BaseOptionType = DefaultOptionType>(
  nodes: any,
  optionOnly: boolean = false,
): OptionType[] {
  const children = flattenChildren(nodes, false)

  return children
    .map((node: any, index: number) => {
      if (!isVNode(node) || !node.type) {
        return null
      }

      const { type, key, props = {} } = node as any
      const { isSelectOptGroup } = type as any
      const nodeChildren = getNodeChildren(node)
      const restProps = props || {}

      if (optionOnly || !isSelectOptGroup) {
        return convertNodeToOption(node)
      }

      return {
        key: `__VC_SELECT_GRP__${key === null ? index : key}__`,
        label: key,
        ...restProps,
        options: convertChildrenToData(nodeChildren),
      } as any
    })
    .filter(data => data) as any
}
