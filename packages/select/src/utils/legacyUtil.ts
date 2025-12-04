import type { VNode } from 'vue'
import type { BaseOptionType, DefaultOptionType } from '../Select'
import { isVNode } from 'vue'

function convertNodeToOption<OptionType extends BaseOptionType = DefaultOptionType>(
  node: VNode,
): OptionType {
  const {
    key,
    props,
  } = node as any

  const { children, value, ...restProps } = props || {}

  return {
    key,
    value: value !== undefined ? value : key,
    children,
    ...restProps,
  } as OptionType
}

export function convertChildrenToData<OptionType extends BaseOptionType = DefaultOptionType>(
  nodes: VNode[],
  optionOnly: boolean = false,
): OptionType[] {
  return nodes
    .map((node: VNode, index: number): OptionType | null => {
      if (!isVNode(node) || !node.type) {
        return null
      }

      const {
        type,
        key,
        props,
      } = node as VNode & { type: { isSelectOptGroup?: boolean } }

      const isSelectOptGroup = (type as any)?.isSelectOptGroup

      if (optionOnly || !isSelectOptGroup) {
        return convertNodeToOption<OptionType>(node)
      }

      const { children, ...restProps } = (props || {}) as any

      return {
        key: `__VC_SELECT_GRP__${key === null ? index : String(key)}__`,
        label: key,
        ...restProps,
        options: convertChildrenToData(children || []),
      } as OptionType
    })
    .filter((data): data is OptionType => data !== null)
}
