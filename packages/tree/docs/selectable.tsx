import { defineComponent } from 'vue'
import Tree, { TreeNode } from '../src'

export default defineComponent(() => {
  return () => (
    <div class="selectable-demo">
      <h2>selectable</h2>
      <p>some nodes are not selectable</p>
      <div>
        <Tree prefixCls="vc-tree" defaultExpandAll showLine>
          <TreeNode title="root node" key="0-0">
            <TreeNode title="parent 1 default value(true)" key="0-0-0">
              <TreeNode title="inherit selectable" key="0-0-0-0" />
              <TreeNode selectable title="set selectable is true" key="0-0-0-1" />
            </TreeNode>
            <TreeNode title="parent 2 selectable is false" selectable={false} key="0-0-1">
              <TreeNode selectable={false} title="inherit selectable=false" key="0-0-1-0" />
              <TreeNode selectable title="override selectable=true" key="0-0-1-1" />
            </TreeNode>
            <TreeNode title="parent 3 disabled" key="0-0-2" disabled>
              <TreeNode selectable={false} title="parent disabled + selectable=false" key="0-0-2-0" />
              <TreeNode selectable title="parent disabled + selectable=true" key="0-0-2-1" />
            </TreeNode>
          </TreeNode>
        </Tree>
      </div>

      <p>custom style when unselectable</p>
      <div class="selectable-container">
        <Tree prefixCls="vc-tree" defaultExpandAll showLine>
          <TreeNode title="root node" key="1-0">
            <TreeNode title="parent 1 default value(true)" key="1-0-0">
              <TreeNode title="inherit selectable" key="1-0-0-0" />
              <TreeNode selectable title="set selectable is true" key="1-0-0-1" />
            </TreeNode>
            <TreeNode title="parent 2 selectable is false" selectable={false} key="1-0-1">
              <TreeNode selectable={false} title="inherit selectable=false" key="1-0-1-0" />
              <TreeNode selectable title="override selectable=true" key="1-0-1-1" />
            </TreeNode>
          </TreeNode>
        </Tree>
      </div>
    </div>
  )
})
