import type { DataEntity, ExpandAction } from '@v-c/tree'
import type { Ref } from 'vue'
import type { DataNode, FieldNames, Key, SelectSource } from './interface'
import type { TreeSelectProps } from './TreeSelect'
import { inject, provide, ref } from 'vue'

export interface TreeSelectContextProps {
  virtual?: boolean
  popupMatchSelectWidth?: boolean | number
  listHeight: number
  listItemHeight: number
  listItemScrollOffset?: number
  treeData: DataNode[]
  fieldNames: FieldNames
  onSelect: (value: Key, info: { selected: boolean, source?: SelectSource }) => void
  treeExpandAction?: ExpandAction
  treeTitleRender?: (node: any) => any
  onPopupScroll?: (event: Event) => void

  // For `maxCount` usage
  leftMaxCount: number | null
  /** When `true`, only take leaf node as count, or take all as count with `maxCount` limitation */
  leafCountOnly: boolean
  valueEntities: Map<Key, DataEntity>
  classNames?: TreeSelectProps['classNames']
  styles?: TreeSelectProps['styles']
}

const TreeSelectContextKey = Symbol('TreeSelectContext')

export function useTreeSelectProvider(value: Ref<TreeSelectContextProps>) {
  provide(TreeSelectContextKey, value)
}

export function useTreeSelectContext() {
  return inject(TreeSelectContextKey, ref(null) as any) as Ref<TreeSelectContextProps | null>
}
