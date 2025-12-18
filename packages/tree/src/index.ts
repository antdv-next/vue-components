import type {
  BasicDataNode,
  DataNode,
  EventDataNode,
  FieldNames,
  FlattenNode,
  Key,
  KeyEntities,
  ScrollTo,
  TreeNodeProps,
} from './interface'
import type { TreeProps, TreeRef } from './Tree'
import Tree from './Tree'
import TreeNode from './TreeNode'

export { TreeNode }

export type {
  BasicDataNode,
  DataNode,
  EventDataNode,
  FieldNames,
  FlattenNode,
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
