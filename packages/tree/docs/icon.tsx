import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import Tree, { TreeNode } from '../src'

const Icon = (props: any) => <span class={clsx('customize-icon', props.selected && 'selected-icon')} />

export default defineComponent(() => {
  return () => (
    <div style={{ padding: '0 20px' }}>
      <h2>Customize icon with element</h2>
      <Tree prefixCls="vc-tree" defaultExpandAll>
        <TreeNode icon={<span class="customize-icon" />} title="Parent">
          <TreeNode icon={<span class="customize-icon sub-icon" />} title="Child" />
        </TreeNode>
      </Tree>

      <h2>Customize icon with component</h2>
      <Tree prefixCls="vc-tree" defaultExpandAll>
        <TreeNode icon={Icon as any} title="Parent">
          <TreeNode icon={Icon as any} title="Child" />
        </TreeNode>
      </Tree>

      <h2>Customize icon with Tree prop</h2>
      <Tree prefixCls="vc-tree" defaultExpandAll icon={Icon as any}>
        <TreeNode title="Parent">
          <TreeNode title="Child" />
        </TreeNode>
      </Tree>
    </div>
  )
})
