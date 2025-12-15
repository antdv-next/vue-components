import { defineComponent } from 'vue'
import Tree, { TreeNode } from '../src'

export default defineComponent(() => {
  return () => (
    <div class="expandAction-demo">
      <h2>expandAction</h2>
      <p>expand on click, even selectable is false</p>
      <Tree prefixCls="vc-tree" defaultExpandedKeys={['0-0']} expandAction="click" selectable={false}>
        <TreeNode title="parent 1" key="0-0">
          <TreeNode
            title="click title can trigger expand even selectable is false because expandAction is 'click'"
            key="0-0-0"
          >
            <TreeNode title="leaf-1" key="0-0-0-0" />
          </TreeNode>
        </TreeNode>
      </Tree>
    </div>
  )
})
