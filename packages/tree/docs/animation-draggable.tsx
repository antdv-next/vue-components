import type { CSSMotionProps } from '@v-c/util/dist/utils/transition.ts'
import type { Key } from '../src'
import { defineComponent, reactive } from 'vue'
import Tree from '../src'
import { gData } from './utils/dataUtil'
import './assets/index.less'
import './animation.less'

const motion: CSSMotionProps = {
  name: 'node-motion',
  appear: false,
  onBeforeEnter(el) {
    const _el = el as HTMLElement
    if (_el) {
      _el.style.height = '0px'
    }
  },
  onEnter(el) {
    const _el = el as HTMLElement
    if (_el) {
      _el.style.height = `${_el.scrollHeight}px`
    }
  },
  onBeforeLeave(el) {
    const _el = el as HTMLElement
    if (_el) {
      _el.style.height = `${_el.offsetHeight}px`
    }
  },
  onAfterLeave(el) {
    const _el = el as HTMLElement
    if (_el) {
      _el.style.height = ''
    }
  },
}

export default defineComponent(() => {
  const state = reactive({
    gData: [...gData],
    autoExpandParent: true,
    expandedKeys: ['0-0-key', '0-0-0-key', '0-0-0-0-key'] as Key[],
  })

  const onDragEnter = ({ expandedKeys }: any) => {
    console.log('enter', expandedKeys)
    state.expandedKeys = expandedKeys
  }

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

    if (!info.dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.push(dragObj)
      })
    }
    else if (
      (info.node.children || []).length > 0
      && info.node.expanded
      && dropPosition === 1
    ) {
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
    <div class="draggable-demo" style={{ padding: '0 20px' }}>
      <h2>animation draggable</h2>
      <p>drag a node into another node</p>
      <Tree
        prefixCls="vc-tree"
        expandedKeys={state.expandedKeys}
        onExpand={onExpand as any}
        autoExpandParent={state.autoExpandParent}
        draggable
        onDragEnter={onDragEnter as any}
        onDrop={onDrop as any}
        treeData={state.gData as any}
        motion={motion}
      />
    </div>
  )
})
