import type { TreeRef } from '../src'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import Tree from '../src'

const treeData = [
  {
    key: 'parent',
    title: 'parent',
    children: [{ key: 'child', title: 'child' }],
  },
]

describe('tree.scrollTo', () => {
  it('supports autoExpand', async () => {
    const treeRef = ref<TreeRef>()
    const wrapper = mount(() => <Tree ref={treeRef} treeData={treeData as any} />)

    expect(wrapper.findAll('.vc-tree-treenode[role="treeitem"]')).toHaveLength(1)

    treeRef.value!.scrollTo({ key: 'parent', autoExpand: true })
    await nextTick()

    expect(wrapper.findAll('.vc-tree-treenode[role="treeitem"]')).toHaveLength(2)
  })

  it('autoExpand should not touch controlled expandedKeys', async () => {
    const treeRef = ref<TreeRef>()
    const wrapper = mount(() => (
      <Tree ref={treeRef} treeData={treeData as any} expandedKeys={[]} />
    ))

    treeRef.value!.scrollTo({ key: 'parent', autoExpand: true })
    await nextTick()

    expect(wrapper.findAll('.vc-tree-treenode[role="treeitem"]')).toHaveLength(1)
  })
})
