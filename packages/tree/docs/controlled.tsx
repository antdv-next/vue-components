import type { Key } from '../src/interface'
import { defineComponent, reactive } from 'vue'
import Tree, { TreeNode } from '../src'
import { gData, getRadioSelectKeys } from './utils/dataUtil'
import './assets/index.less'

export default defineComponent(() => {
  const state = reactive({
    expandedKeys: ['0-0-0-key'] as Key[],
    autoExpandParent: true,
    checkedKeys: ['0-0-0-key'] as Key[],
    checkStrictlyKeys: { checked: ['0-0-1-key'] as Key[], halfChecked: [] as Key[] },
    selectedKeys: [] as Key[],
  })

  const onExpand = (expandedKeys: Key[]) => {
    console.log('onExpand', expandedKeys)
    state.expandedKeys = expandedKeys
    state.autoExpandParent = false
  }

  const onCheck = (checkedKeys: Key[]) => {
    state.checkedKeys = checkedKeys
  }

  const onCheckStrictly = (checkedKeys: any) => {
    const cks = {
      checked: checkedKeys.checked || checkedKeys,
      halfChecked: [`0-0-${Math.floor(Math.random() * 3)}-key`] as Key[],
    }
    state.checkStrictlyKeys = cks
  }

  const onSelect = (selectedKeys: Key[], info: any) => {
    console.log('onSelect', selectedKeys, info)
    state.selectedKeys = selectedKeys
  }

  const onRbSelect = (selectedKeys: Key[], info: any) => {
    let newSelectedKeys = selectedKeys
    if (info.selected) {
      newSelectedKeys = getRadioSelectKeys(gData, selectedKeys as any, info.node.key as any) as any
    }
    state.selectedKeys = newSelectedKeys
  }

  const triggerChecked = () => {
    state.checkedKeys = [`0-0-${Math.floor(Math.random() * 3)}-key`]
  }

  const loop = (data: any[]) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title} disableCheckbox={item.key === '0-0-0-key'}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.key} title={item.title} />
    })

  return () => (
    <div style={{ padding: '0 20px' }}>
      <h2>controlled</h2>
      <Tree
        prefixCls="vc-tree"
        checkable
        onExpand={onExpand as any}
        expandedKeys={state.expandedKeys}
        autoExpandParent={state.autoExpandParent}
        onCheck={onCheck as any}
        checkedKeys={state.checkedKeys}
        onSelect={onSelect as any}
        selectedKeys={state.selectedKeys}
      >
        {loop(gData)}
      </Tree>
      <button type="button" onClick={triggerChecked}>
        trigger checked
      </button>

      <h2>checkStrictly</h2>
      <Tree
        prefixCls="vc-tree"
        checkable
        defaultExpandAll
        onExpand={onExpand as any}
        expandedKeys={state.expandedKeys}
        onCheck={onCheckStrictly as any}
        checkedKeys={state.checkStrictlyKeys as any}
        checkStrictly
      >
        {loop(gData)}
      </Tree>

      <h2>radio behavior select (same level)</h2>
      <Tree prefixCls="vc-tree" multiple defaultExpandAll onSelect={onRbSelect as any} selectedKeys={getRadioSelectKeys(gData, state.selectedKeys as any) as any}>
        {loop(gData)}
      </Tree>
    </div>
  )
})
