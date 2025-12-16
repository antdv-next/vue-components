import type { Key } from '../src'
import { defineComponent, onMounted, reactive } from 'vue'
import Tree from '../src'
import './assets/index.less'

function generateTreeNodes(key: string) {
  const arr: any[] = []
  for (let i = 0; i < 3; i += 1) {
    arr.push({ title: `leaf ${key}-${i}`, key: `${key}-${i}` })
  }
  return arr
}

function setLeaf(treeData: any[], curKey: string, level: number) {
  const loopLeaf = (data: any[], lev: number) => {
    const l = lev - 1
    data.forEach((item) => {
      if (
        item.key.length > curKey.length
          ? item.key.indexOf(curKey) !== 0
          : curKey.indexOf(item.key) !== 0
      ) {
        return
      }
      if (item.children) {
        loopLeaf(item.children, l)
      }
      else if (l < 1) {
        item.isLeaf = true
      }
    })
  }
  loopLeaf(treeData, level + 1)
}

function getNewTreeData(treeData: any[], curKey: string, child: any[], level: number) {
  const loop = (data: any[]) => {
    if (level < 1 || curKey.length - 3 > level * 2)
      return
    data.forEach((item) => {
      if (curKey.indexOf(item.key) === 0) {
        if (item.children) {
          loop(item.children)
        }
        else {
          item.children = child
        }
      }
    })
  }
  loop(treeData)
  setLeaf(treeData, curKey, level)
}

export default defineComponent(() => {
  const state = reactive({
    treeData: [] as any[],
    checkedKeys: ['0-0'] as Key[],
  })

  onMounted(() => {
    setTimeout(() => {
      state.treeData = [
        { title: 'pNode 01', key: '0-0' },
        { title: 'pNode 02', key: '0-1' },
        { title: 'pNode 03', key: '0-2', isLeaf: true },
      ]
      state.checkedKeys = ['0-0']
    }, 100)
  })

  const onSelect = (_selectedKeys: Key[], info: any) => {
    console.log('selected', info)
  }

  const onCheck = (checkedKeys: Key[]) => {
    console.log(checkedKeys)
    state.checkedKeys = checkedKeys
  }

  const onLoadData = (treeNode: any) => {
    console.log('load data...', treeNode)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const treeData = [...state.treeData]
        getNewTreeData(treeData, treeNode.key, generateTreeNodes(treeNode.key), 2)
        state.treeData = treeData
        resolve()
      }, 500)
    })
  }

  return () => (
    <div style={{ padding: '0 20px' }}>
      <h2>dynamic render</h2>
      <Tree
        prefixCls="vc-tree"
        onSelect={onSelect as any}
        checkable
        onCheck={onCheck as any}
        checkedKeys={state.checkedKeys}
        loadData={onLoadData as any}
        treeData={state.treeData}
      />
    </div>
  )
})
