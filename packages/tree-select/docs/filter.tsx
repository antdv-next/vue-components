import { defineComponent, ref } from 'vue'
import TreeSelect, { SHOW_PARENT } from '../src'
import { gData } from './utils/dataUtil'
import './assets/index.less'

export default defineComponent({
  name: 'TreeSelectFilterDemo',
  setup() {
    const value = ref<string[]>(['0-0-0-value'])

    const simpleValue = ref<string[]>(['a12'])
    const simpleTreeData = ref<any[]>([
      { id: 1, pId: 0, label: 'a', value: 'a', key: 'a' },
      { id: 11, pId: 1, label: 'a12', value: 'a12', key: 'a12', disabled: true },
      { id: 111, pId: 11, label: 'a00', value: 'a00', key: 'a00', selectable: false },
      { id: 2, pId: 0, label: 'b', value: 'b', key: 'b' },
      { id: 20, pId: 2, label: 'b10', value: 'b10', key: 'b10' },
      { id: 21, pId: 2, label: 'b1', value: 'b1', key: 'b1' },
      { id: 22, pId: 2, label: 'b12', value: 'b12', key: 'b12' },
    ])

    const treeDataSimpleMode = {
      id: 'id',
      rootPId: 0,
    } as const

    const onDataChange = () => {
      const data = simpleTreeData.value.slice()
      data.forEach((i) => {
        if (i.id === 11) {
          delete i.disabled
        }
        if (i.id === 20) {
          i.disabled = true
        }
      })
      simpleTreeData.value = data
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>check select</h2>
        <TreeSelect
          style={{ width: '300px' }}
          placeholder={<i>请下拉选择</i>}
          treeLine
          maxTagTextLength={10}
          value={value.value as any}
          treeData={gData as any}
          treeNodeFilterProp="label"
          treeCheckable
          onChange={(val: any) => {
            value.value = val
          }}
        />

        <h2>use treeDataSimpleMode</h2>
        <TreeSelect
          style={{ width: '300px' }}
          popupStyle={{ maxHeight: '200px', overflow: 'auto' }}
          placeholder={<i>请下拉选择</i>}
          treeLine
          maxTagTextLength={10}
          inputValue={null}
          value={simpleValue.value as any}
          treeData={simpleTreeData.value as any}
          treeDefaultExpandAll
          treeNodeFilterProp="label"
          treeDataSimpleMode={treeDataSimpleMode as any}
          treeCheckable
          showCheckedStrategy={SHOW_PARENT}
          onChange={(val: any) => {
            simpleValue.value = val
          }}
        />
        <button type="button" onClick={onDataChange} style={{ marginTop: '10px' }}>
          change data
        </button>
      </div>
    )
  },
})
