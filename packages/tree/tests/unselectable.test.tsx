import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Tree, { TreeNode } from '../src'

function findNode(wrapper: ReturnType<typeof mount>, title: string) {
  return wrapper
    .findAll('.vc-tree-treenode[role="treeitem"]')
    .find(node => node.text().includes(title))!
}

describe('tree unselectable class', () => {
  it('selectable={false} should show unselectable class in non-checkable mode', () => {
    const wrapper = mount(() => (
      <Tree defaultExpandAll>
        <TreeNode key="normal" title="Normal" />
        <TreeNode key="selectable-false" title="Selectable False" selectable={false} />
        <TreeNode key="disabled" title="Disabled" disabled />
      </Tree>
    ))

    expect(findNode(wrapper, 'Normal').classes()).not.toContain('vc-tree-treenode-unselectable')
    expect(findNode(wrapper, 'Selectable False').classes()).toContain(
      'vc-tree-treenode-unselectable',
    )
    expect(findNode(wrapper, 'Disabled').classes()).toContain('vc-tree-treenode-disabled')
  })

  it('selectable={false} should not show unselectable class in checkable mode', () => {
    const wrapper = mount(() => (
      <Tree defaultExpandAll checkable>
        <TreeNode key="normal" title="Normal" />
        <TreeNode key="selectable-false" title="Selectable False" selectable={false} />
      </Tree>
    ))

    // In checkable mode the checkbox already indicates it's not selectable
    expect(findNode(wrapper, 'Selectable False').classes()).not.toContain(
      'vc-tree-treenode-unselectable',
    )
  })

  it('tree level selectable={false} should mark every node unselectable', () => {
    const wrapper = mount(() => (
      <Tree
        defaultExpandAll
        selectable={false}
        treeData={[{ key: 'parent', title: 'parent', children: [{ key: 'child', title: 'child' }] }] as any}
      />
    ))

    wrapper.findAll('.vc-tree-treenode[role="treeitem"]').forEach((node) => {
      expect(node.classes()).toContain('vc-tree-treenode-unselectable')
    })
  })
})
