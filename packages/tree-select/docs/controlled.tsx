import { defineComponent, ref } from 'vue'
import TreeSelect, { TreeNode } from '../src'
import './assets/index.less'

export default defineComponent({
  name: 'TreeSelectControlledDemo',
  setup() {
    const treeExpandedKeys = ref<string[]>([])

    const onTreeExpand = (keys: string[]) => {
      treeExpandedKeys.value = keys
    }

    const setTreeExpandedKeys = () => {
      treeExpandedKeys.value = ['000', '0-1-0']
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Controlled treeExpandedKeys</h2>
        <TreeSelect
          style={{ width: '200px' }}
          treeExpandedKeys={treeExpandedKeys.value as any}
          onTreeExpand={onTreeExpand as any}
        >
          <TreeNode value="000" title="parent 1" key="000">
            <TreeNode value="0-1-0" title="parent 1-0" key="0-1-0">
              <TreeNode value="random" title="my leaf" key="random" />
              <TreeNode value="random1" title="your leaf" key="random1" disabled />
            </TreeNode>
            <TreeNode value="0-1-1" title="parent 1-1" key="0-1-1">
              <TreeNode value="random3" title={<span style={{ color: 'red' }}>sss</span>} key="random3" />
              <TreeNode value="0-1-1-1" title="same txtle" key="0-1-1-1">
                <TreeNode
                  value="0-1-1-1-0"
                  title="same titlexd"
                  key="0-1-1-1-0"
                  style={{ color: 'red', background: 'green' }}
                />
              </TreeNode>
            </TreeNode>
          </TreeNode>
          <TreeNode value="0-2" title="same title" key="0-2">
            <TreeNode value="0-2-0" title="2same title" key="0-2-0" />
          </TreeNode>
          <TreeNode value="0-3" title="same title" key="0-3" />
        </TreeSelect>

        <button type="button" onClick={setTreeExpandedKeys} style={{ marginTop: '10px' }}>
          Set treeExpandedKeys
        </button>
      </div>
    )
  },
})
