import type { Key } from '../src/interface'
import type { DemoDataNode } from './utils/dataUtil'
import { defineComponent, reactive } from 'vue'
import Tree, { TreeNode } from '../src'
import BigDataGenerator from './BigDataGenerator'
import './assets/index.less'

export default defineComponent(() => {
  const state = reactive({
    gData: [] as DemoDataNode[],
    expandedKeys: ['0-0-0-key'] as Key[],
    checkedKeys: ['0-0-0-key'] as Key[],
    checkedKeysStrict: ['0-0-0-key'] as any,
    selectedKeys: [] as Key[],
  })

  const onGen = (data: DemoDataNode[]) => {
    state.gData = data
    state.expandedKeys = ['0-0-0-key']
    state.checkedKeys = ['0-0-0-key']
    state.checkedKeysStrict = ['0-0-0-key']
    state.selectedKeys = []
  }

  const onCheck = (checkedKeys: Key[]) => {
    state.checkedKeys = checkedKeys
  }

  const onCheckStrictly = (checkedKeys1: any) => {
    console.log(checkedKeys1)
    state.checkedKeysStrict = checkedKeys1
  }

  const onSelect = (selectedKeys: Key[], info: any) => {
    console.log('onSelect', selectedKeys, info)
    state.selectedKeys = selectedKeys
  }

  const loop = (data: DemoDataNode[]) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.key} title={item.title} />
    })

  return () => (
    <div style={{ padding: '0 20px' }}>
      <BigDataGenerator onGen={onGen as any} />
      <div style={{ border: '1px solid red', width: '700px', padding: '10px' }}>
        <h5 style={{ margin: '10px' }}>大数据量下优化建议：</h5>
        初始展开的节点少，向dom中插入节点就会少，速度更快。
        <br />
        treeNodes 总数据量尽量少变化，缓存并复用计算出的 treeNodes。
        <br />
      </div>

      {state.gData.length
        ? (
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ marginRight: '20px' }}>
                <h3>normal check</h3>
                <Tree
                  prefixCls="vc-tree"
                  checkable
                  defaultExpandedKeys={state.expandedKeys}
                  onCheck={onCheck as any}
                  checkedKeys={state.checkedKeys as any}
                  onSelect={onSelect as any}
                  selectedKeys={state.selectedKeys}
                >
                  {loop(state.gData)}
                </Tree>
              </div>
              <div>
                <h3>checkStrictly</h3>
                <Tree
                  prefixCls="vc-tree"
                  checkable
                  checkStrictly
                  defaultExpandedKeys={state.expandedKeys}
                  onCheck={onCheckStrictly as any}
                  checkedKeys={state.checkedKeysStrict as any}
                  onSelect={onSelect as any}
                  selectedKeys={state.selectedKeys}
                >
                  {loop(state.gData)}
                </Tree>
              </div>
            </div>
          )
        : null}
    </div>
  )
})
