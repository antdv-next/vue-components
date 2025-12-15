import type { TreeRef } from '../src'
import type { Key } from '../src/interface'
import { defineComponent, reactive, ref } from 'vue'
import Tree, { TreeNode } from '../src'

const treeData = [
  {
    key: '0-0',
    title: 'parent 1',
    children: [
      { key: '0-0-0', title: 'parent 1-1', children: [{ key: '0-0-0-0', title: 'parent 1-1-0' }] },
      {
        key: '0-0-1',
        title: 'parent 1-2',
        children: [
          { key: '0-0-1-0', title: 'parent 1-2-0', disableCheckbox: true },
          { key: '0-0-1-1', title: 'parent 1-2-1' },
          { key: '0-0-1-2', title: 'parent 1-2-2' },
          { key: '0-0-1-3', title: 'parent 1-2-3' },
          { key: '0-0-1-4', title: 'parent 1-2-4' },
          { key: '0-0-1-5', title: 'parent 1-2-5' },
          { key: '0-0-1-6', title: 'parent 1-2-6' },
          { key: '0-0-1-7', title: 'parent 1-2-7' },
          { key: '0-0-1-8', title: 'parent 1-2-8' },
          { key: '0-0-1-9', title: 'parent 1-2-9' },
          { key: 1128, title: 1128 },
        ],
      },
    ],
  },
]

export default defineComponent(() => {
  const keys: Key[] = ['0-0-0-0']
  const state = reactive({
    defaultExpandedKeys: keys,
    defaultSelectedKeys: keys,
    defaultCheckedKeys: keys,
  })

  const selKey = ref<Key | null>(null)
  const treeRef = ref<TreeRef>()

  const onExpand = (expandedKeys: Key[]) => {
    console.log('onExpand', expandedKeys)
  }

  const onSelect = (selectedKeys: Key[], info: any) => {
    console.log('selected', selectedKeys, info)
    selKey.value = info.node.key
  }

  const onCheck = (checkedKeys: any, info: any) => {
    console.log('onCheck', checkedKeys, info)
  }

  const onEdit = (e: MouseEvent) => {
    e.stopPropagation()
    setTimeout(() => {
      console.log('current key:', selKey.value)
    }, 0)
  }

  const onDel = (e: MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('sure to delete?')) {

    }
  }

  return () => {
    const customLabel = (
      <span class="cus-label">
        <span>operations:</span>
        <span style={{ color: 'blue' }} onClick={onEdit}>
          Edit
        </span>
        <label onClick={e => e.stopPropagation()}>
          <input type="checkbox" />
          {' '}
          checked
        </label>
        <span style={{ color: '#EB0000' }} onClick={onDel}>
          Delete
        </span>
      </span>
    )

    return (
      <div style={{ margin: '0 20px' }}>
        <h2>simple</h2>
        <input aria-label="good" />
        <Tree
          prefixCls="vc-tree"
          className="myCls"
          showLine
          checkable
          defaultExpandAll
          defaultExpandedKeys={state.defaultExpandedKeys}
          onExpand={onExpand}
          defaultSelectedKeys={state.defaultSelectedKeys}
          defaultCheckedKeys={state.defaultCheckedKeys}
          onSelect={onSelect}
          onCheck={onCheck}
          onActiveChange={key => console.log('Active:', key)}
        >
          <TreeNode title="parent 1" key="0-0">
            <TreeNode title={customLabel} key="0-0-0">
              <TreeNode title="leaf" key="0-0-0-0" style={{ background: 'rgba(255, 0, 0, 0.1)' }} />
              <TreeNode title="leaf" key="0-0-0-1" />
            </TreeNode>
            <TreeNode title="parent 1-1" key="0-0-1">
              <TreeNode title="parent 1-1-0" key="0-0-1-0" disableCheckbox />
              <TreeNode title="parent 1-1-1" key="0-0-1-1" />
            </TreeNode>
            <TreeNode title="parent 1-2" key="0-0-2" disabled>
              <TreeNode title="parent 1-2-0" key="0-0-2-0" checkable={false} />
              <TreeNode title="parent 1-2-1" key="0-0-2-1" />
            </TreeNode>
          </TreeNode>
        </Tree>

        <h2>Check on Click TreeNode</h2>
        <Tree
          prefixCls="vc-tree"
          className="myCls"
          showLine
          checkable
          selectable={false}
          defaultExpandAll
          onExpand={onExpand}
          defaultSelectedKeys={state.defaultSelectedKeys}
          defaultCheckedKeys={state.defaultCheckedKeys}
          onSelect={onSelect}
          onCheck={onCheck}
          treeData={treeData as any}
        />

        <h2>Select</h2>
        <Tree
          ref={treeRef}
          prefixCls="vc-tree"
          className="myCls"
          defaultExpandAll
          treeData={treeData as any}
          onSelect={onSelect}
          height={150}
          itemHeight={24}
        />

        <button
          type="button"
          onClick={() => {
            setTimeout(() => {
              console.log('scroll!!!')
              treeRef.value?.scrollTo({ key: '0-0-1-9' })
            }, 100)
          }}
        >
          Scroll Last
        </button>
      </div>
    )
  }
})
