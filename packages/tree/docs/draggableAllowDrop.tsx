import type { Key } from '../src/interface'
import { defineComponent, reactive } from 'vue'
import Tree from '../src'
import { gData } from './utils/dataUtil'

function allowDrop({ dropNode, dropPosition }: any) {
  if (!dropNode.children) {
    if (dropPosition === 0)
      return false
  }
  return true
}

export default defineComponent(() => {
  const state = reactive({
    gData: [...gData],
    autoExpandParent: true,
    expandedKeys: ['0-0-key', '0-0-0-key', '0-0-0-0-key'] as Key[],
  })

  const onDrop = (info: any) => {
    console.log('drop', info)
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = String(info.node.pos).split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const loop = (data: any[], key: Key, callback: (item: any, index: number, arr: any[]) => void) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr)
          return
        }
        if (item.children) {
          loop(item.children, key, callback)
        }
      })
    }
    const data = [...state.gData]

    let dragObj: any
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (dropPosition === 0) {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    }
    else {
      let ar: any[] = []
      let i = 0
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      }
      else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

    state.gData = data
  }

  const onExpand = (expandedKeys: Key[]) => {
    console.log('onExpand', expandedKeys)
    state.expandedKeys = expandedKeys
    state.autoExpandParent = false
  }

  return () => (
    <div class="draggable-demo">
      <h2>draggable with allow drop</h2>
      <p>node can not be dropped inside a leaf node</p>
      <div class="draggable-container">
        <Tree
          prefixCls="vc-tree"
          allowDrop={allowDrop as any}
          expandedKeys={state.expandedKeys}
          onExpand={onExpand as any}
          autoExpandParent={state.autoExpandParent}
          draggable
          onDrop={onDrop as any}
          treeData={state.gData as any}
        />
      </div>
    </div>
  )
})
