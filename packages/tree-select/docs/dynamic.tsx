import { defineComponent, ref } from 'vue'
import TreeSelect from '../src'
import './assets/index.less'
import { generateTreeNodes, getNewTreeData } from './utils/dataUtil'

function getTreeData() {
  return [
    { label: 'pNode 01', value: '0-0', key: '0-0' },
    { label: 'pNode 02', value: '0-1', key: '0-1' },
    { label: 'pNode 03', value: '0-2', key: '0-2', isLeaf: true },
  ]
}

export default defineComponent({
  name: 'TreeSelectDynamicDemo',
  setup() {
    const treeData = ref<any[]>(getTreeData())
    const value = ref<any>({ value: '0-0-0-value', label: '0-0-0-label' })
    const loadedKeys = ref<string[]>([])

    const loadData = (treeNode: any) => {
      console.log('trigger load:', treeNode)
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const next = treeData.value.slice()
          const curKey = String(treeNode.key)
          getNewTreeData(next, curKey, generateTreeNodes({ key: curKey }), 2)
          treeData.value = next
          resolve()
        }, 500)
      })
    }

    const onTreeLoad = (nextLoadedKeys: string[]) => {
      loadedKeys.value = nextLoadedKeys
    }

    const onResetTree = () => {
      treeData.value = getTreeData()
    }

    const onResetLoadedKeys = () => {
      loadedKeys.value = []
    }

    return () => (
      <div style={{ padding: '10px 30px' }}>
        <h2>dynamic render</h2>
        <TreeSelect
          style={{ width: '300px' }}
          treeData={treeData.value as any}
          labelInValue
          value={value.value as any}
          onChange={(val: any) => {
            value.value = val
          }}
          loadData={loadData as any}
        />

        <h2>Controlled</h2>
        <TreeSelect
          style={{ width: '300px' }}
          treeData={treeData.value as any}
          labelInValue
          showSearch
          value={value.value as any}
          treeLoadedKeys={loadedKeys.value as any}
          onChange={(val: any) => {
            value.value = val
          }}
          loadData={loadData as any}
          onTreeLoad={onTreeLoad as any}
        />

        <button type="button" onClick={onResetTree} style={{ marginTop: '10px' }}>
          Reset Tree
        </button>
        <button type="button" onClick={onResetLoadedKeys} style={{ marginLeft: '10px', marginTop: '10px' }}>
          Reset LoadedKeys
        </button>
      </div>
    )
  },
})

