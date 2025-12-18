import type { VNode } from 'vue'
import type { BaseOptionType, DefaultOptionType } from '../Select'
import { isVNode, toRaw } from 'vue'

function convertNodeToOption<OptionType extends BaseOptionType = DefaultOptionType>(
  node: VNode,
): OptionType {
  const {
    key,
    props,
    children,
  } = node as any

  const { value, label, ...restProps } = props || {}

  // children 可能是函数（slot）或者直接的内容
  let finalChildren = children
  if (typeof children === 'function') {
    finalChildren = children()
  }
  else if (children && typeof children === 'object' && 'default' in children) {
    // 如果 children 是 slots 对象
    finalChildren = typeof children.default === 'function' ? children.default() : children.default
  }

  // 使用 label > props.children > children 作为 label
  const finalLabel = label ?? restProps.children ?? finalChildren

  return {
    key,
    value: value !== undefined ? value : key,
    label: finalLabel,
    ...restProps,
  } as OptionType
}

export function convertChildrenToData<OptionType extends BaseOptionType = DefaultOptionType>(
  nodes: VNode[],
  optionOnly: boolean = false,
): OptionType[] {
  return toRaw(nodes)
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
