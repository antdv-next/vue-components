import type { TreeRef } from '../src'
import { defineComponent, onMounted, ref } from 'vue'
import Tree from '../src'
import './assets/index.less'
import './animation.less'

const defaultExpandedKeys = ['0', '0-2', '0-9-2']

const motion = {
  motionName: 'node-motion',
  motionAppear: false,
  onAppearStart: () => ({ height: 0 }),
  onAppearActive: (node: HTMLElement) => ({ height: node.scrollHeight }),
  onLeaveStart: (node: HTMLElement) => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
}

function getTreeData() {
  return [
    {
      key: '0',
      title: 'node 0',
      children: [
        { key: '0-0', title: 'node 0-0' },
        { key: '0-1', title: 'node 0-1' },
        {
          key: '0-2',
          title: 'node 0-2',
          children: [
            { key: '0-2-0', title: 'node 0-2-0' },
            { key: '0-2-1', title: 'node 0-2-1' },
            { key: '0-2-2', title: 'node 0-2-2' },
          ],
        },
        { key: '0-3', title: 'node 0-3' },
        { key: '0-4', title: 'node 0-4' },
        { key: '0-5', title: 'node 0-5' },
        { key: '0-6', title: 'node 0-6' },
        { key: '0-7', title: 'node 0-7' },
        { key: '0-8', title: 'node 0-8' },
        {
          key: '0-9',
          title: 'node 0-9',
          children: [
            { key: '0-9-0', title: 'node 0-9-0' },
            {
              key: '0-9-1',
              title: 'node 0-9-1',
              children: [
                { key: '0-9-1-0', title: 'node 0-9-1-0' },
                { key: '0-9-1-1', title: 'node 0-9-1-1' },
                { key: '0-9-1-2', title: 'node 0-9-1-2' },
                { key: '0-9-1-3', title: 'node 0-9-1-3' },
                { key: '0-9-1-4', title: 'node 0-9-1-4' },
              ],
            },
            {
              key: '0-9-2',
              title: 'node 0-9-2',
              children: [
                { key: '0-9-2-0', title: 'node 0-9-2-0' },
                { key: '0-9-2-1', title: 'node 0-9-2-1' },
              ],
            },
          ],
        },
      ],
    },
    {
      key: '1',
      title: 'node 1',
      children: [
        {
          key: '1-0',
          title: 'node 1-0',
          children: [
            { key: '1-0-0', title: 'node 1-0-0' },
            {
              key: '1-0-1',
              title: 'node 1-0-1',
              children: [
                { key: '1-0-1-0', title: 'node 1-0-1-0' },
                { key: '1-0-1-1', title: 'node 1-0-1-1' },
              ],
            },
            { key: '1-0-2', title: 'node 1-0-2' },
          ],
        },
      ],
    },
  ]
}

export default defineComponent(() => {
  const treeRef = ref<TreeRef>()
  const enableMotion = ref(true)

  onMounted(() => {
    setTimeout(() => {
      treeRef.value?.scrollTo({ key: '0-9-2' })
    }, 100)
  })

  return () => (
    <div class="animation" style={{ padding: '0 20px' }}>
      <button
        onClick={() => {
          enableMotion.value = !enableMotion.value
        }}
      >
        Motion:
        {' '}
        {String(enableMotion.value)}
      </button>

      <h2>expanded</h2>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 50%' }}>
          <h3>With Virtual</h3>
          <Tree
            ref={treeRef}
            prefixCls="vc-tree"
            defaultExpandAll
            defaultExpandedKeys={defaultExpandedKeys as any}
            motion={enableMotion.value ? motion : undefined}
            height={200}
            itemHeight={20}
            style={{ border: '1px solid #000' }}
            treeData={getTreeData() as any}
          />
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <h3>Without Virtual</h3>
          <Tree
            prefixCls="vc-tree"
            defaultExpandAll={false}
            defaultExpandedKeys={defaultExpandedKeys as any}
            motion={enableMotion.value ? motion : undefined}
            style={{ border: '1px solid #000' }}
            treeData={getTreeData() as any}
          />
        </div>
      </div>
    </div>
  )
})
