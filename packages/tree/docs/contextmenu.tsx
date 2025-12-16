import type { Key } from '../src/interface'
import { defineComponent, onBeforeUnmount, reactive, ref, Teleport } from 'vue'
import Tree, { TreeNode } from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const state = reactive({
    selectedKeys: ['0-1', '0-1-1'] as Key[],
    menuVisible: false,
    menuX: 0,
    menuY: 0,
    menuTitle: '',
  })

  const onSelect = (selectedKeys: Key[]) => {
    state.selectedKeys = selectedKeys
  }

  const onRightClick = (info: any) => {
    console.log('right click', info)
    state.selectedKeys = [info.node.key]
    state.menuVisible = true
    state.menuX = (info.event as MouseEvent).pageX
    state.menuY = (info.event as MouseEvent).pageY
    state.menuTitle = String(info.node.title ?? info.node.key)
  }

  const hide = () => {
    state.menuVisible = false
  }

  const onGlobalClick = () => hide()
  window.addEventListener('click', onGlobalClick)
  onBeforeUnmount(() => {
    window.removeEventListener('click', onGlobalClick)
  })

  const hoverTip = reactive({
    visible: false,
    x: 0,
    y: 0,
    title: '',
  })
  const hoverTimer = ref<number>()

  const onMouseEnter = (info: any) => {
    window.clearTimeout(hoverTimer.value)
    hoverTip.visible = true
    hoverTip.x = (info.event as MouseEvent).pageX + 12
    hoverTip.y = (info.event as MouseEvent).pageY + 12
    hoverTip.title = String(info.node.title ?? info.node.key)
  }

  const onMouseLeave = () => {
    hoverTimer.value = window.setTimeout(() => {
      hoverTip.visible = false
    }, 100)
  }

  return () => (
    <div style={{ padding: '0 20px' }}>
      <h2>right click contextmenu</h2>
      <Tree
        prefixCls="vc-tree"
        onRightClick={onRightClick as any}
        onSelect={onSelect as any}
        selectedKeys={state.selectedKeys}
        multiple
        defaultExpandAll
        showLine
        showIcon={false}
      >
        <TreeNode title="parent 1" key="0-1">
          <TreeNode title="parent 1-0" key="0-1-1">
            <TreeNode title="leaf0" key="l0" isLeaf />
            <TreeNode title="leaf1" key="l1" isLeaf />
            <TreeNode title="leaf2" key="l2" isLeaf />
          </TreeNode>
          <TreeNode title="parent 1-1" key="1-1">
            <TreeNode title="leaf" key="l11" isLeaf />
          </TreeNode>
        </TreeNode>
      </Tree>

      <h2>hover popup</h2>
      <Tree
        prefixCls="vc-tree"
        onMouseEnter={onMouseEnter as any}
        onMouseLeave={onMouseLeave as any}
        onSelect={onSelect as any}
        multiple
        defaultExpandAll
        showLine
      >
        <TreeNode title="parent 1" key="0-1">
          <TreeNode title="parent 1-0" key="0-1-1">
            <TreeNode title="leaf" key="100" isLeaf />
            <TreeNode title="leaf" key="101" />
          </TreeNode>
          <TreeNode title="parent 1-1" key="11">
            <TreeNode title="leaf" key="110" />
          </TreeNode>
        </TreeNode>
      </Tree>

      <Teleport to="body">
        {state.menuVisible && (
          <div class="vc-tree-contextmenu" style={{ left: `${state.menuX}px`, top: `${state.menuY}px` }}>
            <div style={{ fontWeight: 600 }}>{state.menuTitle}</div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  alert(`Clicked: ${state.menuTitle}`)
                  hide()
                }}
              >
                Action
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  hide()
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {hoverTip.visible && (
          <div class="vc-tree-contextmenu" style={{ left: `${hoverTip.x}px`, top: `${hoverTip.y}px`, padding: '6px 8px' }}>
            {hoverTip.title}
          </div>
        )}
      </Teleport>
    </div>
  )
})
