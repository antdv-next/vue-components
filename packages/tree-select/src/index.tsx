import type { TreeSelectProps } from './TreeSelect'
import TreeNode from './TreeNode'
import TreeSelect from './TreeSelect'
import { SHOW_ALL, SHOW_CHILD, SHOW_PARENT } from './utils/strategyUtil'

export { SHOW_ALL, SHOW_CHILD, SHOW_PARENT, TreeNode }

export type { TreeSelectProps }

type TreeSelectType = typeof TreeSelect & {
  TreeNode: typeof TreeNode
  SHOW_ALL: typeof SHOW_ALL
  SHOW_PARENT: typeof SHOW_PARENT
  SHOW_CHILD: typeof SHOW_CHILD
}

const ExportTreeSelect = TreeSelect as TreeSelectType
ExportTreeSelect.TreeNode = TreeNode
ExportTreeSelect.SHOW_ALL = SHOW_ALL
ExportTreeSelect.SHOW_PARENT = SHOW_PARENT
ExportTreeSelect.SHOW_CHILD = SHOW_CHILD

export default ExportTreeSelect
export type { DataNode } from './interface'
