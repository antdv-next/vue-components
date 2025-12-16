import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import Tree, { TreeNode } from '../src'
import './assets/index.less'
import './icon.less'

const Icon = (props: any) => <span class={clsx('customize-icon', props.selected && 'selected-icon')} />

export default defineComponent(() => {
  return () => (
    <div style={{ padding: '0 20px' }}>
      <h2>Customize icon with element</h2>
      <Tree prefixCls="vc-tree" defaultExpandAll>
        <TreeNode key="0-0" icon={<span class="customize-icon" />} title="Parent">
          <TreeNode key="0-0-0" icon={<span class="customize-icon sub-icon" />} title="Child" />
        </TreeNode>
      </Tree>

      <h2>Customize icon with component</h2>
      <Tree prefixCls="vc-tree" defaultExpandAll>
        <TreeNode key="0-1" icon={Icon as any} title="Parent">
          <TreeNode key="0-1-0" icon={Icon as any} title="Child" />
        </TreeNode>
      </Tree>

      <h2>Customize icon with Tree prop</h2>
      <Tree prefixCls="vc-tree" defaultExpandAll icon={Icon as any}>
        <TreeNode key="0-2" title="Parent">
          <TreeNode key="0-2-0" title="Child" />
        </TreeNode>
      </Tree>
    </div>
  )
})
