import type { Ref } from 'vue'
import type { DataNode, FieldNames } from '../interface'
import type { TreeSelectProps } from '../TreeSelect'
import { computed } from 'vue'
import { fillLegacyProps } from '../utils/legacyUtil'

type FilterFn = NonNullable<TreeSelectProps['filterTreeNode']>

export default function useFilterTreeData(
  treeData: Ref<DataNode[]>,
  searchValue: Ref<string>,
  options: {
    fieldNames: Ref<FieldNames>
    treeNodeFilterProp: Ref<string>
    filterTreeNode: Ref<TreeSelectProps['filterTreeNode']>
  },
): Ref<DataNode[]> {
  return computed(() => {
    const { children: fieldChildren } = options.fieldNames.value
    const mergedSearchValue = searchValue.value

    if (!mergedSearchValue || options.filterTreeNode.value === false) {
      return treeData.value
    }

    const filterOptionFunc: FilterFn
      = typeof options.filterTreeNode.value === 'function'
        ? options.filterTreeNode.value
        : (_, dataNode) =>
            String(dataNode[options.treeNodeFilterProp.value]).toUpperCase().includes(mergedSearchValue.toUpperCase())

    const filterTreeNodes = (nodes: DataNode[], keepAll = false): DataNode[] =>
      nodes.reduce<DataNode[]>((filtered, node) => {
        const children = (node as any)[fieldChildren as any] as DataNode[] | undefined
        const isMatch = keepAll || filterOptionFunc(mergedSearchValue, fillLegacyProps(node))
        const filteredChildren = filterTreeNodes(children || [], isMatch)

        if (isMatch || filteredChildren.length) {
          filtered.push({
            ...node,
            isLeaf: undefined,
            [fieldChildren as any]: filteredChildren,
          })
        }
        return filtered
      }, [])

    return filterTreeNodes(treeData.value)
  })
}
