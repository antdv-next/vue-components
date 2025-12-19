import type {
  BasicDataNode,
  DataEntity,
  DataNode,
  EventDataNode,
  FieldNames,
  FlattenNode,
  IconType,
  Key,
  KeyEntities,
  ScrollTo,
  TreeNodeProps,
} from './interface'
import type { ExpandAction, TreeProps, TreeRef } from './Tree'
import Tree from './Tree'
import TreeNode from './TreeNode'

export { TreeNode }
export { UnstableContextKey } from './contextTypes'
export { conductCheck } from './utils/conductUtil'
export { convertDataToEntities, fillFieldNames, flattenTreeData } from './utils/treeUtil'

export type {
  BasicDataNode,
  DataEntity,
  DataNode,
  EventDataNode,
  ExpandAction,
  FieldNames,
  FlattenNode,
  IconType,
  Key,
  KeyEntities,
  ScrollTo,
  TreeNodeProps,
  TreeProps,
  TreeRef,
}

type TreeType = typeof Tree & {
  TreeNode: typeof TreeNode
}

const ExportTree = Tree as TreeType
ExportTree.TreeNode = TreeNode

export default ExportTree
