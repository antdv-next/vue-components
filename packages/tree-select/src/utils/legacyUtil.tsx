import type { VNode } from 'vue'
import type { ChangeEventExtra, DataNode, FieldNames, LegacyCheckedNode, SafeKey } from '../interface'
import warning from '@v-c/util/dist/warning'
import { createVNode, isVNode, toRaw } from 'vue'
import TreeNode from '../TreeNode'

function getNodeChildren(children: any): VNode[] {
  let finalChildren = children
  if (typeof children === 'function') {
    finalChildren = children()
  }
  else if (children && typeof children === 'object' && 'default' in children) {
    finalChildren = typeof children.default === 'function' ? children.default() : children.default
  }
  return Array.isArray(finalChildren) ? finalChildren : []
}

export function convertChildrenToData(nodes: VNode[] = []): DataNode[] {
  return toRaw(nodes)
    .map((node: VNode) => {
      if (!isVNode(node) || !node.type) {
        return null
      }

      const {
        key,
        props,
        children,
      } = node as any

      const { value, ...restProps } = props || {}

      const data: DataNode = {
        key,
        value,
        ...restProps,
      }

      const childData = convertChildrenToData(getNodeChildren(children))
      if (childData.length) {
        data.children = childData
      }

      return data
    })
    .filter((data): data is DataNode => data !== null)
}

export function fillLegacyProps(dataNode: DataNode) {
  if (!dataNode) {
    return dataNode
  }

  const cloneNode = { ...dataNode } as any

  if (!('props' in cloneNode)) {
    Object.defineProperty(cloneNode, 'props', {
      get() {
        warning(
          false,
          'New `vc-tree-select` not support return node instance as argument anymore. Please consider to remove `props` access.',
        )
        return cloneNode
      },
    })
  }

  return cloneNode
}

export function fillAdditionalInfo(
  extra: ChangeEventExtra,
  triggerValue: SafeKey,
  checkedValues: SafeKey[],
  treeData: DataNode[],
  showPosition: boolean,
  fieldNames: FieldNames,
) {
  let triggerNode: any = null
  let nodeList: LegacyCheckedNode[] | null = null

  function generateMap() {
    function dig(list: DataNode[], level = '0', parentIncluded = false): LegacyCheckedNode[] {
      return (list || [])
        .map((option, index) => {
          const pos = `${level}-${index}`
          const value = (option as any)[fieldNames.value as any] as SafeKey
          const included = checkedValues.includes(value)
          const children = dig((option as any)[fieldNames.children as any] || [], pos, included)
          const node = createVNode(TreeNode as any, option as any, {
            default: () => children.map(child => child.node),
          })

          // Link with trigger node
          if (triggerValue === value) {
            triggerNode = node
          }

          if (included) {
            const checkedNode: LegacyCheckedNode = {
              pos,
              node,
              children,
            }

            if (!parentIncluded) {
              nodeList!.push(checkedNode)
            }

            return checkedNode
          }

          return null
        })
        .filter((node): node is LegacyCheckedNode => node !== null)
    }

    if (!nodeList) {
      nodeList = []

      dig(treeData)

      // Sort to keep the checked node length
      nodeList.sort((a, b) => {
        const val1 = (a.node as any).props?.value
        const val2 = (b.node as any).props?.value
        const index1 = checkedValues.indexOf(val1)
        const index2 = checkedValues.indexOf(val2)
        return index1 - index2
      })
    }
  }

  Object.defineProperty(extra, 'triggerNode', {
    get() {
      warning(false, '`triggerNode` is deprecated. Please consider decoupling data with node.')
      generateMap()
      return triggerNode
    },
  })

  Object.defineProperty(extra, 'allCheckedNodes', {
    get() {
      warning(false, '`allCheckedNodes` is deprecated. Please consider decoupling data with node.')
      generateMap()

      if (showPosition) {
        return nodeList
      }

      return (nodeList || []).map(({ node }) => node)
    },
  })
}
