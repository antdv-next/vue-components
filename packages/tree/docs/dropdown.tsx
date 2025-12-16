import type { ActionType } from '@v-c/trigger'
import type { Key } from '../src'
import Trigger from '@v-c/trigger'
import { computed, defineComponent, reactive, ref } from 'vue'
import Tree from '../src'
import { gData } from './utils/dataUtil'
import './assets/index.less'
import './dropdown.less'

const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: { adjustX: 1, adjustY: 1 },
    offset: [0, -3],
    targetOffset: [0, 0],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: { adjustX: 1, adjustY: 1 },
    offset: [0, 3],
    targetOffset: [0, 0],
  },
}

export default defineComponent(() => {
  const state = reactive({
    visible: false,
    inputValue: '',
    sel: '',
    expandedKeys: [] as Key[],
    autoExpandParent: true,
  })

  const filterKeys = ref<Key[] | null>(null)

  const triggerActions = computed<ActionType[]>(() => ['click'])

  const onChange = (event: Event) => {
    state.inputValue = (event.target as HTMLInputElement).value
    if (!state.inputValue) {
      filterKeys.value = null
      return
    }

    const expandedSet = new Set<Key>()
    const dig = (list: any[], parentKeys: Key[] = []): boolean => {
      let hasMatch = false
      list.forEach((item) => {
        const key = item.key as Key
        const matched = filterFn(String(key))
        let childMatch = false
        if (item.children?.length) {
          childMatch = dig(item.children, parentKeys.concat([key]))
        }

        if (matched || childMatch) {
          parentKeys.forEach(parentKey => expandedSet.add(parentKey))
          if (item.children?.length) {
            expandedSet.add(key)
          }
          hasMatch = true
        }
      })
      return hasMatch
    }

    dig(gData as any)
    filterKeys.value = Array.from(expandedSet)
  }

  const filterFn = (key: string) => !!(state.inputValue && key.includes(state.inputValue))

  const filterTreeNode = (treeNode: any) => filterFn(String(treeNode.key))

  const onExpand = (expandedKeys: Key[]) => {
    filterKeys.value = null
    console.log('onExpand', expandedKeys)
    state.expandedKeys = expandedKeys
    state.autoExpandParent = false
  }

  const onSelect = (_selectedKeys: Key[], info: any) => {
    console.log('selected:', info)
    state.visible = false
    state.sel = String(info.node.title ?? info.node.key)
  }

  const calcExpandedKeys = computed(() => {
    if (filterKeys.value) {
      return filterKeys.value
    }
    return state.expandedKeys
  })

  const calcAutoExpandParent = computed(() => (filterKeys.value ? true : state.autoExpandParent))

  const overlay = () => (
    <div class="demo-dropdown-tree">
      <input placeholder="请筛选 key" value={state.inputValue} onInput={onChange} />
      <div style={{ marginTop: '8px' }}>
        <Tree
          prefixCls="vc-tree"
          onExpand={onExpand as any}
          expandedKeys={calcExpandedKeys.value}
          autoExpandParent={calcAutoExpandParent.value}
          onSelect={onSelect as any}
          filterTreeNode={filterTreeNode as any}
          treeData={gData as any}
        />
      </div>
    </div>
  )

  return () => (
    <div style={{ padding: '10px 30px' }}>
      <h3>tree in dropdown</h3>
      <Trigger
        prefixCls="demo-dropdown-tree"
        popupClassName=""
        popupStyle={{}}
        builtinPlacements={builtinPlacements as any}
        action={triggerActions.value}
        popupPlacement="bottomLeft"
        popupVisible={state.visible}
        onOpenChange={(v) => {
          state.visible = v
        }}
        popup={overlay}
      >
        <div class="demo-dropdown-trigger" tabindex={0} role="button">
          {state.sel || 'Click to select'}
        </div>
      </Trigger>
    </div>
  )
})
