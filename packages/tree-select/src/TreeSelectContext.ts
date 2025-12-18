import type { DataNode, FieldNames, Key } from './interface'

export interface TreeSelectContextProps {
  virtual?: boolean
  popupMatchSelectWidth?: boolean | number
  listHeight: number
  listItemHeight: number
  listItemScrollOffset?: number
  treeData: DataNode[]
  fieldNames: FieldNames
  onSelect: (value: Key, info: { selected: boolean }) => void
  treeExpandAction?: ExpandAction
  treeTitleRender?: (node: any) => any
  onPopupScroll?: (event: UIEvent) => void
  // For `maxCount` usage
  leftMaxCount: number | null
  /** When `true`, only take leaf node as count, or take all as count with `maxCount` limitation */
  leafCountOnly: boolean
  classNames: TreeSelectProps['classNames']
  styles: TreeSelectProps['styles']
}
