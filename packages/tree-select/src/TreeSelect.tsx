import type { DataNode } from './interface.ts'
import { defineComponent } from 'vue'

export interface SearchConfig {
  searchValue?: string
  onSearch?: (value: string) => void
  autoClearSearchValue?: boolean
  filterTreeNode?: boolean | ((inputValue: string, treeNode: DataNode) => boolean)
  treeNodeFilterProp?: string
}
export interface TreeSelectProps<ValueType = any, OptionType extends DataNode = DataNode>
  extends Omit<BaseSelectPropsWithoutPrivate, 'mode' | 'classNames' | 'styles' | 'showSearch'> {
  prefixCls?: string
  id?: string
}

const defaults = {
  prefixCls: 'vc-tree-select',
  listHeight: 200,
  listItemHeight: 20,
  listItemScrollOffset: 0,
  popupMatchSelectWidth: true,
} as any

const TreeSelect = defineComponent<
  TreeSelectProps
>(
  (props = defaults, { slots, attrs, expose, emit }) => {
    return () => {
      return null
    }
  },
  {
    name: 'TreeSelect',
    inheritAttrs: false,
  },
)

export default TreeSelect
