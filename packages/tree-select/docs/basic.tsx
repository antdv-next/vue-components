import { defineComponent, ref } from 'vue'
import TreeSelect, { SHOW_PARENT } from '../src'
import { gData } from './utils/dataUtil'
import './assets/index.less'

function isLeaf(value: string | undefined) {
  if (!value) {
    return false
  }
  let queues: any[] = [...gData]
  while (queues.length) {
    // BFS
    const item = queues.shift()
    if (item.value === value) {
      return !item.children
    }
    if (item.children) {
      queues = queues.concat(item.children)
    }
  }
  return false
}

function findPath(value: string, data: any[]) {
  const sel: any[] = []
  function loop(selected: string, children: any[]) {
    for (let i = 0; i < children.length; i += 1) {
      const item = children[i]
      if (selected === item.value) {
        sel.push(item)
        return
      }
      if (item.children) {
        loop(selected, item.children)
        if (sel.length) {
          sel.push(item)
          return
        }
      }
    }
  }
  loop(value, data)
  return sel
}

export default defineComponent({
  name: 'TreeSelectBasicDemo',
  setup() {
    const tsOpen = ref(false)
    const searchValue = ref('0-0-0-label')
    const value = ref<string | undefined>('0-0-0-value')

    const lv = ref<any>({ value: '0-0-0-value', label: 'spe label' })

    const multipleValue = ref<string[]>([])
    const checkedValue = ref<string[]>(['0-0-0-value'])

    const simpleValue = ref<string | undefined>('test111')
    const simpleTreeData = ref<any[]>([
      { id: 1, pId: 0, label: 'test1', value: 'test1', key: 'test1' },
      { id: 121, pId: 0, label: 'test2', value: 'test2', key: 'test2' },
      { id: 11, pId: 1, label: 'test11', value: 'test11', key: 'test11' },
      { id: 12, pId: 1, label: 'test12', value: 'test12', key: 'test12' },
      { id: 111, pId: 11, label: 'test111', value: 'test111', key: 'test111' },
    ])

    const treeDataSimpleMode = {
      id: 'id',
      rootPId: 0,
    } as const

    const onSearch = (val: string, ...args: any[]) => {
      console.log('Do Search:', val, ...args)
      searchValue.value = val
    }

    const onChange = (val: any, ...rest: any[]) => {
      console.log('onChange', val, ...rest)
      value.value = val
    }

    const onChangeChildren = (val: any, ...args: any[]) => {
      const preValue = value.value
      console.log('onChangeChildren', val, ...args)

      if (!val) {
        value.value = undefined
        return
      }

      value.value = isLeaf(val) ? val : preValue
    }

    const onChangeLV = (next: any, ...args: any[]) => {
      console.log('labelInValue', next, ...args)
      if (!next) {
        lv.value = undefined
        return
      }
      const path = findPath(next.value, gData)
        .map(i => i.label)
        .reverse()
        .join(' > ')
      lv.value = { value: next.value, label: path }
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>single select (controlled open + search)</h2>
        <TreeSelect
          transitionName="vc-tree-select-dropdown-slide-up"
          choiceTransitionName="vc-tree-select-selection__choice-zoom"
          style={{ width: '300px' }}
          placeholder={<i>请下拉选择</i>}
          showSearch
          allowClear
          treeLine
          searchValue={searchValue.value}
          value={value.value as any}
          treeData={gData as any}
          treeNodeFilterProp="label"
          filterTreeNode={false}
          onSearch={onSearch}
          open={tsOpen.value}
          onChange={onChange as any}
          onPopupVisibleChange={(open: any) => {
            console.log('single onPopupVisibleChange', open)
            tsOpen.value = open
          }}
          onPopupScroll={(evt: any) => {
            console.log('onPopupScroll:', (evt.target as any))
          }}
        />

        <h2>single select (just select children)</h2>
        <TreeSelect
          style={{ width: '300px' }}
          transitionName="vc-tree-select-dropdown-slide-up"
          choiceTransitionName="vc-tree-select-selection__choice-zoom"
          placeholder={<i>请下拉选择</i>}
          showSearch
          allowClear
          treeLine
          value={value.value as any}
          treeData={gData as any}
          treeNodeFilterProp="label"
          filterTreeNode={false}
          onChange={onChangeChildren as any}
        />

        <h2>multiple select</h2>
        <TreeSelect
          style={{ width: '300px' }}
          transitionName="vc-tree-select-dropdown-slide-up"
          choiceTransitionName="vc-tree-select-selection__choice-zoom"
          multiple
          value={multipleValue.value as any}
          treeData={gData as any}
          treeNodeFilterProp="label"
          allowClear
          onChange={(val: any) => {
            multipleValue.value = val
          }}
        />

        <h2>check select</h2>
        <TreeSelect
          open
          allowClear
          style={{ width: '300px' }}
          className="check-select"
          transitionName="vc-tree-select-dropdown-slide-up"
          choiceTransitionName="vc-tree-select-selection__choice-zoom"
          placeholder={<i>请下拉选择</i>}
          treeLine
          popupAlign={{
            overflow: { adjustY: 0, adjustX: 0 },
            offset: [0, 2],
          }}
          maxTagTextLength={10}
          value={checkedValue.value as any}
          treeData={gData as any}
          treeNodeFilterProp="label"
          treeCheckable
          maxTagCount="responsive"
          showCheckedStrategy={SHOW_PARENT}
          onChange={(val: any) => {
            checkedValue.value = val
          }}
        />

        <h2>labelInValue</h2>
        <TreeSelect
          style={{ width: '300px' }}
          placeholder={<i>请下拉选择</i>}
          showSearch
          allowClear
          treeLine
          labelInValue
          value={lv.value as any}
          treeData={gData as any}
          treeNodeFilterProp="label"
          filterTreeNode={false}
          onChange={onChangeLV as any}
        />

        <h2>treeDataSimpleMode</h2>
        <TreeSelect
          style={{ width: '300px' }}
          placeholder={<i>请下拉选择</i>}
          showSearch
          allowClear
          treeLine
          value={simpleValue.value as any}
          treeData={simpleTreeData.value as any}
          treeDefaultExpandAll
          treeNodeFilterProp="label"
          treeDataSimpleMode={treeDataSimpleMode as any}
          onChange={(val: any) => {
            simpleValue.value = val
          }}
        />
      </div>
    )
  },
})
