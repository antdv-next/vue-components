import { defineComponent } from 'vue'
import TreeSelect, { TreeNode } from '../src'
import './assets/index.less'

const treeData = [
  {
    title: 'a list is option only',
    showTitle: 'Node2',
    value: '0-1',
  },
]

export default defineComponent({
  name: 'TreeSelectTreeNodeLabelPropDemo',
  setup() {
    return () => (
      <div style={{ margin: '20px' }}>
        <TreeSelect
          style={{ width: '100%' }}
          treeDefaultExpandAll
          treeData={treeData as any}
          treeNodeLabelProp="showTitle"
        />

        <div style={{ height: '12px' }} />

        <TreeSelect style={{ width: '100%' }} treeDefaultExpandAll treeNodeLabelProp="showTitle">
          <TreeNode value="0-0" title="a list is option only" showTitle="Node2" key="0-0" />
        </TreeSelect>
      </div>
    )
  },
})
