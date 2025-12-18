import type { Ref } from 'vue'
import type { DataNode, SimpleModeConfig } from '../interface'
import { computed } from 'vue'

function buildTreeStructure(nodes: DataNode[], config: SimpleModeConfig): DataNode[] {
  const { id, pId, rootPId } = config
  const nodeMap = new Map<any, DataNode>()
  const rootNodes: DataNode[] = []

  nodes.forEach((node) => {
    const nodeKey = (node as any)[id as any]
    const clonedNode = { ...node, key: node.key || nodeKey }
    nodeMap.set(nodeKey, clonedNode)
  })

  nodeMap.forEach((node) => {
    const parentKey = (node as any)[pId as any]
    const parent = nodeMap.get(parentKey)

    if (parent) {
      parent.children = parent.children || []
      parent.children.push(node)
    }
    else if (parentKey === rootPId || rootPId === null) {
      rootNodes.push(node)
    }
  })

  return rootNodes
}

/**
 * Convert `treeData` by `simpleMode` config.
 */
export default function useTreeData(
  treeData: Ref<DataNode[]>,
  simpleMode: Ref<boolean | SimpleModeConfig | undefined>,
): Ref<DataNode[]> {
  return computed(() => {
    if (simpleMode.value) {
      const config: SimpleModeConfig = {
        id: 'id',
        pId: 'pId',
        rootPId: null,
        ...(typeof simpleMode.value === 'object' ? simpleMode.value : {}),
      }
      return buildTreeStructure(treeData.value, config)
    }

    return treeData.value
  })
}
